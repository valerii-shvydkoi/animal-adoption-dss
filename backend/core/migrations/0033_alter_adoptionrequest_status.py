from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0032_userprofile_available_walk_hours_and_experience"),
    ]

    operations = [
        migrations.AlterField(
            model_name="adoptionrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "В очікуванні"),
                    ("REVIEWED", "Переглянуто"),
                    ("APPROVED", "Схвалено"),
                    ("REJECTED", "Відхилено"),
                    ("CANCELLED", "Скасовано"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
    ]
