for run in {1..87}
do
  echo "Hello World"
  phantomjs index.js
  sleep 600000
  sed -i '1,50d' url.csv
done
