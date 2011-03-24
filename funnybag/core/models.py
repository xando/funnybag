from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.utils.safestring import mark_safe
from django.template import Context, loader


class Record(models.Model):
    title = models.CharField(max_length=1024)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return "%s :%s" % (self.id, self.title)


class RecordBlock(models.Model): # Proxy
    record = models.ForeignKey('Record', related_name="blocks")
    sequence = models.PositiveIntegerField()

    data_type = models.ForeignKey(ContentType)
    data_id = models.PositiveIntegerField()
    data = generic.GenericForeignKey('data_type', 'data_id')

    class Meta:
        ordering = ['sequence']

    def __unicode__(self):
        return "%s %s" % (self.record.title, self.data.__class__.__name__)


class Text(models.Model):
    type = "text"
    text = models.TextField()

    def render(self):
        return self.text

    def __unicode__(self):
        return self.text


class Video(models.Model):
    type = "video"
    embed = models.TextField()

    def render(self):
        return mark_safe(self.embed)


class Map(models.Model):
    type = "map"
    location = models.CharField(max_length=1024)

    def render(self):
        return self.location


class Image(models.Model):
    type = "image"
    image = models.ImageField(upload_to="blocks/images")

    def render(self):
        template = loader.get_template('core/blocks/image.html')
        return template.render(Context({'image': self.image}))

    def save(self, *args, **kwargs):
        super(Image, self).save(*args, **kwargs)
        from easy_thumbnails.files import get_thumbnailer
        tumb = get_thumbnailer(self.image)
        tumb.generate_thumbnail({'size': (650, 650)})
# mark_safe('<img src="%s" />' % self.image.url)


# ToDo:
# Image, ImageGallery, Code, Map
