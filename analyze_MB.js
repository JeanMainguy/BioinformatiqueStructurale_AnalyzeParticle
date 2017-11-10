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
 * Finds the objects in an image and return an object containing lists of coordinates such as :
 * o = {1:[[1, 1], [2, 1]], 2:[[4, 4]]}
 * 8-connected components
 * Implementing the algorithm from Chang et al. (2003)
 *
 * @params {type} <name> - <Description>
 * @return {type} - <Description>
 * @author
 */

const labelling = function (img,copy=true) {

  let w = img.width;
  let h = img.height;
  // Creating a copy of the image that has a extra white row at the top
  let img_copy = [];
  for(let i=0;i<h;i++){
    for(let j=0;j<w;j++){
      if(i===0){
        img_copy[j] = 0;
      }
      else{
        img_copy[w * (i) + j] = img.pixelData[w * (i-1) + j];
      }
    }
  }
  console.log(img_copy);

  let label = 1;
  let matrixLabel = new Array(img.length + w).fill(0);


  for(let i=1;i<h+1;i++){
    for(let j=0;j<w;j++){
      console.log(matrixLabel[2, 2]);
      let p = img_copy[i * w + j];
      let pLabel = matrixLabel[i * w + j];
      console.log("checking pixel at " + (i-1) + ", " + j);
      if(p === 255){
        console.log("pixel is black");
        //Checking if the black pixel has a white pixel above. If that is the
        //case, it must be an external contour and we execute contour tracing
        if(img_copy[(i-1) * w + j] === 0 && pLabel === 0 && matrixLabel[(i-1) * w + j] != -1){
          console.log("pixel is from external contour");
          matrixLabel[i * w + j] = label;
          let secondPixel = tracer(img_copy, w, h, [i, j], 1, matrixLabel);
          if (secondPixel != null){
            console.log("pixel has neighbors");
            let nextPixel = secondPixel;
            let rotation = secondPixel[0];
            let coords = secondPixel[1];
            while(JSON.stringify(coords) != JSON.stringify([i,j]) && JSON.stringify(tracer(img_copy, w, h, coords, rotation, matrixLabel)) != JSON.stringify(secondPixel)){
              console.log("check neighbor for " + coords);
              matrixLabel[coords[0] * w + coords[1]] = label;
              nextPixel = tracer(img_copy, w, h, coords, rotation, matrixLabel);
              rotation = nextPixel[0];
              coords = nextPixel[1];
            }
          }
          label += 1;
        }
        //Checking if the pixel under is white. Then it must be an internal
        //contour. We execute contour tracing for the internal contour.
        else if (img_copy[(i+1) * w + j] === 0 && matrixLabel[(i+1) * w + j] != -1) {
          if(pLabel === 0){
            pLabel = matrixLabel[i * w + j -1];
            matrixLabel[i * w + j] = matrixLabel[i * w + j -1];
          }
          let secondPixel = tracer(img_copy, w, h, [i, j], 5, matrixLabel);
          if (secondPixel != null){
            let nextPixel = secondPixel;
            let rotation = secondPixel[0];
            let coords = secondPixel[1];
            while(JSON.stringify(coords) != JSON.stringify([i,j]) && JSON.stringify(tracer(img_copy, w, h, coords, rotation, matrixLabel)) != JSON.stringify(secondPixel)){
              console.log("check neighbor for " + coords);
              matrixLabel[coords[0] * w + coords[1]] = label;
              nextPixel = tracer(img_copy, w, h, coords, rotation, matrixLabel);
              rotation = nextPixel[0];
              coords = nextPixel[1];
            }
          }
        }
        else if(pLabel === 0){
          matrixLabel[i * w + j] = matrixLabel[i * w + j -1]
          label += 1;
        }
      }
    }
  }
  console.log(`labelling`);
  return matrixLabel;
}

const tracer = function (img, w, h, index, previous, labelMatrix){
  console.log("**********************************************************");
  console.log("in tracer for pixel at " + index);

  let i = index[0];
  let j = index[1];
  let rotationMatrixI = [0, -1, -1, -1, 0, 1, 1, 1];
  let rotationMatrixJ = [1, 1, 0, -1, -1, -1, 0, 1];
  let rotationIndex = (previous + 6) % 8;
  let neighbors = [];
  for(let r=0;r<8;r++){
    console.log("checking pixel at : " + rotationIndex);
    console.log(img[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]])
    if(img[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]] === 255){
      console.log("pixel is black, exit the tracer with next pixel at " + i+rotationMatrixI[rotationIndex] + "," + j+rotationMatrixJ[rotationIndex]);
      console.log("**********************************************************");
      neighbors.push(rotationIndex);
      neighbors.push([i+rotationMatrixI[rotationIndex], j+rotationMatrixJ[rotationIndex]]);
      return neighbors;
    }
    else{
      console.log("pixel is white");
      labelMatrix[(i+rotationMatrixI[rotationIndex]) * w + j+rotationMatrixJ[rotationIndex]] = -1;
    }
    rotationIndex = (rotationIndex + 1) % 8;
  }
  console.log("aucun voisin trouvé")
  console.log("**********************************************************");
  return null;
}

/**
 * <Description>
 *
 * @params {type} <name> - <Description>
 * @return {type} - <Description>
 * @author
 */
const measure = function (params) {
  return function (img,copy=true) {
    // TODO
    console.log(`measure ${params}`);
    return new TMeasurements();
  }
}

let img = new TImage();
//img.pixelData = [0, 0, 255, 255, 0, 0, 0, 0, 0, 0, 255, 255, 0, 0, 0, 0, 255, 0, 0, 0, 0, 255, 255, 0, 0];
img.pixelData = [0, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
img.width = 5;
img.height = 5;
img.length = 25;

result = labelling(img);
console.log(result);
