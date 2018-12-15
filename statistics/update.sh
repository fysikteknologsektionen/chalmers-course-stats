#!/bin/bash
# Expected filename for addFields.js
result='results.xlsx'
cd "$(dirname "$0")";
if wget -q "https://document.chalmers.se/download?docid=00000000-0000-0000-0000-00001C968DC6" -O "temp.xlsx"; then
  if [[ ! -f $result ]] || [[ $(cmp -s $result "tmp.xlsx") ]] || [[ $1 ]]; then
    mv -f temp.xlsx $result
    mongo --eval "db.dropDatabase();"
    node addFields.js
  else
    rm -f temp.xlsx
    echo "File has not been updated"
  fi
fi
