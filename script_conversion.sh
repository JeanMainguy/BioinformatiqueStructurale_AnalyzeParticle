#!/bin/bash

img_txt=$1  #argument a donner
img_js="${img_txt/.txt/.js}"
name_array="${img_txt/[a-zA-Z0-9]*\//}"
name_array="${name_array/.txt/}"


echo "let $name_array = [" > $img_js
sed 's/\t/,/g' $img_txt >> $img_js
echo "];" >> $img_js
