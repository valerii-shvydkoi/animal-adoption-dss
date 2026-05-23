from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0023_alter_volunteerrequest_options_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="volunteerrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Розглядається"),
                    ("APPROVED", "Схвалено"),
                    ("REJECTED", "Відхилено"),
                    ("CANCELLED", "Скасовано"),
                ],
                default="PENDING",
                max_length=15,
                verbose_name="Статус заявки",
            ),
        ),
    ]
