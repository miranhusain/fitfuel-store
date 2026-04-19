#!/bin/bash
cd "$(dirname "$0")/backend"
PORT=${PORT:-8080}
echo "🚀 Starting FitFuel Store on port $PORT..."
PORT=$PORT node src/index.js
