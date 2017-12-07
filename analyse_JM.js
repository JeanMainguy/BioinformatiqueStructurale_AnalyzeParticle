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
 * @author Jean Mainguy
 */
const labelling = function (img,copy=true) {

  let raster = img.getRaster();
  union_find = {label_cmpt:0};

  let label_img = new Array(img.height*img.width); //empty array that will contain labels of the pixels

  // First Pass
  raster.pixelData.map(function(pix, i){
    pix == 255 ? label_pix(i, label_img, raster.width, union_find) : undefined;
  });

  // Second Pass
  label_img = label_img.map(function(label, i){return union_find[label_img[i]]})
  console.log(union_find);
  return label_img;
}

const label_pix = function(i, label_img, w, union_find) {

    let label_up = label_img[i-w]; //store label of pixel above i. may bereal label or undefined/null
    let label_left = i % w == 0 ? undefined : label_img[i-1]; // store label of pixel right before i. may be real label or undefined/null

    let label_i = label_up !== undefined && label_left !== undefined ? (
        notify_union_find(label_up, label_left, union_find), //va notifier meme si les deux label sont pareil donc c'est pas top..
        label_up > label_left ? label_left : label_up

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
    labelA < labelB ? (union_find[labelB] = union_find[labelA]) : (union_find[labelA] = union_find[labelB]);
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

const show = function(result, h, w){
    let line = "";
    let show = "";
    for(let i=0;i<(h*w);i++){

        if(i % w == 0){
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
}

console.log("labelling 2 pass");


let img = new T.Image('uint8',100,100);
img.setPixels(img_binary);
let win0 = new T.Window('Binary');
let view0 = T.view(img.getRaster());
// Create the window content from the view
win0.addView(view0);
// Add the window to the DOM and display it
win0.addToDOM('workspace');


// data = [
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 255, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 0, 0, 255, 255, 0, 0, 0, 0, 0,
//   0, 0, 255, 255, 0, 0, 0, 0, 0, 0];
//
// let img;
// img = new T.Image('uint8',10,10);


// img.setPixels(data);


result = labelling(img);
for(let i=0;i<result.length;i++){
    if (result[i] == undefined){
        result[i] = 255;
    }
}
// show(result, img.height, img.width)
// result = result.map(function(i){i*50})
show(result, img.height, img.width)
let img_result = new T.Image('uint8',100,100);
img.setPixels(result);
let win1 = new T.Window('Binary result');
let view1 = T.view(img_result.getRaster());
// Create the window content from the view
win1.addView(view1);
// Add the window to the DOM and display it
win1.addToDOM('workspace');
// show(result, img.height, img.width)


// let win1 = new T.Window('Labbeling');
// let view1 = T.view(img.getRaster());
// Create the window content from the view
// win0.addView(view0);
// // Add the window to the DOM and display it
// win0.addToDOM('workspace');
