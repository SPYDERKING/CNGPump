import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import ai_predictions, bookings, payments, pumps, reminders, tokens, users
from sms_handler import router as sms_router

app = FastAPI(
    title="AI-Powered Smart CNG Pump Appointment System",
    description="Backend API for the Smart CNG Pump Appointment, E-Token & Queue Management System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(pumps.router, prefix="/api/pumps", tags=["pumps"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(tokens.router, prefix="/api/tokens", tags=["tokens"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"])
app.include_router(ai_predictions.router, prefix="/api/ai", tags=["ai-predictions"])
app.include_router(sms_router, prefix="/api/sms", tags=["sms"])

@app.get("/")
async def root():
    return {"message": "AI-Powered Smart CNG Pump Appointment System API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)