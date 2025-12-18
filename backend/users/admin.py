from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FreelancerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'role', 'profile_status', 'is_active', 'created_at')
    list_filter = ('role', 'profile_status', 'is_active', 'email_verified')
    search_fields = ('email', 'name', 'phone')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone', 'avatar')}),
        ('Permissions', {'fields': ('role', 'profile_status', 'is_active', 'is_staff', 'is_superuser', 'email_verified')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'hourly_rate', 'experience_years', 'rating', 'total_jobs_completed', 'is_verified')
    list_filter = ('is_verified', 'experience_years')
    search_fields = ('user__name', 'user__email', 'bio')
    readonly_fields = ('rating', 'total_jobs_completed', 'created_at', 'updated_at')
