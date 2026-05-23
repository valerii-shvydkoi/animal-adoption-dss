from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0022_alter_volunteerrequest_options_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="volunteerrequest",
            options={
                "ordering": ["-created_at"],
                "verbose_name": "Заявка волонтера/притулку",
                "verbose_name_plural": "Заявки волонтерів/притулків",
            },
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="availability",
            field=models.CharField(
                blank=True,
                default="",
                max_length=255,
                null=True,
                verbose_name="Доступність за часом",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="experience",
            field=models.TextField(
                blank=True,
                default="",
                null=True,
                verbose_name="Досвід роботи з тваринами",
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="is_new_shelter",
            field=models.BooleanField(default=False, verbose_name="Це новий притулок?"),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="message",
            field=models.TextField(
                blank=True, null=True, verbose_name="Супровідне повідомлення"
            ),
        ),
        migrations.AddField(
            model_name="volunteerrequest",
            name="new_shelter_website",
            field=models.URLField(
                blank=True, null=True, verbose_name="Веб-сайт / Соцмережі"
            ),
        ),
    ]
