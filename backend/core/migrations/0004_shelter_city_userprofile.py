from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_alter_volunteerrequest_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="shelter",
            name="city",
            field=models.CharField(
                default="Не вказано", help_text="Місто розташування", max_length=100
            ),
        ),
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("first_name", models.CharField(blank=True, max_length=100)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("has_car", models.BooleanField(default=False)),
                ("has_shelter", models.BooleanField(default=False)),
                ("has_elevator", models.BooleanField(default=False)),
                ("floor", models.PositiveIntegerField(default=1)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
