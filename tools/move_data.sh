#!/bin/bash

# Move data
readonly DATA=$(dirname `pwd`)/data
readonly TOOL=$(dirname `pwd`)/tools
echo moving $1 to $DATA
cp -r $TOOL/data/$1/* $DATA
cd ../data
# Commit data
set -x
git add .
git commit -am "Update data @$1"
git push origin master
