from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0011_pet_allow_virtual_adoption_pet_behavior_tags_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="adoptionrequest",
            options={
                "verbose_name": "Заявка на адопцію",
                "verbose_name_plural": "Заявки на адопцію",
            },
        ),
        migrations.AlterModelOptions(
            name="pet",
            options={
                "verbose_name": "Тварина",
                "verbose_name_plural": "Каталог тварин",
            },
        ),
        migrations.AlterModelOptions(
            name="questionnaire",
            options={
                "verbose_name": "Анкета",
                "verbose_name_plural": "Анкети користувачів",
            },
        ),
        migrations.AlterModelOptions(
            name="questionnaireresult",
            options={
                "verbose_name": "Результат підбору",
                "verbose_name_plural": "Результати підбору",
            },
        ),
        migrations.AlterModelOptions(
            name="shelter",
            options={"verbose_name": "Притулок", "verbose_name_plural": "Притулки"},
        ),
        migrations.AlterModelOptions(
            name="user",
            options={
                "verbose_name": "Користувач",
                "verbose_name_plural": "Користувачі",
            },
        ),
        migrations.AlterModelOptions(
            name="volunteer",
            options={"verbose_name": "Волонтер", "verbose_name_plural": "Волонтери"},
        ),
        migrations.AlterModelOptions(
            name="volunteerrequest",
            options={
                "verbose_name": "Заявка на волонтерство",
                "verbose_name_plural": "Заявки на волонтерство",
            },
        ),
        migrations.RemoveField(
            model_name="pet",
            name="size_category",
        ),
        migrations.AddField(
            model_name="pet",
            name="good_with_dogs",
            field=models.CharField(
                choices=[("YES", "Так"), ("NO", "Ні"), ("UNKNOWN", "Невідомо")],
                default="UNKNOWN",
                help_text="Сумісність із іншими собаками",
                max_length=10,
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
            ),
        ),
    ]
