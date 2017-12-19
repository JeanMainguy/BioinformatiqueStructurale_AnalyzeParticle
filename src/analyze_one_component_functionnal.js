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
 *
 * @param {TRaster} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {type} A set of Regions Of Interest (ROI)
 * @author TODO
 */
const labelling = function (img,copy=true) {

  const labelComponent = function(){
    while (listePixel.length != 0)
    {
      let indice = listePixel[0]; // stocke la valeur du premier pixel dans une variable avant de la supprimer
      listePixel.shift();
      let ind_up = indice - width;
      let ind_down = indice + width;
      let ind_right = ((indice + 1) % width == 0) ? undefined : indice + 1;
      let ind_left = (indice % width == 0) ? undefined : indice - 1;
      let listeIndice = [ind_up,ind_down,ind_right,ind_left]; // liste qui recupère tous les voisins
      listeIndice.forEach(function(ind_voisin)
      {
          (pixelArray[ind_voisin] == 255 && labelData[ind_voisin] == 0) ?
          (
        listePixel.push(parseInt(ind_voisin)),
        labelData[parseInt(ind_voisin)] = label
      ) : null;
      });
    }
  }

    let raster = img.getRaster();
    let pixelArray = raster.pixelData;
    let listePixel = new Array(); // Liste vide pour parcourir l'image
    let label = 1;
    let labelData = new Array(img.height*img.width).fill(0); // liste vide pour stocker les labels affectés à chaque pixel
    let width = img.width; // Largeur et taille de l'array
    let length = pixelArray.length;
    pixelArray.forEach(function(elem,i)
    {
	     (elem == 255 && labelData[i] == 0) ? (
  	    listePixel.push(i),
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
