#! /bin/bash

###
# Downloads .env from google cloud secret manager
# Usage: ./devops/cmds/get-env.sh [-f]
# -f: force overwrite of existing .env file
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

FORCE=false
ENV_PATH=".env"

while getopts "f" opt; do
  case ${opt} in
    f )
      FORCE=true
      ;;
    \? )
      echo "Invalid option: -$OPTARG" 1>&2
      exit 1
      ;;
  esac
done

if [ -f "$ENV_PATH" ] && [ "$FORCE" != true ]; then
  echo ".env file already exists. Use -f flag to overwrite."
  exit 1
fi

gcloud --project=digital-ucdavis-edu secrets versions access latest --secret=ucdlib-wp-plugin-downloader-env > $ENV_PATH

echo "Env downloaded to $ENV_PATH"
