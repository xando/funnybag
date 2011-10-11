from datetime import datetime

from pygments.lexers import get_all_lexers, get_lexer_by_name
from pygments import highlight
from pygments.formatters import HtmlFormatter

from tagging import fields
from mptt.models import MPTTModel, TreeForeignKey

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.utils.safestring import mark_safe
from django.core.exceptions import ValidationError
from django.template import Context, loader
from django.template.loader import render_to_string
from django.template.defaultfilters import slugify, pluralize


class Record(MPTTModel):
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')
    created_by = models.ForeignKey('auth.User')

    title = models.CharField(max_length=1024, blank=True)
    slug = models.SlugField(max_length=40, blank=True)

    modified_time = models.DateTimeField(auto_now=True)
    created_time = models.DateTimeField(auto_now_add=True)

    tags = fields.TagField()

    class Meta:
        ordering = ['-created_time']

    @property
    def created_time_simple(self):
        delta = datetime.now() - self.created_time

        days = delta.days
        hours = delta.seconds / 60 / 60
        minutes = delta.seconds / 60
        seconds = delta.seconds

        if days:
            delta_units = (days, "day")
        elif hours:
            delta_units = (hours, "hour")
        elif minutes:
            delta_units = (minutes, "minute")
        else:
            delta_units = (seconds, "second")

        return "%s %s%s ago" % (delta_units[0], delta_units[1], pluralize(delta_units[0]))

    def get_absolute_url(self):
        return "#%s/%s/" % (self.slug, self.id)

    def save(self, *args, **kwargs):
        if self.title:
            self.slug = slugify(self.title)
        super(Record, self).save(*args, **kwargs)

    def __unicode__(self):
        if self.parent:
            return "Comment %s" % (self.id)
        return "%s :%s" % (self.id, self.title)

    def clean(self):
        #ToDo: non comments, how to make it better? Overload Validation Error?
        if not (self.parent or self.title):
            error = ValidationError("")
            error.message_dict = {u"title": u"Field is required."}
            raise error


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
        return render_to_string('core/blocks/text.html', {"text": self.text})

    def __unicode__(self):
        return self.text


class Link(models.Model):
    type = "link"
    name = models.CharField(blank=True, max_length=1024)
    link = models.URLField(verify_exists=False)

    def render(self):
        if self.name:
            return mark_safe('<a target="_blank" href="%s">%s</a>' % (self.link, self.name))
        return mark_safe('<a target="_blank" href="%s">%s</a>' % (self.link,self.link))

    def __unicode__(self):
        return self.link


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

    def __init__(self, *args, **kwargs):
        kwargs.pop('remote_file', None)
        local_file = kwargs.pop('local_file', None)
        if local_file:
            kwargs['image'] = local_file
        super(Image, self).__init__(*args, **kwargs)

    def render(self):
        return render_to_string('core/blocks/image.html', {'image': self.image})

    def save(self, *args, **kwargs):
        super(Image, self).save(*args, **kwargs)
        from easy_thumbnails.files import get_thumbnailer
        tumb = get_thumbnailer(self.image)
        tumb.generate_thumbnail({'size': (650, 650)})


class Code(models.Model):
    type = "code"
    LANGUAGE_NAME = map(lambda lexer: (lexer[1][0], lexer[0]),get_all_lexers())

    language = models.CharField(max_length=30, choices=LANGUAGE_NAME)
    code = models.TextField()

    def render(self):
        lexer = get_lexer_by_name(self.language)
        formatter = HtmlFormatter(linenos=True)
        code = mark_safe(highlight(self.code, lexer, formatter))
        template = loader.get_template('core/blocks/code.html')
        return template.render(Context({'code': code,
                                        'styles' : formatter.get_style_defs('.highlight')}))


# ToDo:
# Image, ImageGallery, Map, Poll
# Text: textile
