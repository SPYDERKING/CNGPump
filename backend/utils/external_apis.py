import requests
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()

class ExternalAPIService:
    def __init__(self):
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
    
    def get_distance_and_duration(self, origin: str, destination: str) -> Optional[Dict[str, Any]]:
        """
        Get distance and estimated travel time between two locations using Google Maps API.
        
        Args:
            origin (str): Starting location
            destination (str): Destination location
            
        Returns:
            Optional[Dict[str, Any]]: Dictionary with distance and duration, or None if failed
        """
        if not self.google_maps_api_key:
            print("Google Maps API key not configured")
            return None
            
        try:
            url = "https://maps.googleapis.com/maps/api/distancematrix/json"
            params = {
                "origins": origin,
                "destinations": destination,
                "key": self.google_maps_api_key
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if data["status"] == "OK" and data["rows"]:
                element = data["rows"][0]["elements"][0]
                if element["status"] == "OK":
                    return {
                        "distance": element["distance"]["value"],  # in meters
                        "duration": element["duration"]["value"]   # in seconds
                    }
            
            return None
        except Exception as e:
            print(f"Error getting distance and duration: {str(e)}")
            return None
    
    def get_weather_data(self, lat: float, lng: float) -> Optional[Dict[str, Any]]:
        """
        Get weather data for a location using OpenWeatherMap API.
        
        Args:
            lat (float): Latitude
            lng (float): Longitude
            
        Returns:
            Optional[Dict[str, Any]]: Dictionary with weather data, or None if failed
        """
        if not self.weather_api_key:
            print("Weather API key not configured")
            return None
            
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat,
                "lon": lng,
                "appid": self.weather_api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if "weather" in data and "main" in data:
                return {
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "description": data["weather"][0]["description"],
                    "wind_speed": data["wind"]["speed"] if "wind" in data else 0
                }
            
            return None
        except Exception as e:
            print(f"Error getting weather data: {str(e)}")
            return None

# Global instance
external_api_service = ExternalAPIService()