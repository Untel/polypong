#!/bin/sh

envsubst < /tmp/servers.json.conf > ${CONF_DIR}/servers.json;
echo "$POSTGRES_HOST:$POSTGRES_PORT:*:$POSTGRES_USER:$POSTGRES_PASSWORD" > ${CONF_DIR}/pgpass;

cat ${CONF_DIR}/servers.json;
cat ${CONF_DIR}/pgpass;

/bin/sh /entrypoint.sh
