import os
from fabric.api import *
from fabric.operations import require
from fabric.contrib.files import sed

env.project_name = 'funnybag'
env.github_login = 'xando'

def setup_production(path="/var/www/%s" % env.project_name, initial_release="master"):
    env.path = path.rstrip("/")

    sudo('apt-get install -y python-setuptools')
    sudo('apt-get install -y python-dev')
    sudo('apt-get install -y apache2')
    sudo('apt-get install -y libapache2-mod-wsgi')
    sudo('apt-get install -y libjpeg8-dev')

    sudo('easy_install pip')
    sudo('pip install virtualenv')

    sudo('mkdir -p %(path)s' % env)

    _download_release(initial_release)
    _install_requirements()
    _configure_webserver()
    _restart()


def update_production(path="/var/www/%s" % env.project_name, release="master"):
    env.path = path.rstrip("/")

    _download_release(release)
    _install_requirements()
    _restart()


def _download_release(release):
    require("path")

    env.release = release
    env.release_download_tmp_file = "/tmp/%(release)s.tgz" % env

    sudo("wget http://github.com/%(github_login)s/%(project_name)s/tarball/%(release)s -O %(release_download_tmp_file)s --no-check-certificate" % env)
    sudo("tar xzvf %(release_download_tmp_file)s --strip-components=1 --directory=%(path)s" % env)
    sudo("rm -f %(release_download_tmp_file)s" % env)


def _install_requirements():
    require("path")

    try:
        del(os.environ['PIP_VIRTUALENV_BASE'])
    except KeyError:
        pass
    sudo('pip -E %s/.virtualenv install -r %s/requirements.txt' % (env.path, env.path))


def _configure_webserver():
    require("path")

    sed("%s/apache.virtualhost" % env.path,
        "PATH", env.path, use_sudo=True)

    sed("%s/apache.virtualhost" % env.path,
        "PROJECT_NAME", env.project_name, use_sudo=True)

    sed("%s/apache.virtualhost" % env.path,
        "HOST", env.host, use_sudo=True)

    sudo("cp %s/apache.virtualhost /etc/apache2/sites-available/%s"
         % (env.path, env.project_name))
    sudo("a2ensite %s" % env.project_name)

    sed("%s/apache.wsgi" % env.path,
        "PROJECT_NAME", env.project_name, use_sudo=True)

def _restart():
    sudo("/etc/init.d/apache2 reload")

