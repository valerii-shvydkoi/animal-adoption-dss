from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0005_pet_age_months_pet_breed_pet_description_pet_gender_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="preferred_species",
            field=models.CharField(blank=True, default="ANY", max_length=10, null=True),
        ),
    ]
