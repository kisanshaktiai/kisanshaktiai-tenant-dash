# NDVI Harvest & Cache System

Production-ready NDVI processing system for multi-tenant SaaS AgriTech platform.

## Architecture

- **Python Worker**: Fetches Sentinel-2 data from Microsoft Planetary Computer
- **Supabase Backend**: Stores metadata, manages jobs, handles tenant isolation
- **React Frontend**: Tenant portal UI for triggering and monitoring harvests
- **Storage**: Supabase Storage for NDVI GeoTIFF files

## Quick Start

### 1. Database Setup
The migration has already been applied creating:
- `mgrs_tiles`: MGRS tile lookup for India
- `satellite_tiles`: Cached NDVI data
- `system_jobs`: Job tracking
- `harvest_queue`: Processing queue

### 2. Deploy Worker

```bash
# Build Docker image
cd ndvi-harvest-worker
docker build -t ndvi-worker .

# Run locally for testing
docker run --env-file .env ndvi-worker --tenant-id <UUID> --tile-ids 43RFN

# Deploy to Cloud Run
gcloud run deploy ndvi-worker \
  --image gcr.io/PROJECT/ndvi-worker \
  --set-env-vars SUPABASE_URL=$SUPABASE_URL,SUPABASE_SERVICE_KEY=$KEY \
  --memory 2Gi \
  --timeout 900
```

### 3. Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
STORAGE_BUCKET=satellite-tiles
CLOUD_COVER_THRESHOLD=20
MAX_TILES_PER_RUN=10
RETENTION_DAYS=30
```

### 4. Cron Schedule

```cron
# Run harvest every 5 days at 2 AM
0 2 */5 * * docker run ndvi-worker --all-tiles --cleanup

# Staggered runs for different tenants
0 2 */5 * * docker run ndvi-worker --tenant-id TENANT1 --all-tiles
0 3 */5 * * docker run ndvi-worker --tenant-id TENANT2 --all-tiles
```

## API Endpoints

### Trigger Harvest
```javascript
await supabase.functions.invoke('ndvi-harvest', {
  body: {
    action: 'trigger_harvest',
    tenant_id: 'uuid',
    tile_ids: ['43RFN', '43RGN']
  }
})
```

### Get Status
```javascript
await supabase.functions.invoke('ndvi-harvest', {
  body: {
    action: 'get_harvest_status',
    tenant_id: 'uuid'
  }
})
```

## Quota Limits

| Plan | Monthly Harvests | Storage |
|------|-----------------|---------|
| Kisan_Basic | 100 | 50 GB |
| Shakti_Growth | 500 | 200 GB |
| AI_Enterprise | 1000 | 500 GB |

## Security

- RLS policies enforce tenant isolation
- Service role required for worker operations
- Signed URLs for file access (24hr expiry)
- Checksum validation for data integrity

## Monitoring

- Check `system_jobs` table for job status
- Monitor storage usage via dashboard
- Alert thresholds: >5% failure rate, >80% storage

## Cost Control

- `CLOUD_COVER_THRESHOLD`: Skip high cloud scenes
- `RETENTION_DAYS`: Auto-cleanup old data
- `MAX_TILES_PER_RUN`: Limit concurrent processing

## Troubleshooting

1. **Quota Exceeded**: Check `check_harvest_quota()` function
2. **Storage Full**: Run cleanup or increase plan limits
3. **Failed Jobs**: Check `system_jobs.error_message`
4. **Slow Processing**: Reduce `MAX_TILES_PER_RUN`

## Production Checklist

- [ ] Service key stored securely
- [ ] Storage bucket created with proper CORS
- [ ] Cloud Run deployed with adequate memory
- [ ] Monitoring alerts configured
- [ ] Backup strategy for critical tiles
- [ ] Rate limiting configured