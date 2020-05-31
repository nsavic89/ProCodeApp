from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['api.pro-code.ch']

CORS_ORIGIN_WHITELIST = [
    "http://www.pro-code.ch"
]