import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the initial staging owner from one-time environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_OWNER_BOOTSTRAP_USERNAME", "").strip()
        email = os.environ.get("DJANGO_OWNER_BOOTSTRAP_EMAIL", "").strip()
        password = os.environ.get("DJANGO_OWNER_BOOTSTRAP_PASSWORD", "")

        User = get_user_model()
        if not username or not email or not password:
            if User.objects.filter(is_superuser=True).exists():
                self.stdout.write("A staging superuser already exists; owner bootstrap skipped.")
                return
            raise CommandError(
                "Set DJANGO_OWNER_BOOTSTRAP_USERNAME, DJANGO_OWNER_BOOTSTRAP_EMAIL, "
                "and DJANGO_OWNER_BOOTSTRAP_PASSWORD in the hosting dashboard for the initial bootstrap."
            )
        if len(password) < 14:
            raise CommandError("The staging owner password must be at least 14 characters.")

        existing = User.objects.filter(username=username).first()
        if existing:
            if existing.is_superuser:
                self.stdout.write("Staging owner already exists; no changes made.")
                return
            raise CommandError(
                "The requested username already exists but is not a superuser. "
                "Refusing to elevate an existing account."
            )

        if User.objects.filter(email__iexact=email, is_superuser=True).exists():
            raise CommandError("A staging superuser already exists with this email; no changes made.")

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS("Initial staging owner created. Remove the bootstrap environment variables now."))
