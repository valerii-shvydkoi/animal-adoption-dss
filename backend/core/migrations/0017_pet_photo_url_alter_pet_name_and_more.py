from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0016_pet_is_sterilized_alter_pet_urgency_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="photo_url",
            field=models.URLField(
                blank=True,
                help_text="Посилання на фото (Google Диск, OneDrive, Dropbox тощо)",
                null=True,
                verbose_name="Посилання на хмарне фото",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="name",
            field=models.CharField(
                blank=True, default="Без імені", max_length=100, verbose_name="Ім'я"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                blank=True,
                help_text="Наприклад: Евакуйований, Терміново",
                max_length=50,
                verbose_name="Статус терміновості",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="weight",
            field=models.DecimalField(
                decimal_places=1, default=0.0, max_digits=5, verbose_name="Вага (кг)"
            ),
        ),
    ]
