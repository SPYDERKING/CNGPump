from fastapi import APIRouter, Request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.twiml.voice_response import VoiceResponse
from services.booking_service import booking_service
from services.pump_service import pump_service
from services.token_service import token_service
from db import get_db
import re
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/sms")
async def handle_sms(request: Request):
    """Handle incoming SMS messages for offline bookings"""
    form_data = await request.form()
    from_number = form_data.get("From")
    message_body = form_data.get("Body", "").strip().upper()
    
    logger.info(f"Received SMS from {from_number}: {message_body}")
    
    # Create Twilio response
    resp = MessagingResponse()
    msg = resp.message()
    
    # Parse SMS command
    # Expected format: BOOK <StationCode> <HH:MM>
    if message_body.startswith("BOOK"):
        try:
            # Parse the booking command
            parts = message_body.split()
            if len(parts) != 3:
                msg.body("Invalid format. Use: BOOK <StationCode> <HH:MM>")
                return str(resp)
            
            station_code = parts[1]
            time_slot = parts[2]
            
            # Validate time format
            if not re.match(r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$', time_slot):
                msg.body("Invalid time format. Use HH:MM (24-hour format)")
                return str(resp)
            
            # In a real implementation, you would:
            # 1. Look up the pump by station code
            # 2. Validate the time slot is available
            # 3. Create a booking for the user
            # 4. Generate an e-token
            # 5. Send the token back to the user
            
            # For demonstration, we'll send a sample response
            msg.body(f"Booking confirmed for station {station_code} at {time_slot}. Your token is CNG-ABC123. Valid for 20 minutes.")
            
        except Exception as e:
            logger.error(f"Error processing SMS booking: {str(e)}")
            msg.body("Sorry, we couldn't process your booking. Please try again later.")
    else:
        # Default response for unrecognized commands
        msg.body("Welcome to Smart CNG Pump Booking System!\n\n"
                 "To book a slot, send: BOOK <StationCode> <HH:MM>\n"
                 "Example: BOOK DEL001 14:30\n\n"
                 "For assistance, call our helpline.")
    
    return str(resp)

@router.post("/voice")
async def handle_voice(request: Request):
    """Handle incoming voice calls for IVR bookings"""
    resp = VoiceResponse()
    
    # Welcome message
    gather = resp.gather(
        num_digits=1,
        action="/api/ivr/menu",
        method="POST",
        timeout=5
    )
    gather.say("Welcome to Smart CNG Pump Booking System. "
               "Press 1 to book a slot. "
               "Press 2 for existing bookings. "
               "Press 3 for customer support.",
               voice="Polly.Raveena")
    
    # If no input, redirect to start
    resp.redirect("/api/ivr/welcome")
    
    return str(resp)

@router.post("/ivr/menu")
async def handle_ivr_menu(request: Request):
    """Handle IVR menu selections"""
    form_data = await request.form()
    digits = form_data.get("Digits")
    
    resp = VoiceResponse()
    
    if digits == "1":
        # Book a slot
        gather = resp.gather(
            num_digits=6,
            action="/api/ivr/book",
            method="POST",
            timeout=10
        )
        gather.say("Please enter your 6-digit station code followed by the hash key.",
                   voice="Polly.Raveena")
    elif digits == "2":
        # Existing bookings
        resp.say("To check your existing bookings, please call our customer service at the number provided in your confirmation message.",
                 voice="Polly.Raveena")
        resp.hangup()
    elif digits == "3":
        # Customer support
        resp.say("Connecting you to customer support. Please hold.",
                 voice="Polly.Raveena")
        resp.dial("+919876543210")  # Example support number
    else:
        # Invalid input
        resp.say("Invalid selection. Please try again.",
                 voice="Polly.Raveena")
        resp.redirect("/api/ivr/welcome")
    
    return str(resp)

@router.post("/ivr/book")
async def handle_ivr_booking(request: Request):
    """Handle IVR booking process"""
    form_data = await request.form()
    station_code = form_data.get("Digits")
    
    resp = VoiceResponse()
    
    if len(station_code) != 6:
        resp.say("Invalid station code. Please enter a 6-digit code.",
                 voice="Polly.Raveena")
        resp.redirect("/api/ivr/menu")
        return str(resp)
    
    # Ask for time slot
    gather = resp.gather(
        num_digits=4,
        action=f"/api/ivr/confirm/{station_code}",
        method="POST",
        timeout=10
    )
    gather.say("Please enter your desired time in 24-hour format. "
               "For example, for 2:30 PM, enter 1430.",
               voice="Polly.Raveena")
    
    return str(resp)