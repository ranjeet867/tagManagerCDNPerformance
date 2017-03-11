#!/bin/bash
for run in {1..95}
do
  echo "Hello World"
  phantomjs index.js
  sleep 1200000 & 
  sed -i '1,50d' url.csv
done
