#!/bin/bash

# Default port ke 8080 jika PORT tidak di-set
export PORT="${PORT:-8080}"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"