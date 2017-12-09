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
 * Finds the objects in an image and return an object containing lists of coordinates such as :
 * o = {1:[[1, 1], [2, 1]], 2:[[4, 4]]}
 * 8-connected components
 * Implementing the algorithm from Chang et al. (2003)
 *
 * @param {TRaster} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {type} A set of Regions Of Interest (ROI)
 * @author TODO
 */

const labelling = function (img,copy=true) {

    function checkPixelAbove(index){
        console.log("checkPixelAbove");
        return (img_copy[index-w] === 0 && pLabel === 0) ? labelOuterCountour(index) : checkPixelUnder(index);
    }

    function checkPixelUnder(index){
        (img_copy[index+w] === 0 && matrixLabel[index+w] != -1)? labelInnerCountour(index) : checkPixel(index);
    }

    function labelOuterCountour(index){
        console.log("OuterCountour");
        console.log("Labelling starting at " + JSON.stringify(Math.floor(index/w)) + "," + JSON.stringify((index)%w));
        matrixLabel[index] = label;
        contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 7, matrixLabel, label);
        label++;
        return true;
    }

    function labelInnerCountour(index){
        console.log("InnerCountour");
        console.log("Labelling starting at " + JSON.stringify(Math.floor(index/w)) + "," + JSON.stringify((index)%w));
        checkPixel();
        contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 3, matrixLabel, pLabel);
        return true;
    }

    function giveLabel(index){
        pLabel = matrixLabel[index-1];
        matrixLabel[index] = matrixLabel[index-1];
    }

    function checkPixel(index){
        (pLabel === 0)? giveLabel(index) : null;
    }

  let w = img.width;
  let h = img.height;
  // Creating a copy of the image that has a extra white row at the top
  let img_copy = Array.apply(null, Array(w)).map(Number.prototype.valueOf,0);
  img.getRaster().pixelData.map( value => img_copy.push(value));

  let label = 1;
  let matrixLabel = new Array(img.length + w).fill(0);
  console.log(matrixLabel);

  img_copy.map( function(value, index) {
      console.log("checking Pixel");
      pLabel = matrixLabel[index];
      (value === 255) ? checkPixelAbove(index) : null;
    });
    return matrixLabel;
}

const contourTracing = function(img, w, h, origin, angle, matrixLabel, label){
  console.log("entering contourTracing");
  console.log(angle);
  let second;
  let tmp;
  tmp = tracer(img, w, h, origin[0], origin[1], angle, matrixLabel);
  console.log(tmp);
  (tmp != null) ? (
    second = tmp.slice(1, 3),
    angle = (tmp[0] + 6) % 8) : null;
  let nextPixel = second;
  let previousPixel;
  console.log("origin :")
  console.log(origin);
  console.log("previous :");
  console.log(previousPixel);
  console.log("second :");
  console.log(second);
  console.log("nextpixel :");
  console.log(nextPixel);
  console.log(angle);
  while (second != null && !((JSON.stringify(origin) === JSON.stringify(previousPixel)) && (JSON.stringify(second) === JSON.stringify(nextPixel)))){
    previousPixel = nextPixel;
    tmp = tracer(img, w, h, nextPixel[0], nextPixel[1], angle, matrixLabel);
    (tmp != null) ? (
      nextPixel = tmp.slice(1, 3),
      angle = (tmp[0] + 6) % 8,
      matrixLabel[nextPixel[0] * w + nextPixel[1]] = label
    ) : null;
    console.log("origin :")
    console.log(origin);
    console.log("previous :");
    console.log(previousPixel);
    console.log("second :");
    console.log(second);
    console.log("nextpixel :");
    console.log(nextPixel);
    console.log(angle);
    //prompt();
  }
}

const tracer = function(img, w, h, i, j, angle, matrixLabel){
  console.log("in tracer ****************");
  let rotationMatrixI = [0, 1, 1, 1, 0, -1, -1, -1];
  let rotationMatrixJ = [1, 1, 0, -1, -1, -1, 0, 1];
  //let rotationIndex = (angle + 6) % 8;
  let result = null;
  rotationMatrixI.forEach( function(element){
    (result === null) ? (
    console.log("checking neighbor"),
    nextI = i+rotationMatrixI[angle],
    nextJ = j+rotationMatrixJ[angle],
    console.log(nextI),
    console.log(nextJ),
    (0 <= nextI && nextI <= h && 0 <= nextJ && nextJ < w ) ? (
      (img[nextI * w + nextJ] === 255) ? (
        console.log("found black pixel"),
        result = [angle, nextI, nextJ]
      ) : (
        matrixLabel[nextI * w + nextJ] = -1
      )
    ) : null,
    angle = (angle + 1) % 8
  ) : null;
  });
  console.log("result = ");
  console.log(result);
  //prompt();
  return result;

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

let img = new T.Image('uint8', 8, 8);
//let pixelData = [255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];
//let pixelData = [255, 255, 255, 255, 0, 255, 255, 255, 255];
let pixelData = [
  0, 255, 255, 255, 255, 255, 0, 255,
  0, 255, 0, 0, 0, 255, 0, 0,
  0, 255, 255, 0, 0, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 255, 255,
  0, 255, 255, 255, 255, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  255, 0, 255, 0, 0, 0, 0, 0];

img.setPixels(pixelData);

console.log(img.getRaster().pixelData);

result = labelling(img);
console.log(result);
console.log(img);
for(let i=0;i<img.length+img.height;i+=img.height){
  console.log(result.slice(i, (i+img.width)));
}
//console.log(result);
//console.log(img)
