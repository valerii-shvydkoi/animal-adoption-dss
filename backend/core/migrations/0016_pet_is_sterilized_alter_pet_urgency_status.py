from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0015_pet_care_type_alter_pet_activity_level_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="is_sterilized",
            field=models.CharField(
                choices=[("YES", "Так"), ("NO", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                max_length=10,
                verbose_name="Стерилізовано",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                blank=True,
                help_text="Наприклад: Евакуйований, Терміново",
                max_length=50,
                verbose_name="Статус termіновості",
            ),
        ),
    ]
