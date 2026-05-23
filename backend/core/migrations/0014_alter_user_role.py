from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0013_pet_oblast_alter_pet_allow_virtual_adoption"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("USER", "Користувач"),
                    ("VOLUNTEER", "Волонтер"),
                    ("SHELTER_MANAGER", "Менеджер притулку"),
                    ("ADMIN", "Адміністратор"),
                ],
                default="USER",
                max_length=20,
            ),
        ),
    ]
