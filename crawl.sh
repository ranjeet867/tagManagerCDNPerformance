#!/bin/bash
for run in {1..1000}
do
  echo "Starting...$run"
  phantomjs index.js &&
  sleep 120000 &
  sed -i '1,10d' url.csv
done
