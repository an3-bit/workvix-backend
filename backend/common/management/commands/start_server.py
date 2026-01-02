import os
import sys
import subprocess
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Start Gunicorn server on port 10000 for Render'

    def handle(self, *args, **options):
        # Hardcoded port for Render
        port = 10000
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting Gunicorn on 0.0.0.0:{port}')
        )
        
        # Build gunicorn command
        cmd = [
            'gunicorn',
            'workvix_project.wsgi:application',
            f'--bind=0.0.0.0:{port}',
            '--workers=4',
            '--worker-class=sync',
            '--timeout=120',
            '--access-logfile=-',
            '--error-logfile=-',
            '--log-level=info',
        ]
        
        # Run gunicorn
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to start Gunicorn: {e}')
            )
            sys.exit(1)
