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
 * Implementing the algorithm from Chang et al. (2003) http://www.iis.sinica.edu.tw/papers/fchang/1362-F.pdf
 * The algorithm goes through the image one pixel at a time, from top left to bottom right. When it finds a black pixel, there are three possibilities :
 *          - The pixel is from an external contour
 *          - The pixel is from an internal contour
 *          - The pixel is not in a contour
 * In the first case, it means the pixel has a white unlabeled pixel above it. Then the function contourTracing is called, and will label the whole contour of the particule.
 * If the pixel is not in an external contour, and the pixel under it is white, then the same function as before, contourTracing, is called and will label the inner contour.
 * Finally, if the pixel does not belong to any contour, it simply takes the label from its left neighbor.
 *
 *
 *
 * @param {TImage} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {type} A set of Regions Of Interest (ROI) as a list of lists of coordinates
 * @author Martin Binet
 */

const labelling = function (img,copy=true) {

    function labelOuterContour(index){
      // Starts the tracer for the outer contour of the particule
        matrixLabel[index] = label;
        contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 7, matrixLabel, label);
        label++;
    }

    function labelInnerContour(index){
      // Starts the tracer for the inner contour of the particule
        checkPixel();
        contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 3, matrixLabel, pLabel);
    }

    function checkPixel(index){
      // If the pixel has no label, it gets the same as its left neighbor
        (pLabel === 0)? (
          pLabel = matrixLabel[index-1],
          matrixLabel[index] = matrixLabel[index-1]
        ) : null;
    }

  let w = img.width;
  let h = img.height;
  // Création d'une copie de l'image avec une ligne suplémentaire de pixels blanc au dessus
  // Creating a copy of the image with one extra row of white pixels on top
  let img_copy = Array.apply(null, Array(w)).map(Number.prototype.valueOf,0);
  img.getRaster().pixelData.forEach( value => img_copy.push(value));

  // Initialization of the label and the matrix containing it
  let label = 1;
  let matrixLabel = new Array(img.length + w).fill(0);

  img_copy.forEach( function(value, index) {
      pLabel = matrixLabel[index];
      (value === 255) ? (
        (img_copy[index-w] === 0 && pLabel === 0) ? (labelOuterContour(index)) : (
          (img_copy[index+w] === 0 && matrixLabel[index+w] != -1)? labelInnerContour(index) : checkPixel(index)
        )
      ) : null;
    });

    return matrixLabel;
}

/**
 * Starting from a pixel belonging to a contour, calls the tracer function in a loop, and checks at each iteration if two conditions are true :
 *          - The pixel returned by tracer is the same as the second pixel of the contour
 *          - The previous pixel that was returned by tracer is the same as the initial pixel
 * If both conditions are true, the function stops without returning anything.
 *
 *
 *
 * @param {TRaster} img - Input image
 * @param {int} w - width of the input image
 * @param {int} h - height of the input image
 * @param {Array} origin - Coordinates x and y of the first pixel of the contour
 * @param {int} angle - Angle at where to start looking for neighbor. This is used for the function tracer
 * @param {Array} matrixLabel - current matrix contening the labeled objects
 * @param {int} label - current label

 * @author Martin Binet
 */

const contourTracing = function(img, w, h, origin, angle, matrixLabel, label){
  let second;
  let tmp;
  tmp = tracer(img, w, h, origin[0], origin[1], angle, matrixLabel);
  (tmp != null) ? (
    second = tmp.slice(1, 3),
    angle = (tmp[0] + 6) % 8) : null;
  let nextPixel = second;
  let previousPixel;
  while (second != null && !((JSON.stringify(origin) === JSON.stringify(previousPixel)) && (JSON.stringify(second) === JSON.stringify(nextPixel)))){
    previousPixel = nextPixel;
    tmp = tracer(img, w, h, nextPixel[0], nextPixel[1], angle, matrixLabel);
    (tmp != null) ? (
      nextPixel = tmp.slice(1, 3),
      angle = (tmp[0] + 6) % 8,
      matrixLabel[nextPixel[0] * w + nextPixel[1]] = label
    ) : null;
  }
}

/**
 * From a contour pixel, labels the next pixel in that contour and returns it
 * This function uses the following rotation matrix :
 * 5 6 7
 * 4   0
 * 3 2 1
 * Starting from the input angle, it cheks each neighbor pixel until it finds a black one.
 *
 * @param {TImage} img - Input image
 * @param {int} w - width of the input image
 * @param {int} h - height of the input image
 * @param {int} i - x coordinate of the middle pixel
 * @param {int} j - y coordinate of the middle pixel
 * @param {int} angle - angle at which to start the rotation
 * @param {Array} matrixLabel - current matrix contening the labeled objects
 * @return {Array} An array containing the angle at which the next pixel was found and its coordinates
 * @author Martin Binet
 */
const tracer = function(img, w, h, i, j, angle, matrixLabel){
  let rotationMatrixI = [0, 1, 1, 1, 0, -1, -1, -1];
  let rotationMatrixJ = [1, 1, 0, -1, -1, -1, 0, 1];
  let result = null;
  rotationMatrixI.forEach( function(element){
    (result === null) ? (
    nextI = i+rotationMatrixI[angle],
    nextJ = j+rotationMatrixJ[angle],
    (0 <= nextI && nextI <= h && 0 <= nextJ && nextJ < w ) ? (
      (img[nextI * w + nextJ] === 255) ? (
        result = [angle, nextI, nextJ]
      ) : (
        matrixLabel[nextI * w + nextJ] = -1
      )
    ) : null,
    angle = (angle + 1) % 8
  ) : null;
  });
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

const fitEllipse = function(img){
  //Source : http://www.sciencedirect.com/science/article/pii/S0191814103000932?via%3Dihub
  //http://nicky.vanforeest.com/misc/fitEllipse/fitEllipse.html
}

const area = function (particule){
  return particule.reduce( (number) => number+=1);
}

const centerOfMass = function(particule){
  let Xs = particule.reduce( ((totalX, pixel) => totalX + pixel[0]), 0);
  let Ys = particule.reduce( ((totalY, pixel) => totalY += pixel[1]), 0);
  return ([Math.round(Xs / particule.length), Math.round(Ys / particule.length)]);
}
