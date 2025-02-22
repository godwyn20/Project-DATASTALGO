# Generated by Django 4.2.19 on 2025-02-22 14:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0002_add_publication_date'),
    ]

    operations = [
        migrations.RenameField(
            model_name='book',
            old_name='google_books_id',
            new_name='open_library_id',
        ),
        migrations.AddField(
            model_name='book',
            name='cover_id',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='book',
            name='isbn',
            field=models.CharField(blank=True, max_length=13),
        ),
        migrations.AddField(
            model_name='book',
            name='number_of_pages',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='book',
            name='subjects',
            field=models.TextField(blank=True),
        ),
    ]
