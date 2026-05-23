from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0019_userprofile_has_cats_userprofile_has_children_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="shelter",
            options={
                "ordering": ["name"],
                "verbose_name": "Притулок",
                "verbose_name_plural": "Притулки",
            },
        ),
        migrations.AddField(
            model_name="shelter",
            name="is_verified",
            field=models.BooleanField(
                default=False, verbose_name="Верифіковано платформою"
            ),
        ),
        migrations.AddField(
            model_name="shelter",
            name="owner",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="owned_shelters",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Власник/Адміністратор притулку",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="shelter",
            name="address",
            field=models.CharField(max_length=255, verbose_name="Адреса"),
        ),
        migrations.AlterField(
            model_name="shelter",
            name="city",
            field=models.CharField(max_length=100, verbose_name="Місто"),
        ),
        migrations.AlterField(
            model_name="shelter",
            name="name",
            field=models.CharField(max_length=255, verbose_name="Назва притулку"),
        ),
        migrations.AlterField(
            model_name="shelter",
            name="phone",
            field=models.CharField(max_length=20, verbose_name="Телефон притулку"),
        ),
        migrations.AlterField(
            model_name="shelter",
            name="region",
            field=models.CharField(default=1, max_length=100, verbose_name="Область"),
            preserve_default=False,
        ),
    ]
