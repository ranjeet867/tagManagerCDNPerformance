#!/bin/bash
for run in {1..1000}
do
  echo "Starting...$run"
  /Applications/phantomjs ~/Sites/networkData/index.js &&
  sed -i "" '1,1d' url.csv
done
