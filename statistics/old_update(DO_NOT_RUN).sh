#!/bin/bash
# Expected filename for addFields.js
#DO NOT RUN THIS FILE UNLESS YOU KNOW WHAT YOU'RE DOING
#Uncomment the lines below for full functionality
result='results.xlsx'
cd "$(dirname "$0")";
if wget -q "https://document.chalmers.se/download?docid=00000000-0000-0000-0000-00001C968DC6" -O "temp.xlsx"; then
  if [[ ! -f $result ]] || [[ $(cmp -s $result "temp.xlsx") ]] || [[ $1 ]]; then
    mv -f temp.xlsx $result
    #mongo --eval "db.dropDatabase();"
    #node addFields.js
  else
    rm -f temp.xlsx
    echo "File has not been updated"
  fi
fi
