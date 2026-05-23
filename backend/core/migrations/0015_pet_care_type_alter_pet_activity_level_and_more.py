import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0014_alter_user_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="care_type",
            field=models.CharField(
                choices=[
                    ("SHELTER", "Офіційний притулок"),
                    ("VOLUNTEER_FOSTER", "Волонтерська перетримка"),
                ],
                default="SHELTER",
                max_length=20,
                verbose_name="Тип опіки",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="activity_level",
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5),
                ],
                verbose_name="Активність (1-5)",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="age_months",
            field=models.PositiveIntegerField(
                default=0, help_text="Вік у місяцях", verbose_name="Вік (місяців)"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="allow_virtual_adoption",
            field=models.BooleanField(
                default=False,
                help_text="Чи можна стать віртуальним опікуном",
                verbose_name="Віртуальна опіка",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="behavior_tags",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text="Список тегів характеру",
                verbose_name="Теги поведінки",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="breed",
            field=models.CharField(
                blank=True,
                help_text="Залиште пустим, якщо безпородна",
                max_length=100,
                verbose_name="Порода",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="city",
            field=models.CharField(
                blank=True,
                help_text="Місто перебування тварини",
                max_length=100,
                verbose_name="Місто",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="description",
            field=models.TextField(
                blank=True, help_text="Історія та характер тварини", verbose_name="Опис"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="energy_level",
            field=models.CharField(
                blank=True, max_length=50, verbose_name="Рівень енергії"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="gender",
            field=models.CharField(
                choices=[("MALE", "Хлопчик"), ("FEMALE", "Дівчинка")],
                default="MALE",
                max_length=10,
                verbose_name="Стать",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="good_with_cats",
            field=models.CharField(
                choices=[("YES", "Так"), ("NO", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                help_text="Сумісність із котами",
                max_length=10,
                verbose_name="З котами",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="good_with_children",
            field=models.CharField(
                choices=[("YES", "Так"), ("NO", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                help_text="Сумісність із дітьми",
                max_length=10,
                verbose_name="З дітьми",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="good_with_dogs",
            field=models.CharField(
                choices=[("YES", "Так"), ("NO", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                help_text="Сумісність із іншими собаками",
                max_length=10,
                verbose_name="З собаками",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="is_available",
            field=models.BooleanField(
                default=True, verbose_name="Доступний для адопції"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="name",
            field=models.CharField(max_length=100, verbose_name="Ім'я"),
        ),
        migrations.AlterField(
            model_name="pet",
            name="oblast",
            field=models.CharField(
                blank=True,
                help_text="Область перебування тварини",
                max_length=100,
                verbose_name="Область",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="photo",
            field=models.ImageField(
                blank=True, null=True, upload_to="pets/photos/", verbose_name="Фото"
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="shelter",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="pets",
                to="core.shelter",
                verbose_name="Притулок",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="sociability",
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5),
                ],
                verbose_name="Соціальність (1-5)",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="species",
            field=models.CharField(
                choices=[("DOG", "Собака"), ("CAT", "Кішка"), ("OTHER", "Інше")],
                default="DOG",
                max_length=10,
                verbose_name="Вид",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="stress_resistance",
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5),
                ],
                verbose_name="Стресостійкість (1-5)",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="urgency_status",
            field=models.CharField(
                blank=True,
                help_text="Наприклад: Евакуйований, Терміново",
                max_length=50,
                verbose_name="Статус терміновості",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="video_url",
            field=models.URLField(
                blank=True,
                help_text="Посилання на YouTube/TikTok",
                null=True,
                verbose_name="Відео URL",
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="weight",
            field=models.DecimalField(
                decimal_places=2, max_digits=5, verbose_name="Вага (кг)"
            ),
        ),
    ]
