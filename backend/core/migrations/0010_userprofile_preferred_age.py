from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_shelter_region_volunteerrequest_new_shelter_region"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="preferred_age",
            field=models.CharField(blank=True, default="ANY", max_length=10, null=True),
        ),
    ]
