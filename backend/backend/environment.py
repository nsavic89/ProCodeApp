ENVIRONMENT = 'development'
#ENVIRONMENT = 'production'



SETTINGS_MODULE = 'backend.development'

if ENVIRONMENT == 'production':
    SETTINGS_MODULE = 'backend.production'
