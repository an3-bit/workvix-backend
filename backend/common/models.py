from django.db import models
import uuid


class BaseModel(models.Model):
    """Abstract base model with common fields for all models"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class FileUpload(BaseModel):
    """Generic file upload model"""
    
    file = models.FileField(upload_to='uploads/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'file_uploads'
        
    def __str__(self):
        return f"{self.original_name} - {self.uploaded_by.name}"
