FROM dpage/pgadmin4

USER root

ENV BUILD_DEPS="gettext"  \
    RUNTIME_DEPS="libintl"

RUN set -x && \
    apk add --update $RUNTIME_DEPS && \
    apk add --virtual build_deps $BUILD_DEPS &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps

ADD ./servers.json.conf /tmp/servers.json.conf
ADD ./pgpass.sh /tmp/pgpass.sh

ENTRYPOINT [ "/bin/sh", "/tmp/pgpass.sh" ]
