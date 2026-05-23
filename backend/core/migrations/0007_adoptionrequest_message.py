from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_userprofile_preferred_species"),
    ]

    operations = [
        migrations.AddField(
            model_name="adoptionrequest",
            name="message",
            field=models.TextField(
                blank=True,
                help_text="Повідомлення для волонтера від користувача",
                max_length=500,
                null=True,
            ),
        ),
    ]
