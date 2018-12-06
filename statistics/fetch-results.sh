#!/bin/bash
if wget "https://document.chalmers.se/download?docid=00000000-0000-0000-0000-00001C968DC6" -O temp.xlsx > /dev/null; then

newSize=$(stat -c%s temp.xlsx)
oldSize=$(stat -c%s results.xlsx)
if [[ "$newSize" -gt "$oldSize" ]]; then
    mv -f temp.xlsx results.xlsx
    mongo --eval "db.results.drop();"
    node addFields.js
fi
fi