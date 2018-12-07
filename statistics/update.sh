#!/bin/bash
cd "$(dirname "$0")";
if wget "https://document.chalmers.se/download?docid=00000000-0000-0000-0000-00001C968DC6" -O "temp.xlsx" > /dev/null; then

newSize=$(stat -c%s temp.xlsx)
if [ -f "results.xlsx" ]
then
	oldSize=$(stat -c%s results.xlsx)
else
	oldSize=0
fi
if [[ "$newSize" -gt "$oldSize" ]]; then
    mv -f temp.xlsx results.xlsx
    mongo --eval "db.results.drop();"
    node addFields.js
    rm "temp.xlsx"
else
    echo "Downloaded file is not larger."
fi
fi