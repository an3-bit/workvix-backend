from django.contrib import admin
from .models import Job, JobAttachment, JobView


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'assignment_type', 'status', 'budget_min', 'budget_max', 'deadline', 'created_at')
    list_filter = ('assignment_type', 'status', 'urgency', 'is_featured')
    search_fields = ('title', 'description', 'client__name', 'client__email')
    readonly_fields = ('views_count', 'offers_count', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Info', {'fields': ('client', 'title', 'description')}),
        ('Details', {'fields': ('assignment_type', 'subject', 'deadline', 'pages', 'urgency')}),
        ('Budget', {'fields': ('budget_min', 'budget_max')}),
        ('Status', {'fields': ('status', 'is_featured')}),
        ('Additional', {'fields': ('instructions', 'skills_required')}),
        ('Statistics', {'fields': ('views_count', 'offers_count'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(JobAttachment)
class JobAttachmentAdmin(admin.ModelAdmin):
    list_display = ('job', 'original_name', 'file_size', 'content_type', 'created_at')
    list_filter = ('content_type',)
    search_fields = ('job__title', 'original_name')
    readonly_fields = ('file_size', 'created_at', 'updated_at')


@admin.register(JobView)
class JobViewAdmin(admin.ModelAdmin):
    list_display = ('job', 'user', 'ip_address', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('job__title', 'user__name')
    readonly_fields = ('created_at', 'updated_at')
