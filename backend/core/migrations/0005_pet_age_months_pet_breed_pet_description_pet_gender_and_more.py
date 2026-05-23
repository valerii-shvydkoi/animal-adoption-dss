from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0004_shelter_city_userprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="age_months",
            field=models.PositiveIntegerField(default=0, help_text="Вік у місяцях"),
        ),
        migrations.AddField(
            model_name="pet",
            name="breed",
            field=models.CharField(
                blank=True, help_text="Залиште пустим, якщо безпородна", max_length=100
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="description",
            field=models.TextField(blank=True, help_text="Історія та характер тварини"),
        ),
        migrations.AddField(
            model_name="pet",
            name="gender",
            field=models.CharField(
                choices=[("MALE", "Хлопчик"), ("FEMALE", "Дівчинка")],
                default="MALE",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="photo",
            field=models.ImageField(blank=True, null=True, upload_to="pets/photos/"),
        ),
        migrations.AddField(
            model_name="pet",
            name="species",
            field=models.CharField(
                choices=[("DOG", "Собака"), ("CAT", "Кішка"), ("OTHER", "Інше")],
                default="DOG",
                max_length=10,
            ),
        ),
    ]
