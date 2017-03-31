FROM debian:jessie

MAINTAINER theplatypus <nicolas.bloyet@see-d.fr>

USER root

# ---- install node and npm
RUN \
  apt-get update && \
  apt-get install -y apt-utils gnupg curl wget && \
  apt-get install -y libssl-dev libsasl2-dev

# install node & npm from apt
RUN apt-get -qq update
RUN apt-get install -y nodejs npm

# update to the latest stable node forever
RUN npm install -g n &&\
    n stable

# debian installs `node` as `nodejs`
RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10


# ---- install R:latest from CRAN repos
RUN /bin/echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list

RUN \
    apt-get update && \
    apt-get install -y r-base r-base-dev

# ---- RExpress
RUN mkdir /srv/RExpress
COPY . /srv/RExpress
WORKDIR /srv/RExpress

RUN npm install
WORKDIR /srv/RExpress/lib
CMD node ./api.js

EXPOSE 80
