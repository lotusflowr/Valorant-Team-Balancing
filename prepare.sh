#!/bin/bash

if [ "$1" == "dev-kili" ]
then
  echo "Preparing to deploy code.js to Kili's dev environment"
  cp .clasp-dev-kili.json ../.clasp.json
elif [ "$1" == "dev-lotus" ]
then
  echo "Preparing to deploy code.js to Lotus's dev environment"
  cp .clasp-dev-lotus.json .clasp.json
else
  echo "Usage: prepare [dev-kili|dev-lotus]"
  exit 1
fi
