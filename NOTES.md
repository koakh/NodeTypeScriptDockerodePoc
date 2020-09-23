# NOTES

- [Docker : API, C3 Docker Apps Notes : C3Apps](:note:d5924399-2baf-4374-a0ef-e997492f233b)
- [Let's Encrypt / Certificates](:note:7bb9c57a-cbed-4501-84d9-9f7b90ff313a)

all notes are in [Docker:  Docker Engine API : New Setup](:note:4e649508-e7ba-41f8-bf14-b68b643505c9)

## Tets in c3

```shell
$ scp -r ../NodeTypeScriptDockerodePoc c3@c3edu.online:/tmp/
$ cd NodeTypeScriptDockerodePoc
$ sudo rm node_modules/ -R
$ rm package-lock.json
$ sudo rm node_modules/ -R
$ npm i
```

## Generate Certificates in C3

```shell
$ ssh c3@c3edu.online
$ mkdir /srv/docker-engine -p && cd /srv/docker-engine

$ DOMAIN=c3edu.online
$ openssl genrsa -aes256 -out ca-key.pem 4096
c3root

$ openssl req -new -x509 -days 3650 -key ca-key.pem -sha256 -out ca.pem
Country Name (2 letter code) [AU]:PT
State or Province Name (full name) [Some-State]:Coimbra
Locality Name (eg, city) []:Coimbra
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Dev
Organizational Unit Name (eg, section) []:DevDep
Common Name (e.g. server FQDN or YOUR name) []:c3edu.online
Email Address []:mario.monteiro@critical-links.com

$ openssl genrsa -out server-key.pem 4096
$ openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem
# require sudo
$ sudo openssl genrsa -out key.pem 4096
```

## configure docker

```shell
$ sudo mkdir /etc/systemd/system/docker.service.d
$ sudo nano /etc/systemd/system/docker.service.d/override.conf
```

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:2376 --tlsverify --tlscacert=/srv/docker-engine/ca.pem --tlscert=/srv/docker-engine/server-cert.pem --tlskey=/srv/docker-engine/server-key.pem
```

```shell
$ sudo systemctl daemon-reload
$ sudo service docker restart
$ sudo service docker status
```

## Bring certs

```shell
# copy certs to local project path
$ cd certs
$ scp -r c3@c3edu.online:/srv/docker-engine .
$ mv c3 /tmp
$ mv docker-engine/ c3
$ cd ..
```

## Test remote request

```shell
$ HOST=c3edu.online
$ CERTS="--cacert certs/c3/ca.pem --cert certs/c3/server-cert.pem --key certs/c3/server-key.pem"
$ curl https://${HOST}:2376/images/json ${CERTS} | jq
[
  {
    "Containers": -1,
    "Created": 1592318283,
    "Id": "sha256:e20b563f1d640f20d05215e384e87961bdb0d88c4659b62d872f2c7123f5cee9",
    "Labels": null,
    "ParentId": "sha256:792817c04dda36af0fdd711449a0f35bb58ae2426770a53abcd9833f09f10785",
    "RepoDigests": null,
    "RepoTags": [
      "dockerized-cakephp-app_app:latest"
    ],
    ...
```
