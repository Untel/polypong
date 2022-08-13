#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color
printf "${RED}"

openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
  -out ${SSL_PATH}.cert \
  -keyout ${SSL_PATH}.key \
  -subj "/C=FR/ST=Paris/L=Paris/O=42 School/OU=adda-sil/CN=${DOMAIN_NAME}/subjectAltName=DNS:${DOMAIN_NAME}/keyUsage=digitalSignature/extendedKeyUsage=serverAuth"

