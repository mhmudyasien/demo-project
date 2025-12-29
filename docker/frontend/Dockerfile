# FROM python:3.11-slim

# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY app.py .

# EXPOSE 8501
# CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]


# Use official Python slim image
FROM python:3.11-slim

# Prevent Python bytecode cache and force unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    STREAMLIT_SERVER_PORT=8501

# Set working directory
WORKDIR /app

# Install only runtime dependencies (no build tools needed for streamlit)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app.py .

# Create non-root user (Kubernetes best practice)
RUN addgroup --system app && adduser --system --ingroup app app
RUN chown -R app:app /app
USER app

# Expose Streamlit's default port
EXPOSE 8501

# Run Streamlit in headless/server mode
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]



