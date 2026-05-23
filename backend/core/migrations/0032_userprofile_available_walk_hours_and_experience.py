from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0031_pet_created_by"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="available_walk_hours",
            field=models.PositiveSmallIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="has_pet_experience",
            field=models.BooleanField(default=False),
        ),
    ]
