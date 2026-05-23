from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0017_pet_photo_url_alter_pet_name_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="pet",
            name="age_months",
            field=models.PositiveIntegerField(
                help_text="Вік у місяцях", verbose_name="Вік (місяців)"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="allow_virtual_adoption",
            field=models.BooleanField(
                default=False,
                help_text="Відмітьте, якщо для тварини доступна віртуальна опіка",
                verbose_name="Віртуальна опіка",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="is_sterilized",
            field=models.CharField(
                choices=[("true", "Так"), ("false", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                max_length=10,
                verbose_name="Стерилізовано",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="name",
            field=models.CharField(
                blank=True,
                default="Без імені",
                help_text="Залиште пустим, якщо немає",
                max_length=100,
                verbose_name="Ім'я",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="photo_url",
            field=models.URLField(
                blank=True, null=True, verbose_name="Посилання на хмарне фото"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(max_length=50, verbose_name="Статус терміновості"),
        ),
        migrations.AlterField(
            model_name="pet",
            name="video_url",
            field=models.URLField(
                blank=True,
                help_text="Посилання на YouTube, TikTok або хмарне сховище",
                null=True,
                verbose_name="Відео URL",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="weight",
            field=models.DecimalField(
                decimal_places=1, max_digits=5, verbose_name="Вага (кг)"
            ),
        ),
    ]
