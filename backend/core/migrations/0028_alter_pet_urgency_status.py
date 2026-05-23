from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0027_alter_pet_urgency_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                choices=[
                    ("MEDIUM", "Планова адопція"),
                    ("HIGH", "Евакуація (із зони бойових дій)"),
                    ("MEDICAL", "Лікування (потребує медичного догляду)"),
                ],
                default="MEDIUM",
                max_length=20,
                verbose_name="Статус терміновості",
            ),
        ),
    ]
