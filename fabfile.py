import os
from fabric.api import *
from fabric.operations import require
# from fabric.contrib.project import rsync_project
from fabric.contrib.files import sed


# env.path = None
env.project_name = 'funnybag'
env.github_login = 'xando'


# def xando_org():
#     env.hosts = ['xando.org']
#     env.path = '/var/www/%s' % env.project_name
#     env.user = 'seba'

# def setup():
#     run('mkdir -p %s; cd %s; virtualenv .;' % (env.path,env.path))

# def push():
#     if env.path:
#         rsync_project(remote_dir=env.path,
#                       local_dir=".",
#                       # delete=True,
#                       exclude=[".git*",
#                                "*.pyc",
#                                "*.pyo"])

#         with cd(env.path):
#             sudo("chown :www-data -R .")
#             sudo("chmod g+rw -R .")


#     else:
#         print("Deployemnt path not set")

#     # "Get new development code to device"


def setup_production(path="/var/www/%s" % env.project_name, initial_release="master"):
    #TODO: switch to reall check. This normalization is pretty odd
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
    sudo('pip -E %(path)s/.virtualenv install -r %(path)s/requirements.txt' % env)


def _configure_webserver():
    require("path")


    sed("%s/apache.virtualhost" % env.path,
        "PATH", env.path, use_sudo=True)

    sed("%s/apache.virtualhost" % env.path,
        "PROJECT_NAME", env.project_name, use_sudo=True)

                             # limit='', use_sudo=False, backup='.bak')
    # env.esc_path = env.path.replace('/','\/')
    # require("path", "esc_path")

    # sudo("sed -i 's/${PATH}/%(esc_path)s/g' %(path)s/deploy/apache.virtualhost" % env)

    # # TODO: put here diff check between config versions
    # sudo("cp %(path)s/deploy/apache.virtualhost /etc/apache2/sites-available/qualitio" % env)

    # sudo("a2ensite qualitio")
# def requirements():
#     "Install the required packages from the requirements file using pip"

#     run('cd %s; pip install -E . -r requirements.txt' % env.path)

# def restart():
#     "Restart apache"

#     sudo("/etc/init.d/apache2 restart")

# def deploy():
#     "Full deploy: push and start"

#     push()
#     requirements()
#     restart()

