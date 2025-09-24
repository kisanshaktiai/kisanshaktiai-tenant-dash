FROM FROM osgeo/gdal:ubuntu-small-latest

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    python3-matplotlib \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY land_clipper_requirements.txt .

# Install Python packages
RUN pip3 install --no-cache-dir -r land_clipper_requirements.txt

# Copy application code
COPY land_clipper_worker.py .

# Create non-root user
RUN useradd -m -u 1000 worker && chown -R worker:worker /app
USER worker

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GDAL_CACHEMAX=256
ENV GDAL_DISABLE_READDIR_ON_OPEN=TRUE
ENV CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,.TIF,.tiff,.TIFF

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import sys; import rasterio; import shapely; sys.exit(0)"

# Run the worker
ENTRYPOINT ["python3", "land_clipper_worker.py"]
CMD ["--max-jobs", "10"]
