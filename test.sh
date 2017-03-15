#!/bin/bash
for run in {1..95}
do
  echo "Starting...$run"
  /Applications/phantomjs ~/Sites/networkData/index.js &&
  sed -i "" '1,50d' url.csv
done
