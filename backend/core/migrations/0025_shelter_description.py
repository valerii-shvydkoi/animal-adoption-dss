from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0024_alter_volunteerrequest_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="shelter",
            name="description",
            field=models.TextField(
                blank=True, default="", verbose_name="Опис притулку"
            ),
        ),
    ]
