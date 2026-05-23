from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0025_shelter_description"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                choices=[
                    ("HIGH", "Високий"),
                    ("MEDIUM", "Середній"),
                    ("LOW", "Низький"),
                ],
                default="MEDIUM",
                max_length=20,
                verbose_name="Статус терміновості",
            ),
        ),
    ]
