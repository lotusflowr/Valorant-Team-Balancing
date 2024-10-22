#!/bin/bash

while getopts m:n flag

do
  case "${flag}" in
    m) mode=${OPTARG};;
    n) nobuild=1;;
  esac
done

if ! [ $nobuild ]; then
  echo "Building deploy package"
  npm run build
fi

if [ $mode == "dev-kili" ]
then
  echo "Preparing to deploy code.js to Kili's dev environment"
  cp .clasp-dev-kili.json .clasp.json
elif [ $mode == "dev-lotus" ]
then
  echo "Preparing to deploy code.js to Lotus's dev environment"
  cp .clasp-dev-lotus.json .clasp.json
else
  echo "Usage: bash deploy.sh [dev-kili|dev-lotus]"
  exit 1
fi

npx clasp push
