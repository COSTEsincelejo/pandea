import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "pandea-super-secret-2024")
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pandea.db")
    TOKEN_EXPIRY = 60 * 60 * 24 * 7
    WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "573001234567")
    DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
    PORT = int(os.environ.get("PORT", 5000))
