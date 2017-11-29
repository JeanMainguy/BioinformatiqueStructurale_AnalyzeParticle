/*
 *  TIMES: Tiny Image ECMAScript Application
 *  Copyright (C) 2017  Jean-Christophe Taveau.
 *
 *  This file is part of TIMES
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,Image
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with TIMES.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Authors:
 * Jean-Christophe Taveau
 */

/**
 * @module analyze
 */

/**
 * Label an image as a set of Regions Of Interest (ROI)
 *
 * @param {TRaster} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {type} A set of Regions Of Interest (ROI)
 * @author TODO
 */
const labelling = function (img,copy=true) {
  // TODO
  let raster = img.getRaster();
  console.log(`labelling`);
  union_find = {label_cmpt:0};
  let label_img = new Array(img.height*img.width); //sempty array that will contain labels of the pixels
  for(let i=0;i<label_img.length;i++){
      if(raster.get(i) == 255){
          console.log(label_img[i]);
          label_me(i, label_img, img.width);
          console.log(label_img[i]);
      }
  }
  console.log(union_find);
  return label_img;
}

const label_me = function(i, label_img, w) {
    let label_up = label_img[i-w]; //store label of pixel above i. may bereal label or undefined/null
    let label_left = i % w == 0 ? undefined : label_img[i-1]; // store label of pixel right before i. may be real label or undefined/null
    console.log('up is ', label_up);
    console.log('left is ', label_left);

    let label_i = label_up !== undefined && label_left !== undefined ? (
        notify_union_find(label_up, label_left, union_find), //va notifier meme si les deux label sont pareil donc c'est pas top..
        label_up > label_left ? label_left : label_up
        // notification to
    ) : (
        label_up == undefined && label_left == undefined ? (
            new_label(union_find)
        ) : (
            label_up == undefined ? label_left : label_up
        )
    );

    label_img[i] = label_i;
}

const notify_union_find = function(labelA, labelB, union_find){
    labelA < labelB ? (union_find[labelB] = labelA) : (union_find[labelA] = labelB);
}
const new_label = function(union_find){
    union_find.label_cmpt ++;
    union_find[union_find.label_cmpt] = union_find.label_cmpt;
    return union_find.label_cmpt;
}

/**
 * Measure a set of Regions Of Interest (ROI)
 *
 * @param {type} params - Measurements Parameters (eg. Area, Centroid)
 * @param {type} roiset - A set of ROIs
 * @param {boolean} copy - Useless. Just here for compatibility
 * @return {type} Measurements and/or result image
 * @author TODO
 */
const measure = function (params) {
  return function (roiset,copy=true) {
    // TODO
    console.log(`measure ${params}`);
    return new TMeasurements();
  }
}




data = [
  0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
  0, 255, 0, 0, 0, 255, 255, 0, 0, 0,
  0, 255, 255, 0, 0, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 255, 255, 0, 0, 0,
  0, 0, 0, 255, 255, 0, 0, 0, 0, 0,
  0, 0, 255, 255, 0, 0, 0, 0, 0, 0];

let img;
img = new T.Image('uint8',10,10);


// data = [
//     1, 1, 0,
//     0, 0, 0,
//     0, 0, 1,
//     1, 0, 1,
// ]
//
// img = new T.Image('uint8',3,4);


img.setPixels(data);


result = labelling(img);


// PROVISOIRE PERMET DE PRINTER LIMAGE DANS LA CONSOLE
let line = "";
let show = "";
for(let i=0;i<(img.height*img.width);i++){

    if(i % img.width == 0){
        console.log(line);
        console.log('  ______________')
        line = "";
        // console.log(i);
    }
    if( result[i] == undefined){
        show = 'X';
    }
    else{
        show = result[i];
    }
    line += "   " + show;
}
console.log(line);

let win0 = new T.Window('Boats');
let view0 = T.view(img.getRaster());
// Create the window content from the view
win0.addView(view0);
// Add the window to the DOM and display it
win0.addToDOM('workspace');
