FROM osgeo/gdal:ubuntu-small-3.7.2

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY harvest_worker.py .

# Create non-root user
RUN useradd -m -u 1000 worker && chown -R worker:worker /app
USER worker

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GDAL_CACHEMAX=512
ENV GDAL_DISABLE_READDIR_ON_OPEN=TRUE
ENV CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,.TIF,.tiff,.TIFF,.jp2,.JP2

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import sys; sys.exit(0)"

# Run the worker
ENTRYPOINT ["python3", "harvest_worker.py"]
