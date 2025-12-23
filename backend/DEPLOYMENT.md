# Deployment Guide

This guide explains how to deploy the AI-Powered Smart CNG Pump Appointment System.

## Prerequisites

Before deploying, ensure you have:

1. A Linux server (Ubuntu 20.04 LTS recommended)
2. Docker and Docker Compose installed
3. A domain name (optional but recommended)
4. SSL certificate (Let's Encrypt recommended)

## System Requirements

- Minimum 2 CPU cores
- Minimum 4GB RAM
- Minimum 20GB disk space
- PostgreSQL 13+
- Redis 6+
- Python 3.9+

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smart-pump-system
   ```

2. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. Build and start services:
   ```bash
   docker-compose up -d
   ```

4. Initialize the database:
   ```bash
   docker-compose exec backend python init_db.py
   ```

### Option 2: Manual Installation

1. Install system dependencies:
   ```bash
   sudo apt update
   sudo apt install python3.9 python3.9-venv python3.9-dev postgresql postgresql-contrib redis
   ```

2. Set up PostgreSQL:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE smart_pump_db;
   CREATE USER smart_pump_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE smart_pump_db TO smart_pump_user;
   \q
   ```

3. Set up the backend:
   ```bash
   cd backend
   python3.9 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Start the application:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

7. Start Celery workers (in separate terminals):
   ```bash
   celery -A celery_app worker --loglevel=info
   celery -A celery_app beat --loglevel=info
   ```

## Environment Variables

The following environment variables must be configured:

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:password@localhost:5432/dbname |
| SECRET_KEY | JWT secret key | a-long-random-string |
| TWILIO_ACCOUNT_SID | Twilio account SID | ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| TWILIO_AUTH_TOKEN | Twilio auth token | your_twilio_auth_token |
| GOOGLE_MAPS_API_KEY | Google Maps API key | your_google_maps_api_key |
| RAZORPAY_KEY_ID | Razorpay key ID | rzp_test_XXXXXXXXXXXXXX |
| RAZORPAY_SECRET | Razorpay secret | your_razorpay_secret |
| REDIS_URL | Redis connection string | redis://localhost:6379/0 |

## SSL Configuration

For production deployments, configure SSL using Let's Encrypt:

1. Install Certbot:
   ```bash
   sudo apt install certbot
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. Configure your reverse proxy (Nginx/Apache) to use the certificate.

## Monitoring and Logging

The application uses Python's standard logging module. Logs are written to:

- `/var/log/smart-pump/app.log` (application logs)
- `/var/log/smart-pump/celery.log` (background task logs)

Set up log rotation using logrotate:

```bash
sudo cp deployment/logrotate.conf /etc/logrotate.d/smart-pump
```

## Backup and Recovery

### Database Backup

Create a daily backup cron job:

```bash
# Add to crontab
0 2 * * * pg_dump smart_pump_db > /backup/smart_pump_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
psql smart_pump_db < backup_file.sql
```

## Scaling

For high-traffic deployments:

1. Use a load balancer (Nginx, HAProxy)
2. Scale backend instances horizontally
3. Use a managed Redis service (AWS ElastiCache, etc.)
4. Use a managed PostgreSQL service (AWS RDS, etc.)

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Twilio integration not working**
   - Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
   - Check Twilio account status

3. **Payment gateway errors**
   - Verify RAZORPAY_KEY_ID and RAZORPAY_SECRET
   - Check Razorpay account configuration

### Health Checks

Monitor these endpoints:

- `/health` - Basic health check
- `/docs` - API documentation
- `/redoc` - Alternative API documentation

## Maintenance

Regular maintenance tasks:

1. Update dependencies monthly
2. Rotate logs weekly
3. Monitor disk space
4. Review security patches
5. Test backup restoration quarterly

## Support

For support, contact:
- Email: support@smartpump.example.com
- Phone: +1-234-567-8901

## Changelog

### v1.0.0
- Initial release
- User registration and authentication
- Pump management
- Booking system
- E-Token generation
- Payment integration
- AI demand prediction