from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_volunteerrequest_availability_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="shelter",
            name="region",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Область"
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_region",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Область"
            ),
        ),
    ]
