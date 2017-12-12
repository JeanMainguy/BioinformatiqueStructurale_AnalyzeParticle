#!/bin/bash

img_txt=$1
img_js="${img_txt/.txt/.js}"

echo "let test_binary = [" > $img_js
sed 's/\t/,/g' $img_txt >> $img_js 
echo "];" >> $img_js 
