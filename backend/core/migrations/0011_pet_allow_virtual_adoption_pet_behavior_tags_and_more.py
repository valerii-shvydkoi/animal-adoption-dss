from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0010_userprofile_preferred_age"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="allow_virtual_adoption",
            field=models.BooleanField(
                default=False, help_text="Чи можна стати віртуальним опікуном"
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="behavior_tags",
            field=models.JSONField(
                blank=True, default=list, help_text="Список тегів характеру"
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="city",
            field=models.CharField(
                blank=True, help_text="Місто перебування тварини", max_length=100
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="energy_level",
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name="pet",
            name="good_with_cats",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pet",
            name="good_with_children",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pet",
            name="size_category",
            field=models.CharField(
                blank=True,
                choices=[
                    ("Mini", "Mini (до 10 кг)"),
                    ("Medium", "Medium (11-25 кг)"),
                    ("Large", "Large (понад 25 кг)"),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                blank=True,
                help_text="Наприклад: Евакуйований, Терміново",
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name="pet",
            name="video_url",
            field=models.URLField(
                blank=True, help_text="Посилання на YouTube/TikTok", null=True
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="favorites",
            field=models.ManyToManyField(
                blank=True, related_name="favorited_by", to="core.pet"
            ),
        ),
    ]
