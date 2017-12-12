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
    let raster = img.getRaster();
    let pixelArray = raster.pixelData;
    console.log(pixelArray)
    let listePixel = new Array(); // Liste pour parcourir l'image
    let label = 1;
    let labelData = new Array(img.height*img.width); // liste vide pour stocker les labels affectés à chaque pixel
    let width = img.width; // Largeur et taille de l'array
    let length = pixelArray.length;
    for (let i = 0; i < pixelArray.length; i++) 
    {
	if (pixelArray[i] == 255 && labelData[i] == undefined)
	{
	    listePixel.push(i);
	    labelData[i] = label;
	    while (listePixel != 0)
	    {
		let indice = listePixel[0]; // stocke la valeur du premier pixel dans une variable avant de la supprimer
		delete listePixel.splice[0];
		let ind_up = indice - width;
		let ind_down = indice + width;
		let ind_right = ((indice + 1) % width == 0) ? undefined : indice + 1;
		let ind_left = (indice % width == 0) ? undefined : indice - 1;
		let listeIndice = [ind_up,ind_down,ind_right,ind_left];
		for(ind_voisin in listeIndice)
		{
		    	if (pixelArray[ind_voisin] == 255 && labelData[ind_voisin == undefined)
		{
		    listePixel.push(ind_voisin);
		    labelData[ind_voisin] = label;
		}
		}
	
		
		
		

	    }

	}
	//console.log(pixelArray[i]);
	console.log(listePixel);
	//console.log(labelData);
    }
    
    
    
    
  
  //return TRaster.from(img,copy);
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
  0, 255, 255, 255, 255, 255, 0, 255,
  0, 255, 0, 0, 0, 255, 0, 0,
  0, 255, 255, 0, 0, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 255, 255,
  0, 255, 255, 255, 255, 255, 255, 0,
  0, 255, 255, 255, 255, 255, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  255, 0, 255, 0, 0, 0, 0, 0];
 img.setPixels(pixelData);
result = labelling(img);
