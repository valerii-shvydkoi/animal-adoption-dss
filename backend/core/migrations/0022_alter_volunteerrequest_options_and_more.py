from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0021_alter_volunteerrequest_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="volunteerrequest",
            options={
                "ordering": ["-created_at"],
                "verbose_name": "Заявка волонтера / притулку",
                "verbose_name_plural": "Заявки волонтерів та притулків",
            },
        ),
        migrations.RemoveField(
            model_name="volunteerrequest",
            name="availability",
        ),
        migrations.RemoveField(
            model_name="volunteerrequest",
            name="experience",
        ),
        migrations.RemoveField(
            model_name="volunteerrequest",
            name="message",
        ),
        migrations.RemoveField(
            model_name="volunteerrequest",
            name="new_shelter_website",
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_address",
            field=models.CharField(
                blank=True, max_length=255, null=True, verbose_name="Адреса"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_city",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Місто"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_region",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Область"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="phone",
            field=models.CharField(max_length=20, verbose_name="Контактний телефон"),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="shelter",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="pending_requests",
                to="core.shelter",
                verbose_name="Обраний існуючий притулок",
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "На розгляді"),
                    ("APPROVED", "Схвалено"),
                    ("REJECTED", "Відхилено"),
                ],
                default="PENDING",
                max_length=15,
                verbose_name="Статус заявки",
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="volunteer_requests",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Користувач",
            ),
        ),
    ]
