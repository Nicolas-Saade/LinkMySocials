# In models.py (either in an existing app or a new app)
from django.db import models

class TestModel(models.Model):
    file = models.FileField(upload_to='test_uploads/')