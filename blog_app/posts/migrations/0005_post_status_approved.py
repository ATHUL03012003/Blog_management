from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0004_post_rejection_feedback"),
    ]

    operations = [
        migrations.AlterField(
            model_name="post",
            name="status",
            field=models.PositiveSmallIntegerField(
                choices=[
                    (1, "Draft"),
                    (2, "Review"),
                    (3, "Published"),
                    (4, "Rejected"),
                    (5, "Approved"),
                ],
                default=1,
            ),
        ),
    ]
