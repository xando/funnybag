from __future__ import with_statement

import os
from fabric.api import *

from fabric.contrib.project import rsync_project

env.project_name = 'project_name'

def xando():
    env.hosts = ['xando.pl']
    env.path = '/home/services/www/funnybag'
    env.user = 'seba'

def setup():
    run('mkdir -p %s; cd %s; virtualenv .;' % (env.path,env.path))

def push():
    "Get new development code to device"

    rsync_project(remote_dir="/home/services/www/funnybag/",
                  local_dir=".",
                  # delete=True,
                  exclude=[".git*",
                           "*.pyc",
                           "*.pyo"])

    run("chown :www-data -R /home/services/www/funnybag")
    run("chmod g+rw -R /home/services/www/funnybag/funnybag/db")


def requirements():
    "Install the required packages from the requirements file using pip"

    run('cd %s; pip install -E . -r requirements.txt' % env.path)

def restart():
    "Restart apache"

    sudo("/etc/init.d/apache2 restart")

def deploy():
    "Full deploy: push and start"

    push()
    requirements()
    restart()


if __name__ == '__main__':
    subprocess.call(['fab', '-f', __file__, 'deploy'])
