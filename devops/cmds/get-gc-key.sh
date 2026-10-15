#! /bin/bash

###
# Downloads the google cloud service account key used to write to the plugins bucket
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

mkdir -p ./secrets

gcloud --project=digital-ucdavis-edu secrets versions access latest --secret=ucdlib-wp-plugin-downloader-service-account > ./secrets/gc-service-account-creds.json

echo "Key downloaded to secrets/gc-service-account-creds.json"
