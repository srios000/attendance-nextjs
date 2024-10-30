# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

# Install system dependencies including cmake
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libgl1-mesa-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

# Uninstall bson and pymongo
RUN pip uninstall -y bson pymongo

# Upgrade pip
RUN pip install --upgrade pip

# Install dlib separately first
RUN pip install dlib==19.24.0

# Install other Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pymongo gdown

# Copy application code
COPY . /app

# Download the model
RUN mkdir -p models && \
    gdown --id '1YhzAGQhLVIVWzAD03NQJ4tyliS8BJNSa' -O models/models_0821_50.pth && \
    gdown --id '1tTdBnMChsVlwhQKk6jZeV83kypnCHa9y' -O models/shape_predictor_68_face_landmarks.dat && \
    gdown --id '1pfsJrWrLT8Oz3qIQiljBFVDO0HAh-ogc' -O models/yolov8n-face.onnx

# Make port available to the world outside this container
ENV PORT=8000
EXPOSE 8000

# Run main.py when the container launches
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]