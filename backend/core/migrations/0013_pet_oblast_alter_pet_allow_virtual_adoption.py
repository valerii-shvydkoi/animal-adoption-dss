from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0012_alter_adoptionrequest_options_alter_pet_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="pet",
            name="oblast",
            field=models.CharField(
                blank=True, help_text="Область перебування тварини", max_length=100
            ),
        ),
        migrations.AlterField(
            model_name="pet",
            name="allow_virtual_adoption",
            field=models.BooleanField(
                default=False, help_text="Чи можна стать віртуальним опікуном"
            ),
        ),
    ]
