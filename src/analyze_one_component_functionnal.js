/*  TIMES: Tiny Image ECMAScript Application
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
 *  along with TIMES.  If not, see &lt;http://www.gnu.org/licenses/>.
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
 * Once the first pixel of a connected component is found, all the connected pixels of that connected component are labelled before going onto the next pixel in the image
 * @param {TImage} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {Array} an Array of label
 * @author Rokhaya BA
 */
const labelling = function (img,copy=true) {

  const labelComponent = function(){
    while (pixelList.length != 0)
    {
      let index = pixelList[0]; // stores the index of the first pixel and then remove it from the pixel list
      pixelList.shift();
      let ind_up = index - width;
      let ind_down = index + width;
      let ind_right = ((index + 1) % width == 0) ? undefined : index + 1; // check if the pixel has a neighbour on the right
      let ind_left = (index % width == 0) ? undefined : index - 1; // check if the pixel has a neighbour on the left
      let indexList = [ind_up,ind_down,ind_right,ind_left];
      indexList.forEach(function(ind_neighbour)
      {
          (pixelArray[ind_neighbour] == 255 && labelData[ind_neighbour] == 0) ?
          (
        pixelList.push(parseInt(ind_neighbour)), // parseInt transform a string to int
        labelData[parseInt(ind_neighbour)] = label
      ) : null;
      });
    }
  }

    let raster = img.getRaster();
    let pixelArray = raster.pixelData;
    let pixelList = new Array(); // An empty array for keeping pixels
    let label = 1;
    let labelData = new Array(img.height*img.width).fill(0); // An empty array which stores labels for each pixel
    let width = img.width; //
    let length = pixelArray.length;
    pixelArray.forEach(function(elem,i)
    {
	     (elem == 255 && labelData[i] == 0) ? (
  	    pixelList.push(i),
  	    labelData[i] = label,
        labelComponent(),
  	    label = label + 1
      ) : null;
});




    return labelData;
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
    //console.log(measure ${params});
    //return new TMeasurements();
  }
}

let img = new T.Image('uint8', 8, 8);

let pixelData = [
  0, 0, 255, 255, 255, 255, 0, 255,
  0, 255, 0, 0, 0, 255, 0, 0,
  0, 255, 255, 0, 0, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 255, 255,
  0, 255, 255, 255, 255, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  255, 0, 255, 0, 0, 0, 0, 0];
 img.setPixels(pixelData);
result = labelling(img);
console.log(result);
