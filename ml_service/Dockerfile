# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set the working directory in the container to /app
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libgl1-mesa-dev \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

# Uninstall bson and pymongo, install dependencies and then reinstall pymongo
RUN pip uninstall -y bson pymongo
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pymongo gdown

# Copy application code
COPY . /app

# Download the model
RUN mkdir -p models && \
    gdown --id '1YhzAGQhLVIVWzAD03NQJ4tyliS8BJNSa' -O models/models_0821_50.pth && \
    gdown --id '1tTdBnMChsVlwhQKk6jZeV83kypnCHa9y' -O models/shape_predictor_68_face_landmarks.dat && \
    gdown --id '1pfsJrWrLT8Oz3qIQiljBFVDO0HAh-ogc' -O models/yolov8n-face.onnx

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run app with shell script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]