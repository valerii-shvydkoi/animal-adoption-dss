from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_adoptionrequest_message"),
    ]

    operations = [
        migrations.AddField(
            model_name="volunteerrequest",
            name="availability",
            field=models.CharField(
                blank=True,
                max_length=255,
                null=True,
                verbose_name="Вільний час (годин на тиждень)",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="experience",
            field=models.TextField(
                blank=True,
                max_length=1000,
                null=True,
                verbose_name="Досвід роботи з тваринами",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="message",
            field=models.TextField(
                blank=True,
                max_length=1000,
                null=True,
                verbose_name="Чому хочете стати волонтером?",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_address",
            field=models.CharField(
                blank=True, max_length=255, null=True, verbose_name="Адреса"
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_city",
            field=models.CharField(
                blank=True, max_length=100, null=True, verbose_name="Місто"
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_name",
            field=models.CharField(
                blank=True,
                max_length=255,
                null=True,
                verbose_name="Назва нового притулку",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_website",
            field=models.URLField(
                blank=True, max_length=255, null=True, verbose_name="Сайт або соцмережі"
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="phone",
            field=models.CharField(
                blank=True, max_length=20, null=True, verbose_name="Номер телефону"
            ),
        ),
    ]
