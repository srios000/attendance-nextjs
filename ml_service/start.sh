#!/bin/bash

# Default port ke 8000 jika PORT tidak di-set
export PORT="${PORT:-8000}"

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"