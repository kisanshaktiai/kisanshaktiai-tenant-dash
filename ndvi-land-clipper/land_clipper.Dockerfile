# Use stable GDAL build
FROM osgeo/gdal:ubuntu-full-3.6.3

ARG BUILDTIME
ARG VERSION
ARG REVISION

LABEL org.opencontainers.image.title="Land Clipper Worker" \
      org.opencontainers.image.description="Clips satellite tiles to land boundaries and computes NDVI/EVI/NDWI/SAVI" \
      org.opencontainers.image.vendor="KisanShakti" \
      org.opencontainers.image.created="${BUILDTIME}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${REVISION}"

# Install Python and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip python3-dev python3-matplotlib libgeos-dev build-essential curl ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# Create non-root user
RUN groupadd -r -g 1000 worker && \
    useradd -r -u 1000 -g worker -d /home/worker -s /bin/bash -m worker

# Copy requirements and install
COPY requirements.txt .
RUN python3 -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python3 -m pip install --no-cache-dir -r requirements.txt && \
    python3 -m pip cache purge

# Copy worker code
COPY --chown=worker:worker land_clipper_worker.py .

RUN chown -R worker:worker /app && chmod -R 755 /app
USER worker

# Environment optimizations
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONIOENCODING=utf-8 \
    GDAL_CACHEMAX=256 \
    GDAL_DISABLE_READDIR_ON_OPEN=TRUE \
    GDAL_HTTP_TIMEOUT=30 \
    GDAL_HTTP_CONNECTTIMEOUT=10 \
    CPL_VSIL_CURL_ALLOWED_EXTENSIONS=.tif,.TIF,.tiff,.TIFF,.jp2,.JP2 \
    CPL_VSIL_CURL_CACHE_SIZE=25000000 \
    DEBIAN_FRONTEND=noninteractive \
    TZ=Etc/UTC  

# Healthcheck: ensure rasterio + shapely load properly
HEALTHCHECK --interval=30s --timeout=15s --start-period=10s --retries=3 \
    CMD python3 -c "import rasterio, shapely; import sys; sys.exit(0)"

# Entrypoint
ENTRYPOINT ["python3", "land_clipper_worker.py"]
CMD ["--max-jobs", "10"]
