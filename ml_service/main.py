import torch
import pymongo
from pymongo import MongoClient
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageFile, ExifTags
import cv2
import dlib
from yoloV8 import YOLOv8_face
from scipy.spatial import distance as dist
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
import os
import glob
import torchvision.transforms as transforms
import io
from model import FaceNetModel
from datetime import datetime, timedelta
import numpy as np
import fitz
import requests
import tempfile
import asyncio
import logging
import httpx
from concurrent.futures import ThreadPoolExecutor
import asyncio
from functools import partial
from dateutil import parser

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

class DuplicateEntryError(Exception):
    pass

def cleanup_debug_files(fullname, group):
    pattern = os.path.join(DEBUG_DIR, f"face_*_image_*_*")
    for file in glob.glob(pattern):
        try:
            os.remove(file)
            logging.info(f"Deleted debug file: {file}")
        except Exception as e:
            logging.error(f"Error deleting debug file {file}: {str(e)}")

load_dotenv()
PW_KEY = os.environ.get("PW_KEY")
mongodb_username = os.environ.get("MONGODB_USERNAME")
mongodb_password = os.environ.get("MONGODB_PASSWORD")
mongodb_host = os.environ.get("MONGODB_HOST")

TEMP_DIR = "temp_files"
PROCESSED_TEMP_DIR = "processed_temp_files"
DEBUG_DIR = "./images/temp/debug"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(PROCESSED_TEMP_DIR, exist_ok=True)
os.makedirs(DEBUG_DIR, exist_ok=True)

ImageFile.LOAD_TRUNCATED_IMAGES = True

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(pretrained=True):
    model = FaceNetModel()
    if pretrained:
        # checkpoint = torch.load('./models/models_0711.pth')
        # checkpoint = torch.load('./models/model920-6be7e3e9.pth')
        checkpoint = torch.load('./models/models_0821_50.pth')
        model.load_state_dict(checkpoint['state_dict'])
    return model

# def load_model(pretrained=True):
#     model = FaceNetModel()
#     if pretrained:
#         checkpoint = torch.load('./models/model_weights.pth')
#         model.load_state_dict(checkpoint)
#     return model

model = load_model()
model = model.to(device)
model.eval()

def correct_orientation(image):
    try:
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        exif = dict(image._getexif().items())

        if exif[orientation] == 3:
            image = image.rotate(180, expand=True)
        elif exif[orientation] == 6:
            image = image.rotate(270, expand=True)
        elif exif[orientation] == 8:
            image = image.rotate(90, expand=True)

    except (AttributeError, KeyError, IndexError):
        # In case of errors, the image is returned as is
        pass
    return image

def preprocess_image(image):
    image = image.convert("RGB")
    
    preprocess = transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    input_tensor = preprocess(image)
    input_tensor = input_tensor.to(device)
    input_batch = input_tensor.unsqueeze(0)
    
    # logging.debug(f"Image shape after preprocessing: {input_batch.shape}")
    return input_batch

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def detect_face(image, predictor_path="models/shape_predictor_68_face_landmarks.dat", model_path="models/yolov8n-face.onnx"):
    open_cv_image = np.array(image)
    open_cv_image = open_cv_image[:, :, ::-1].copy()  # Convert RGB to BGR

    # Initialize YOLOv8_face model
    yolo_face_detector = YOLOv8_face(model_path, conf_thres=0.45, iou_thres=0.5)
    
    # Use YOLOv8 to detect faces
    bboxes, confidences, classIds, landmarks = yolo_face_detector.detect(open_cv_image)

    if len(bboxes) == 0:
        print("Failed in face count check. Detected 0 faces.")
        return 0, None, False

    # Extract the first detected face
    first_face = bboxes[0].astype(int)  # Assumed to be in [x1, y1, w, h] format
    x1, y1, w, h = first_face
    face_image = open_cv_image[y1:y1+h, x1:x1+w]
    face_image_pil = Image.fromarray(face_image)

    # Dlib facial landmark detection (as in the original)
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(predictor_path)
    
    gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
    rects = detector(gray, 0)

    if len(rects) == 0:
        print("Failed in dlib face detection check.")
        return 1, face_image_pil, False

    shape = predictor(gray, rects[0])
    shape = np.array([(shape.part(i).x, shape.part(i).y) for i in range(68)])

    leftEye = shape[42:48]
    rightEye = shape[36:42]

    leftEAR = eye_aspect_ratio(leftEye)
    rightEAR = eye_aspect_ratio(rightEye)
    ear = (leftEAR + rightEAR) / 2.0

    EYE_AR_THRESH = 0.1

    if ear <= EYE_AR_THRESH:
        print(f"Failed in eye aspect ratio check. EAR: {ear:.2f}, Threshold: {EYE_AR_THRESH}")
        return 1, face_image_pil, False

    return 1, face_image_pil, True


def parse_pdf_name(pdf_name: str):
    base_name = os.path.basename(pdf_name).replace('.pdf', '')
    
    if '-' in base_name:
        fullname, group = base_name.split('-')
    else:
        fullname = base_name
        group = 'default_group'
        
    print(f"Fullname: {fullname}, Group: {group}")
    
    return fullname.strip(), group.strip()

def extract_images_from_pdf(pdf_path, temp_dir):
    # logging.info(f"Extracting images from {pdf_path}")
    pdf_doc = fitz.open(pdf_path)
    image_paths = []
    for i in range(len(pdf_doc)):
        for img in pdf_doc.get_page_images(i):
            xref = img[0]
            base_image = pdf_doc.extract_image(xref)
            image_bytes = base_image["image"]
            
            # Save as PNG first
            img_filename = os.path.join(temp_dir, f"image_{i}_{xref}.png")
            with open(img_filename, "wb") as img_file:
                img_file.write(image_bytes)
            
            # Convert PNG to JPG
            png_image = Image.open(img_filename)
            rgb_im = png_image.convert('RGB')
            jpg_filename = os.path.join(temp_dir, f"image_{i}_{xref}.jpg")
            rgb_im.save(jpg_filename, 'JPEG')
            
            image_paths.append(jpg_filename)
            # logging.info(f"Extracted and converted image to {jpg_filename}")
            
            # Log image details
            # with Image.open(jpg_filename) as img:
            #     logging.debug(f"Image size: {img.size}, mode: {img.mode}")
    
    return image_paths


async def process_image(image_path: str, fullname: str, group: str) -> bool:
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if it's not already
            img = img.convert('RGB')

            # Convert to OpenCV format
            open_cv_image = np.array(img)
            open_cv_image = open_cv_image[:, :, ::-1]  # Convert RGB to BGR for YOLO

            # Initialize YOLOv8_face model
            yolo_face_detector = YOLOv8_face("models/yolov8n-face.onnx", conf_thres=0.45, iou_thres=0.5)

            # Use YOLOv8 to detect faces
            bboxes, confidences, classIds, landmarks = yolo_face_detector.detect(open_cv_image)
            
            if len(bboxes) > 0:
                for i, bbox in enumerate(bboxes):
                    # Extract face using the bounding box
                    x1, y1, w, h = bbox.astype(int)
                    face = img.crop((x1, y1, x1 + w, y1 + h))

                    # Save the face image for debugging or further use
                    face_debug_path = os.path.join(DEBUG_DIR, f"face_{i}_{os.path.basename(image_path)}")
                    face.save(face_debug_path)
                    logging.info(f"Saved detected face to {face_debug_path}")
                    
                    # Call the API with the face image
                    status_code, response = await post_image_to_api(fullname, group, face_debug_path)
                    logging.info(f"API response: {status_code}, {response}")

                    if status_code == 409:
                        logging.warning(f"Duplicate entry detected for {fullname} in group {group}")
                        return False
                    elif status_code != 200:
                        logging.error(f"Error from API: {response}")
                        return False
                return True
            else:
                logging.warning(f"No faces detected in {image_path}")
                return False
    except Exception as e:
        logging.error(f"Error processing image {image_path}: {str(e)}", exc_info=True)
        return False

    # url = f'{base_url}/api/register'
    # async with httpx.AsyncClient() as client:
    #     try:
    #         response = await client.get(url, timeout=10)
    #         print(f"Test Connection Status Code: {response.status_code}")
    #         print(f"Test Connection Response: {response.text}")
    #         return {"status_code": response.status_code, "response_text": response.text}
    #     except httpx.RequestError as e:
    #         print(f"Test Connection Failed: {e}")
    #         return {"error": str(e)}
# Post image data to /api/register
async def post_image_to_api(name: str, group: str, image_path: str):
    url = f"{base_url}/api/register/pdf"
    # logging.debug(f"Posting image to URL: {url}")
    
    async with httpx.AsyncClient() as client:
        with open(image_path, "rb") as img_file:
            files = {'image': ('image.jpg', img_file, 'image/jpeg')}
            data = {'name': name, 'group': group}
            # logging.debug(f"Sending data: {data}")
            try:
                response = await client.post(url, data=data, files=files)
                # logging.debug(f"Response Status Code: {response.status_code}")
                # logging.debug(f"Response Text: {response.text}")
                return response.status_code, response.text
            except httpx.RequestError as e:
                logging.error(f"Request failed: {e}")
                return None, str(e)

# Main workflow
async def process_pdf_and_register(pdf_path: str):
    fullname, group = parse_pdf_name(pdf_path)
    # logging.info(f"Processing PDF for: Fullname: {fullname}, Group: {group}")

    try:
        async with asyncio.Lock():  # Ensure thread-safe access to shared resources
            with tempfile.TemporaryDirectory(dir=TEMP_DIR) as temp_dir:
                image_paths = extract_images_from_pdf(pdf_path, temp_dir)
                # logging.info(f"Extracted {len(image_paths)} images from PDF")
                
                tasks = [process_image(image_path, fullname, group) for image_path in image_paths]
                results = await asyncio.gather(*tasks)

                processed_faces = sum(results)
                total_faces = len(results)
                duplicate_faces = total_faces - processed_faces
                
                if processed_faces == 1:
                    # cleanup_debug_files(fullname, group)
                    return {"status": "success", "message": f"Registered 1 face: {fullname} - {group}.", "name": fullname, "group": group}
                elif processed_faces > 1:
                    # cleanup_debug_files(fullname, group)
                    return {"status": "failure", "message": "Multiple faces found in the PDF. Please provide a single face."}
                elif duplicate_faces > 0:
                    # cleanup_debug_files(fullname, group)
                    return {"status": "duplicate", "message": f"Face already registered for {fullname} in group {group}."}
                else:
                    logging.warning("No faces found in any image.")
                    return {"status": "failure", "message": "No face found in any image."}
    finally:
        cleanup_debug_files(fullname, group)


def calculate_distance(features1, features2):
    features1 = np.array(features1).flatten()
    features2 = np.array(features2).flatten()
    return np.linalg.norm(features1 - features2)

def log_attendance(name, group, image_data, attended, date):
    timestamp = datetime.now()
    attendance_doc = {"name": name, "group": group, "timestamp": timestamp, "attended": attended}
    attendance_collection.insert_one(attendance_doc)
    if not os.path.exists('images'):
        os.makedirs('images')
    attend_dir = os.path.join('images', 'attend')
    if not os.path.exists(attend_dir):
        os.makedirs(attend_dir)

    year_dir = os.path.join(attend_dir, str(timestamp.year))
    if not os.path.exists(year_dir):
        os.makedirs(year_dir)
    month_dir = os.path.join(year_dir, str(timestamp.month))
    if not os.path.exists(month_dir):
        os.makedirs(month_dir)
    date_dir = os.path.join(month_dir, str(timestamp.day))
    if not os.path.exists(date_dir):
        os.makedirs(date_dir)
    
    image_filename = f"{date_dir}/{name}-{group}-{timestamp.hour}-{timestamp.minute}-{timestamp.second}.jpg"
    print(f"Saving image to {image_filename}")  
    if os.access(os.path.dirname(image_filename), os.W_OK):
        with open(image_filename, "wb") as image_file:
            image_file.write(image_data)
    else:
        print(f"Cannot write to {image_filename}")

def lookup_in_database(predicted_class):
    user_doc = students_collection.find_one({"class": predicted_class})
    if user_doc is not None:
        return user_doc["name"], user_doc["group"]
    return "Unknown", "Unknown"

app = FastAPI()
security = HTTPBasic()
# client = MongoClient(f"mongodb://{mongodb_username}:{mongodb_password}@mongodb_container:27017/")
client = MongoClient(f"mongodb+srv://{mongodb_username}:{mongodb_password}@{mongodb_host}/")
# client = MongoClient("mongodb://localhost:27017/")
db = client["attendance"]
students_collection = db["students"]
attendance_collection = db["attendance"]
# admins_collection = db["admins"]
groups_collection = db['groups']

students_collection.create_index([("name", 1), ("group", 1)], unique=True)

origins = [
    "http://localhost:3000",
    "https://attendance-app-frontend-18592.vercel.app",
    #  "http://localhost:8000",# React app in dev mode
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_url = "http://localhost:8000"

@app.on_event("startup")
async def migrate_groups():
    distinct_groups = students_collection.distinct("group")
    for group_name in distinct_groups:
        group_name = group_name.lower()
        existing_group = groups_collection.find_one({"name": group_name})
        if not existing_group:
            groups_collection.insert_one({"name": group_name})

    print("Groups migration successful")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app = FastAPI()

TEMP_DIR = "temp_files"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/api/register_from_pdf")
async def register_from_pdf(pdf_file: UploadFile = File(...)):
    try:
        original_filename = pdf_file.filename
        temp_pdf_path = os.path.join(TEMP_DIR, original_filename)
        
        logging.info(f"Saving PDF to {temp_pdf_path}")
        
        content = await pdf_file.read()
        with open(temp_pdf_path, 'wb') as temp_pdf:
            temp_pdf.write(content)
        
        result = await process_pdf_and_register(temp_pdf_path)
        
        os.remove(temp_pdf_path)
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Almost the same as the /api/register
@app.post("/api/register/pdf")
async def register(name: str = Form(...), group: str = Form(...), image: UploadFile = File(...)):    
    try:
        name = name.lower()
        group = group.lower()
        image_data = await image.read()
        image = Image.open(io.BytesIO(image_data))

        print(f"Name: {name}, Group: {group}, Image: {image.filename}")
        # Correct the image orientation and detect the face
        # num_faces, image = detect_face(image)
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        
        if torch.cuda.is_available():
            input_batch = input_batch.to('cuda')
            model.to('cuda')

        with torch.no_grad():
            features = model(input_batch)

        if not os.path.exists('images'):
            os.makedirs('images')
        registered_dir = os.path.join('images', 'registered')
        if not os.path.exists(registered_dir):
            os.makedirs(registered_dir)
        
        group_dir = os.path.join('images', 'registered', group)
        if not os.path.exists(group_dir):
            os.makedirs(group_dir)

        image_filename = f"{group_dir}/{name}-{group}.jpg"
        print(f"Saving image to {image_filename}")  
        if os.access(os.path.dirname(image_filename), os.W_OK):
            byte_arr = io.BytesIO()
            image.save(byte_arr, format='JPEG') 
            byte_arr = byte_arr.getvalue()

            with open(image_filename, "wb") as image_file:
                image_file.write(byte_arr)

        else:
            print(f"Cannot write to {image_filename}")
        
        existing_group = groups_collection.find_one({"name": group})
        if not existing_group:
            groups_collection.insert_one({"name": group})

        user_doc = {"name": name, "group": group, "features": features.tolist()}
        result = students_collection.insert_one(user_doc)
        
        if not result.acknowledged:
            raise DuplicateEntryError("User with this name and group already exists.")

        return JSONResponse(content={"status": "success", "features": features.tolist(), "message": "Registration successful."}, status_code=200)
    except pymongo.errors.DuplicateKeyError:
        raise HTTPException(status_code=409, detail="User with this name and group already exists.")
    except DuplicateEntryError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register")
async def register(name: str = Form(...), group: str = Form(...), image: UploadFile = File(...)):
    try:
        name = name.lower()
        group = group.lower()
        image_data = await image.read()
        image = Image.open(io.BytesIO(image_data))

        print(f"Name: {name}, Group: {group}, Image: {image.filename}")
        
        # Correct the image orientation and detect the face
        image = correct_orientation(image)
        num_faces, image, _ = detect_face(image)
        
        if num_faces > 1:
            return JSONResponse(content={"status": "error", "message": "More than one face detected. Please provide a single face."}, status_code=418)
        elif image is None:
            return JSONResponse(content={"status": "error", "message": "Face not found"}, status_code=418)
        
        input_batch = preprocess_image(image)
        
        with torch.no_grad():
            features = model(input_batch)

        # Save the registered image
        if not os.path.exists('images'):
            os.makedirs('images')
        registered_dir = os.path.join('images', 'registered')
        if not os.path.exists(registered_dir):
            os.makedirs(registered_dir)
        
        group_dir = os.path.join('images', 'registered', group)
        if not os.path.exists(group_dir):
            os.makedirs(group_dir)

        image_filename = f"{group_dir}/{name}-{group}.jpg"
        print(f"Saving image to {image_filename}")  
        if os.access(os.path.dirname(image_filename), os.W_OK):
            byte_arr = io.BytesIO()
            image.save(byte_arr, format='JPEG') 
            byte_arr = byte_arr.getvalue()

            with open(image_filename, "wb") as image_file:
                image_file.write(byte_arr)
        else:
            print(f"Cannot write to {image_filename}")
        
        # Insert or update group
        existing_group = groups_collection.find_one({"name": group})
        if not existing_group:
            groups_collection.insert_one({"name": group})

        # Insert user data into the database
        user_doc = {"name": name, "group": group, "features": features.squeeze().tolist()}
        students_collection.insert_one(user_doc)
        
        return JSONResponse(content={"status": "success", "features": features.squeeze().tolist(), "message": "Registration successful."}, status_code=200)
    
    except pymongo.errors.DuplicateKeyError:
        return JSONResponse(content={"status": "error", "message": "User with this name and group already exists."}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

@app.post("/api/recognize")
async def recognize(image_data: UploadFile = File(...)):
    try:
        image_data = await image_data.read()
        image = Image.open(io.BytesIO(image_data))

        # Correct the image orientation and detect the face
        image = correct_orientation(image)
        
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        
        if torch.cuda.is_available():
            input_batch = input_batch.to('cuda')
            model.to('cuda')
        
        # Use RetinaFace for face detection
        num_faces, image, is_live = detect_face(image)

        if image is None:
            return JSONResponse(content={"status": "error", "message": "No face detected"}, status_code=477)
        elif num_faces > 1:
            return JSONResponse(content={"status": "error", "message": "More than one face detected"}, status_code=478)
        elif not is_live:
            # return JSONResponse(content={"status": "error", "message": "Liveness detection failed"}, status_code=479)
            pass
        
        with torch.no_grad():
            output = model(input_batch)
        features = output.squeeze().tolist()

        min_distance = float('inf')
        recognized_name = "Unknown"
        recognized_group = "Unknown"
        
        # Compare detected face features with stored student features
        for user_doc in students_collection.find():
            user_features = user_doc["features"]
            dist = calculate_distance(features, user_features)
            if dist < min_distance:
                min_distance = dist
                recognized_name = user_doc["name"]
                recognized_group = user_doc["group"]
        
        # Set a recognition threshold
        threshold = 1.3
        if min_distance > threshold:
            recognized_name = "Unknown"
            recognized_group = "Unknown"
        else:
            current_time = datetime.now()
            last_attendance_record = attendance_collection.find_one({"name": recognized_name}, sort=[("timestamp", -1)])
            
            if last_attendance_record is not None:
                last_attendance_time = last_attendance_record["timestamp"]
                time_difference = current_time - last_attendance_time
                if time_difference.total_seconds() < 3600:
                    next_allowed_attempt = last_attendance_time + timedelta(hours=1)
                    return JSONResponse(content={
                        "status": "failed", 
                        "recognized_name": recognized_name,
                        "name": "Attendance canceled", 
                        "group": "",
                        "distance": min_distance,
                        "nextAllowedAttempt": next_allowed_attempt.isoformat(),
                    })
                    
        return JSONResponse(content={
            "name": recognized_name, 
            "group": recognized_group, 
            "features": features, 
            "distance": min_distance,
        })
    
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})
    
@app.post("/api/mark")
async def mark_attendance(name: str = Form(...), group: str = Form(...), image_data: UploadFile = File(...), attended: bool = Form(...), date: str = datetime.now().isoformat()):
    try:
        image_data = await image_data.read()
        parsed_date = parser.isoparse(date)
        log_attendance(name, group, image_data, attended, parsed_date)
        print(f"Marked attendance for {name} in group {group} on {parsed_date} as {attended}")
        return {"status": "success", "message": f"Attendance for {name} in group {group} marked as {attended} on {parsed_date}."}
    except Exception as e:
        print(f"Error marking attendance: {str(e)}")
        return {"status": "error", "message": str(e)}
