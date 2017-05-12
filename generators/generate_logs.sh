#!/bin/bash

echo "===================================="
echo "= FIREBASE CROWDFLOWER LOGS TO CSV ="
echo "===================================="

echo "\nNow we create a folder for $@ task"
mkdir "../logs/$@"
echo "\nNow we generate logs of key presses from firebase..."
node key_presses_to_csv.js $@
echo "\nNow we generate logs of clicks from firebase..."
node clicks_to_csv.js $@
echo "\nNow we generate logs of page activity from firebase..."
node page_activity_to_csv.js $@
echo "\nNow we generate logs of tab visibility from firebase..."
node tab_visibility_to_csv.js $@

echo "\nNow we copy the folder with logs to stats-and-graphs folder to be further processed"
cp -r "../logs/$@" "../../stats-and-graphs/logs/$@"

echo "\nDONE"
echo "===================================="