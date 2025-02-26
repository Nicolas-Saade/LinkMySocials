# Start of file, after imports
import os

# Clear any existing email settings from environment variables
if 'EMAIL_USE_TLS' in os.environ:
    del os.environ['EMAIL_USE_TLS']
if 'EMAIL_USE_SSL' in os.environ:
    del os.environ['EMAIL_USE_SSL']

# Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465  # Changed port for SSL
EMAIL_USE_SSL = True
EMAIL_USE_TLS = False  # Must be False when using SSL
EMAIL_HOST_USER = 'linkmysocials@gmail.com'
EMAIL_HOST_PASSWORD = 'mtyt cuaj fngz ctjv'  # Your app password
DEFAULT_FROM_EMAIL = 'LinkMySocials <linkmysocials@gmail.com>' 