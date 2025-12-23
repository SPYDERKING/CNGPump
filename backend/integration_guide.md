# Backend-Frontend Integration Guide

This guide explains how to integrate the Python backend with the existing React frontend.

## Overview

The backend exposes a RESTful API that the frontend can consume. All API endpoints follow standard REST conventions and return JSON responses.

## API Base URL

In development: `http://localhost:8000`
In production: `https://api.yourdomain.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. User submits login credentials to `/api/users/login`
2. Backend validates credentials and returns a JWT token
3. Frontend stores the token (in localStorage or sessionStorage)
4. For subsequent requests, include the token in the Authorization header:
   ```
   Authorization: Bearer <token>
   ```

### Example Login Request

```javascript
// Frontend code
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      return { success: true, token: data.access_token };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## User Management

### Register New User

**Endpoint**: `POST /api/users/register`
**Headers**: `Content-Type: application/json`
**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "vehicle_number": "DL01AB1234"
}
```

**Frontend Example**:
```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:8000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (response.ok) {
      const user = await response.json();
      return { success: true, user };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## Pump Management

### Get All Pumps

**Endpoint**: `GET /api/pumps/`
**Headers**: `Authorization: Bearer <token>` (optional)

**Frontend Example**:
```javascript
const getPumps = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/pumps/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const pumps = await response.json();
      return { success: true, pumps };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### Get Specific Pump

**Endpoint**: `GET /api/pumps/{pump_id}`
**Headers**: `Authorization: Bearer <token>` (optional)

## Booking System

### Create Booking

**Endpoint**: `POST /api/bookings/`
**Headers**: 
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body**:
```json
{
  "user_id": "user-uuid",
  "pump_id": "pump-uuid",
  "slot_date": "2023-12-25",
  "slot_time": "14:30",
  "fuel_quantity": 10.5,
  "amount": 525.0
}
```

**Frontend Example**:
```javascript
const createBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/bookings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    
    if (response.ok) {
      const booking = await response.json();
      return { success: true, booking };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### Get User Bookings

**Endpoint**: `GET /api/bookings/?user_id={user_id}`
**Headers**: `Authorization: Bearer <token>`

### Get Available Slots

**Endpoint**: `GET /api/bookings/{pump_id}/slots/{slot_date}`
**Headers**: `Authorization: Bearer <token>`

**Frontend Example**:
```javascript
const getAvailableSlots = async (pumpId, slotDate) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/bookings/${pumpId}/slots/${slotDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const slots = await response.json();
      return { success: true, slots };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## E-Token Management

### Generate E-Token

**Endpoint**: `POST /api/tokens/generate/{booking_id}`
**Headers**: `Authorization: Bearer <token>`

**Frontend Example**:
```javascript
const generateToken = async (bookingId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/tokens/generate/${bookingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const tokenData = await response.json();
      return { success: true, token: tokenData };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### Validate Token

**Endpoint**: `POST /api/tokens/validate/{token_code}`
**Headers**: `Authorization: Bearer <token>`

## Payment Integration

### Create Payment Order

**Endpoint**: `POST /api/payments/order?amount={amount}&currency=INR`
**Headers**: `Authorization: Bearer <token>`

**Frontend Example**:
```javascript
const createPaymentOrder = async (amount) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/payments/order?amount=${amount}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const order = await response.json();
      return { success: true, order };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## AI Predictions

### Predict Demand

**Endpoint**: `GET /api/ai/predict/demand/{pump_id}?slot_date={date}&slot_time={time}`
**Headers**: `Authorization: Bearer <token>`

**Frontend Example**:
```javascript
const predictDemand = async (pumpId, slotDate, slotTime) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:8000/api/ai/predict/demand/${pumpId}?slot_date=${slotDate}&slot_time=${slotTime}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (response.ok) {
      const prediction = await response.json();
      return { success: true, prediction };
    } else {
      const error = await response.json();
      return { success: false, error: error.detail };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

## Error Handling

The API returns standardized error responses:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid token)
- 404: Not Found
- 500: Internal Server Error

**Frontend Error Handling Example**:
```javascript
const handleApiError = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
};
```

## WebSocket Integration (Real-time Updates)

For real-time updates (e.g., booking status changes), use WebSocket connections:

```javascript
const connectToWebSocket = (userId) => {
  const ws = new WebSocket(`ws://localhost:8000/ws/bookings/${userId}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle real-time updates
    console.log('Received update:', data);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};
```

## Environment Configuration

Create a `.env` file in your frontend project:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Then use it in your code:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
```

## CORS Configuration

The backend is configured to allow CORS requests from any origin in development. In production, you should specify your frontend domain:

```javascript
// In backend main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing the Integration

1. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Test API endpoints using the frontend UI or tools like Postman.

## Common Issues and Solutions

### CORS Errors
Ensure the backend CORS configuration allows your frontend origin.

### Authentication Issues
Make sure JWT tokens are properly stored and sent with each request.

### Network Errors
Check that the backend server is running and accessible from the frontend.

### Data Validation Errors
Ensure all required fields are provided and in the correct format.

## Best Practices

1. Always handle errors gracefully in the frontend
2. Implement proper loading states for API calls
3. Cache data when appropriate to reduce API calls
4. Use environment variables for API URLs and keys
5. Implement proper token refresh mechanisms
6. Add request/response interceptors for consistent error handling
7. Use TypeScript for better type safety (if applicable)

## Support

For integration issues, refer to:
- API documentation: `http://localhost:8000/docs`
- Backend logs for error details
- Contact the development team