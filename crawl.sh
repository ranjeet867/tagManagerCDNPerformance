#!/bin/bash
for run in {1..211}
do
  echo "Starting...$run"
  phantomjs index.js &&
  sed -i '1,1d' url.csv
done
