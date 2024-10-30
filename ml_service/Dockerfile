# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

# Copy only requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

# Uninstall bson and pymongo, install dependencies and then reinstall pymongo
RUN pip uninstall -y bson
RUN pip uninstall -y pymongo
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pymongo gdown

RUN apt-get update && apt-get install -y \
    libgl1-mesa-dev \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add the current directory contents into the container at /app
COPY . /app

# RUN python /app/addadmin.py

# Download the model
RUN mkdir -p models && gdown --id '1YhzAGQhLVIVWzAD03NQJ4tyliS8BJNSa' -O models/models_0821_50.pth && gdown --id '1tTdBnMChsVlwhQKk6jZeV83kypnCHa9y' -O models/shape_predictor_68_face_landmarks.dat && gdown --id '1pfsJrWrLT8Oz3qIQiljBFVDO0HAh-ogc' -O models/yolov8n-face.onnx

# Make port available to the world outside this container
EXPOSE 8000

# Running the shell as the main process
# CMD ["/bin/bash"]

# Run main.py when the container launches
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
