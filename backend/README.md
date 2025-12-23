# AI-Powered Smart CNG Pump Appointment System - Backend

This is the backend API for the AI-Powered Smart CNG Pump Appointment, E-Token & Queue Management System.

## Features

- User registration and authentication
- Pump management
- Booking system with slot availability
- E-Token generation with QR codes
- Payment integration
- Reminder notifications
- AI-powered demand prediction
- Admin dashboard functionality

## Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT
- **Task Queue**: Celery with Redis
- **AI/ML**: Scikit-learn for demand prediction
- **External APIs**: Google Maps, Weather API, Twilio, Razorpay

## Project Structure

```
backend/
├── main.py                 # Application entry point
├── db.py                   # Database configuration
├── models/                 # Database models
├── schemas/                # Pydantic schemas for validation
├── routes/                 # API route handlers
├── services/               # Business logic layer
├── utils/                  # Utility functions
├── ai_models/              # AI/ML models
├── tasks/                  # Background tasks (Celery)
├── celery_app.py           # Celery configuration
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
└── .env                    # Environment variables
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL
- Redis
- Docker (optional, for containerization)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

6. Run database migrations:
   ```bash
   # This step depends on your migration strategy
   ```

### Running the Application

#### Development Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

#### With Docker

```bash
docker-compose up --build
```

### API Documentation

Once the server is running, you can access:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL database connection string | postgresql://postgres:password@localhost:5432/smart_pump_db |
| SECRET_KEY | JWT secret key | your-secret-key-change-this-in-production |
| ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | JWT token expiration time | 30 |
| TWILIO_ACCOUNT_SID | Twilio account SID | - |
| TWILIO_AUTH_TOKEN | Twilio auth token | - |
| TWILIO_PHONE_NUMBER | Twilio phone number | - |
| GOOGLE_MAPS_API_KEY | Google Maps API key | - |
| WEATHER_API_KEY | Weather API key | - |
| RAZORPAY_KEY_ID | Razorpay key ID | - |
| RAZORPAY_SECRET | Razorpay secret | - |
| REDIS_URL | Redis connection string | redis://localhost:6379/0 |

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get access token

### Pumps
- `GET /api/pumps/` - Get all pumps
- `GET /api/pumps/{pump_id}` - Get a specific pump
- `POST /api/pumps/` - Create a new pump (admin)
- `PUT /api/pumps/{pump_id}` - Update a pump (admin)
- `DELETE /api/pumps/{pump_id}` - Delete a pump (admin)

### Bookings
- `GET /api/bookings/?user_id={user_id}` - Get user bookings
- `GET /api/bookings/pump/{pump_id}` - Get pump bookings
- `GET /api/bookings/{booking_id}` - Get a specific booking
- `POST /api/bookings/` - Create a new booking
- `PUT /api/bookings/{booking_id}` - Update a booking
- `DELETE /api/bookings/{booking_id}` - Cancel a booking

### Tokens
- `GET /api/tokens/{token_id}` - Get a specific token
- `GET /api/tokens/booking/{booking_id}` - Get token for a booking
- `POST /api/tokens/generate/{booking_id}` - Generate token for booking
- `POST /api/tokens/validate/{token_code}` - Validate a token
- `POST /api/tokens/use/{token_id}` - Mark token as used

### Payments
- `GET /api/payments/{payment_id}` - Get a specific payment
- `GET /api/payments/booking/{booking_id}` - Get payments for a booking
- `POST /api/payments/` - Create a payment record
- `PUT /api/payments/{payment_id}` - Update a payment record

### Reminders
- `GET /api/reminders/{reminder_id}` - Get a specific reminder
- `GET /api/reminders/booking/{booking_id}` - Get reminders for a booking
- `POST /api/reminders/` - Create a reminder
- `PUT /api/reminders/{reminder_id}` - Update a reminder

### AI Predictions
- `POST /api/ai/train` - Train the demand prediction model
- `GET /api/ai/predict/demand/{pump_id}` - Predict demand for a time slot
- `GET /api/ai/predict/optimal-slots/{pump_id}` - Get optimal time slots
- `GET /api/ai/predict/fuel-demand/{pump_id}` - Predict fuel demand

## Background Tasks

The system uses Celery for background tasks:

- Sending reminder notifications
- Checking and expiring tokens
- Updating pump capacities
- Retraining AI models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.