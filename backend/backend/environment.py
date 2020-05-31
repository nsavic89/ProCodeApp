ENVIRONMENT = 'development'
#ENVIRONMENT = 'production'



SETTINGS_MODULE = 'backend.settings.development'

if ENVIRONMENT == 'production':
    SETTINGS_MODULE = 'backend.settings.production'
