from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0005_post_status_approved"),
    ]

    operations = [
        migrations.AlterField(
            model_name="post",
            name="image",
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
