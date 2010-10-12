from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic

class Record(models.Model):
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    data = generic.GenericForeignKey('content_type', 'object_id')

    created_time = models.TimeField(auto_now_add=True)

    @models.permalink
    def get_absolute_url(self):
        return ('joke.views.details', [str(self.id)])



class RecordBase(models.Model):

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        super(RecordBase, self).save(*args, **kwargs)
        try:
            Record.objects.get(content_type=ContentType.objects.get_for_model(self._meta.model),
                               object_id=self.id)
        except Record.DoesNotExist:
            Record.objects.create(data=self)


class Image(RecordBase):
    title = models.CharField(max_length=512)
    image = models.ImageField(upload_to="record/image")

    def __unicode__(self):
        return self.title


class Quote(RecordBase):
    content = models.TextField()

    def __unicode__(self):
        return "%s ..." % self.content[:100]


class Joke(RecordBase):
    content = models.TextField()

    def __unicode__(self):
        return "%s ..." % self.content[:100]


class Wideo(RecordBase):
    content = models.TextField()

    def __unicode__(self):
        return "%s ..." % self.content[:100]
