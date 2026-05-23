from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0020_alter_shelter_options_shelter_is_verified_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="volunteerrequest",
            options={
                "verbose_name": "Заявку на волонтерство",
                "verbose_name_plural": "Заявки на волонтерство",
            },
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="availability",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Доступний час"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="experience",
            field=models.TextField(
                blank=True, null=True, verbose_name="Досвід волонтерства"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="message",
            field=models.TextField(
                blank=True, null=True, verbose_name="Супровідний лист"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_address",
            field=models.CharField(
                blank=True, max_length=255, null=True, verbose_name="Адреса притулку"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_city",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Місто притулку"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_region",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Область притулку"
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="new_shelter_website",
            field=models.URLField(blank=True, null=True, verbose_name="Сайт притулку"),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="phone",
            field=models.CharField(default=1, max_length=20, verbose_name="Телефон"),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="shelter",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="incoming_volunteer_requests",
                to="core.shelter",
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Очікує розгляду"),
                    ("APPROVED", "Схвалено"),
                    ("REJECTED", "Відхилено"),
                ],
                default="PENDING",
                max_length=20,
                verbose_name="Статус",
            ),
        ),
        migrations.AlterField(
            model_name="volunteerrequest",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="volunteer_requests",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
