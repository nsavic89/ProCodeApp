from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['api.pro-code.ch']

CORS_ORIGIN_WHITELIST = [
    "http://www.pro-code.ch"
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
       	'NAME': 'procode_db',
	'USER': 'nenad',
	'PASSWORD': 'Procode-2020',
	'HOST': '',
	'PORT': ''
    }
}

STATIC_ROOT = os.path.join(BASE_DIR, 'static')