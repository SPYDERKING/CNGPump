import qrcode
from io import BytesIO
import base64
from typing import Tuple

def generate_qr_code(data: str, size: Tuple[int, int] = (300, 300)) -> Tuple[str, str]:
    """
    Generate a QR code from the provided data.
    
    Args:
        data (str): The data to encode in the QR code
        size (Tuple[int, int]): The size of the QR code image (width, height)
        
    Returns:
        Tuple[str, str]: A tuple containing the QR code as base64 string and the data
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Add data to QR code
    qr.add_data(data)
    qr.make(fit=True)
    
    # Create image from QR code
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Resize image
    img = img.resize(size)
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str, data

def generate_token_code(db_session=None) -> str:
    """
    Generate a unique token code.
    
    Args:
        db_session: Optional database session to check for uniqueness
        
    Returns:
        str: A unique token code in the format CNG-XXXXXX
    """
    import random
    
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    
    # Try up to 10 times to generate a unique code
    for _ in range(10):
        result = 'CNG-'
        for _ in range(6):
            result += random.choice(chars)
        
        # If we have a database session, check if the code already exists
        if db_session:
            from models.token import Token
            existing_token = db_session.query(Token).filter(Token.token_code == result).first()
            if not existing_token:
                return result
        else:
            # If no database session, just return the generated code
            return result
    
    # If we couldn't generate a unique code after 10 tries, raise an exception
    raise Exception("Could not generate unique token code after 10 attempts")