#!/bin/bash
for run in {1..125}
do
  echo "Starting...$run"
  phantomjs index.js &&
  sed -i '1,50d' url.csv
done
