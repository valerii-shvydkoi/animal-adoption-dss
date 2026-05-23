from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0018_alter_pet_age_months_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="has_cats",
            field=models.BooleanField(default=False, verbose_name="Є коти"),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="has_children",
            field=models.BooleanField(default=False, verbose_name="Є маленькі діти"),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="has_dogs",
            field=models.BooleanField(default=False, verbose_name="Є собаки"),
        ),
    ]
