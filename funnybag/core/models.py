from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.contrib.auth.models import User

class Record(models.Model):
    data_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    data = generic.GenericForeignKey('data_type', 'object_id')

    created_time = models.DateTimeField(auto_now_add=True)

    @models.permalink
    def get_absolute_url(self):
        return ('core.views.details', [str(self.id)])

    @property
    def template(self):
        return "core/%s.html" % self.data_type.name

    def __unicode__(self):
        return "%s: %s" % (self.data_type.name,
                           self.data.__unicode__())

class RecordBase(models.Model):
    title = models.CharField(max_length=512)
    source = models.URLField(blank=True, verify_exists=True)
    user = models.ForeignKey(User)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.user = kwargs.pop('user', None) #this is created on non request save: admin site, shell
        super(RecordBase, self).save(*args, **kwargs)
        try:
            Record.objects.get(data_type=ContentType.objects.get_for_model(self.__class__),
                               object_id=self.id)
        except Record.DoesNotExist:
            Record.objects.create(data=self)
                                  

class Image(RecordBase):
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
    embed = models.TextField()

    def __unicode__(self):
        return self.title
