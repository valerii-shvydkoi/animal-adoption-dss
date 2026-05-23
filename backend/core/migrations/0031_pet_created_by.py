from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0030_alter_pet_breed_alter_pet_care_type_alter_pet_city_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="created_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="created_pets",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Хто додав",
            ),
        ),
    ]
