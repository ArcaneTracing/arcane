#!/bin/sh
export BACKEND_URL="${BACKEND_URL:-http://backend:8085}"
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
