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
        tracerRecursif(img_copy, w, h, [1, [Math.floor(index/w), (index)%w]], [1, [Math.floor(index/w), (index)%w]], null, matrixLabel, label);
        label++;
        return true;
    }

    function labelInnerCountour(index){
        console.log("InnerCountour");
        checkPixel();
        tracerRecursif(img_copy, w, h, [5, [Math.floor(index/w), (index)%w]], [5, [Math.floor(index/w), (index)%w]], null, matrixLabel, pLabel);
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

const tracerRecursif = function(img, w, h, previous, origin, second, labelMatrix, label){

    function checkIfNeighbor(){
        isNeighbor = false;
        (img[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]] === 255) ? (
            console.log("Giving label to : " + JSON.stringify((i+rotationMatrixI[rotationIndex])) + "," + JSON.stringify(j+rotationMatrixJ[rotationIndex])),
            labelMatrix[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]] = label,
            neighbor.push(rotationIndex),
            neighbor.push([i+rotationMatrixI[rotationIndex], j+rotationMatrixJ[rotationIndex]]),
            isNeighbor = true
        ) : (
            console.log("Giving -1 to " + JSON.stringify((i+rotationMatrixI[rotationIndex])) + "," + JSON.stringify(j+rotationMatrixJ[rotationIndex])),
            labelMatrix[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]] = -1
        );
          return isNeighbor;
    }

  let i = previous[1][0];
  let j = previous[1][1];
  let rotationMatrixI = [0, 1, 1, 1, 0, -1, -1, -1];
  let rotationMatrixJ = [1, 1, 0, -1, -1, -1, 0, 1];
  let rotationIndex = (previous[0] + 6) % 8;
  let neighbor = [];
  let isNeighbor = false;
  let isItOver = false;
  let firstPass = true;

  while(isItOver === false){
      for(let r=0;r<8;r++){
          isNeighbor = (0 <= i+rotationMatrixI[rotationIndex] <= h && 0 <= j+rotationMatrixJ[rotationIndex] < w) ? checkIfNeighbor() : false;
          isNeighbor ?
              (firstPass = (second === null) ? second = [rotationIndex, [i+rotationMatrixI[rotationIndex], j+rotationMatrixJ[rotationIndex]]] : false
          ) : null;
          isItOver = firstPass ? false : (JSON.stringify(neighbor[1]) === JSON.stringify(second[1]) && JSON.stringify(previous[1]) === JSON.stringify(origin[1]));
          console.log("neighbor" + JSON.stringify(neighbor[1]));
          console.log("second" + JSON.stringify(second));
          console.log("previous" + JSON.stringify(previous[1]));
          console.log("origin" + JSON.stringify(origin[1]));
          prompt();
          rotationIndex = (rotationIndex + 1) % 8;
      }
      isItOver = true;
  }


  //     console.log(rotationIndex);
  //     prompt();
  //
  //     (isItOver) ? r = 9 : (
  //         console.log("neighbor" + JSON.stringify(neighbor[1])),
  //           console.log("second" + JSON.stringify(second)),
  //           console.log("previous" + JSON.stringify(previous[1])),
  //           console.log("origin" + JSON.stringify(origin[1])),
  //         prompt(),
  //         tracerRecursif(img, w, h, neighbor, origin, second, labelMatrix, label)
  //     );
  //
  // }
  return null;
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

let img = new T.Image('uint8', 3, 3);
//let pixelData = [255, 255, 255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
//let pixelData = [0, 0, 0, 0, 255, 255, 0, 0, 0]
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
