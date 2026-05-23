from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0029_alter_pet_urgency_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pet",
            name="breed",
            field=models.CharField(
                blank=True,
                default="Без породи",
                help_text="Залиште пустим, якщо безпородна",
                max_length=100,
                verbose_name="Порода",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="care_type",
            field=models.CharField(
                choices=[
                    ("SHELTER", "Офіційний притулок"),
                    ("VOLUNTEER", "Волонтер"),
                    ("VOLUNTEER_FOSTER", "Волонтерська перетримка"),
                ],
                default="SHELTER",
                max_length=20,
                verbose_name="Тип опіки",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="city",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Місто перебування тварини",
                max_length=100,
                verbose_name="Місто",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="energy_level",
            field=models.CharField(
                blank=True,
                default="MEDIUM",
                max_length=50,
                verbose_name="Рівень енергії",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="oblast",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Область перебування тварини",
                max_length=100,
                verbose_name="Область",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="photo_url",
            field=models.URLField(
                blank=True,
                max_length=500,
                null=True,
                verbose_name="Посилання на хмарне фото",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="video_url",
            field=models.URLField(
                blank=True,
                help_text="Посилання на YouTube, TikTok або хмарне сховище",
                max_length=500,
                null=True,
                verbose_name="Відео URL",
            ),
        ),
    ]
