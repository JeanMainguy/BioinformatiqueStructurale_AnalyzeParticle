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
* Finds the objects in an image and return an labeled image.
* 4-connected components
* The algorithm is multipass, with the following steps :
*   - Every pixel gets an ID, which is the (x, y) position, stored in the green and blue canals of the image.
*   - Every pixel checks the highest ID in the row and column of the particle they are in. If one other than it's ID is found it takes it. This step runs h² times.
*   - The image is rendered in the browser, where each particle is of a unique ID.
*
*
*
* @param {TImage} img - Input image
* @param {boolean} copy - Copy mode
* @return {TRaster} A TRaster with labels as pixel values
* @author Martin Binet
*/

const labelling = function(img, gpuEnv){

    let src_vs = `#version 300 es
        in vec2 a_vertex;
        in vec2 a_texCoord;
        uniform vec2 u_resolution;
        out vec2 v_texCoord;
        void main() {
            v_texCoord = a_texCoord;
            vec2 clipSpace = a_vertex * u_resolution * 2.0 - 1.0;
            gl_Position = vec4(clipSpace * vec2(1.0, 1.0), 0.0, 1.0);
    }` ;

    let src_vs_inverted = `#version 300 es
        in vec2 a_vertex;
        in vec2 a_texCoord;
        uniform vec2 u_resolution;
        out vec2 v_texCoord;
        void main() {
            v_texCoord = a_texCoord;
            vec2 clipSpace = a_vertex * u_resolution * 2.0 - 1.0;
            gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    }` ;

    let getIDs_fs = `#version 300 es
        precision mediump float;
        in vec2 v_texCoord;

        uniform float u_kernel[9];
        uniform sampler2D u_raster;
        uniform vec2 u_textureSize;
        uniform int step;

        // Declare an output for the fragment shader
        out vec4 outColor;

        void main() {
          vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

          if(texture(u_raster, v_texCoord).r == 0.0){
            outColor = vec4(0.0, v_texCoord.x, v_texCoord.y, 1.0);
        }
          else{
            outColor = texture(u_raster, v_texCoord);
          }
    }` ;

    let updatePixel_fs = `#version 300 es
        precision mediump float;
        in vec2 v_texCoord;

        uniform sampler2D u_raster;
        uniform vec2 u_textureSize;
        uniform float height;

        // Declare an output for the fragment shader
        out vec4 outColor;

        void main() {
          vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
          float currentRed = texture(u_raster, v_texCoord).r;
          float currentGreen = texture(u_raster, v_texCoord).g;
          float currentBlue = texture(u_raster, v_texCoord).b;

          if(currentRed == 0.0){
              float goingUp = 1.0;
              float goingDown = 1.0;
              float goingRight = 1.0;
              float goingLeft = 1.0;
              float y = 0.0;
              float x = 0.0;
              vec2 maxID = vec2(currentGreen, currentBlue);
              while(goingUp == 1.0){
                  float nextRedUp = texture(u_raster, v_texCoord + vec2(0.0, onePixel.y*y)).r;
                  float nextGreenUp = texture(u_raster, v_texCoord + vec2(0.0, onePixel.y*y)).g;
                  float nextBlueUp = texture(u_raster, v_texCoord + vec2(0.0, onePixel.y*y)).b;
                if(nextRedUp == 0.0){
                    if (nextGreenUp + nextBlueUp * height > maxID.x + maxID.y * height){
                        maxID = vec2(nextGreenUp, nextBlueUp);
                    }
                  y++;
                }
                else{
                  goingUp = 0.0;
                }
              }
              y = 0.0;
              while(goingDown == 1.0){
                  float nextRedDown = texture(u_raster, v_texCoord - vec2(0.0, onePixel.y*y)).r;
                  float nextGreenDown = texture(u_raster, v_texCoord - vec2(0.0, onePixel.y*y)).g;
                  float nextBlueDown = texture(u_raster, v_texCoord - vec2(0.0, onePixel.y*y)).b;
                if(nextRedDown == 0.0){
                    if (nextGreenDown + nextBlueDown * height > maxID.x + maxID.y * height){
                        maxID = vec2(nextGreenDown, nextBlueDown);
                    }
                  y++;
                }
                else{
                  goingDown = 0.0;
                }
              }
              while(goingRight == 1.0){
                  float nextRedRight = texture(u_raster, v_texCoord + vec2(onePixel.x*x, 0.0)).r;
                  float nextGreenRight = texture(u_raster, v_texCoord + vec2(onePixel.x*x, 0.0)).g;
                  float nextBlueRight = texture(u_raster, v_texCoord + vec2(onePixel.x*x, 0.0)).b;
                if(nextRedRight == 0.0){
                    if (nextGreenRight + nextBlueRight * height > maxID.x + maxID.y * height){
                        maxID = vec2(nextGreenRight, nextBlueRight);
                    }
                  x++;
                }
                else{
                  goingRight = 0.0;
                }
              }
              x = 0.0;
              while(goingLeft == 1.0){
                  float nextRedLeft = texture(u_raster, v_texCoord - vec2(onePixel.x*x, 0.0)).r;
                  float nextGreenLeft = texture(u_raster, v_texCoord - vec2(onePixel.x*x, 0.0)).g;
                  float nextBlueLeft = texture(u_raster, v_texCoord - vec2(onePixel.x*x, 0.0)).b;
                if(nextRedLeft == 0.0){
                    if (nextGreenLeft + nextBlueLeft * height > maxID.x + maxID.y * height){
                        maxID = vec2(nextGreenLeft, nextBlueLeft);
                    }
                  x++;
                }
                else{
                  goingLeft = 0.0;
                }
              }
              outColor = vec4(0.0, maxID, 1.0);
          }
          else{
            outColor = texture(u_raster, v_texCoord);
          }
    }` ;

    let display_fs = `#version 300 es
        precision mediump float;
        in vec2 v_texCoord;

        uniform sampler2D u_raster;

        out vec4 outColor;

        void main() {
            outColor = texture(u_raster, v_texCoord);
    }` ;

    let getIDs = gpu.createProgram(gpuEnv,src_vs,getIDs_fs);
    let updatePixel = gpu.createProgram(gpuEnv, src_vs, updatePixel_fs);
    let display = gpu.createProgram(gpuEnv,src_vs_inverted,display_fs);

    w = img.width;
    h = img.height;

    let gprocStep0 = gpu.createGPU(gpuEnv,w,h)
      .geometry(gpu.rectangle(w,h))
      .attribute('a_vertex',2,'float', 16,0)   // X, Y
      .attribute('a_texCoord',2, 'float', 16, 8)  // S, T
      .packWith(getIDs)                         // VAO
      .texture(img, textUnit = 1)
      .redirectTo('fbo1','float32',0)
      // .clearCanvas([0.0,1.0,0.0,1.0])
      .preprocess()
      .uniform('u_resolution',
                new Float32Array([1.0/w,1.0/h])
            )
      .uniform('u_raster',textUnit)
      .uniform('u_textureSize', new Float32Array([w, h]))
      .run();

    let gprocStep1 = gpu.createGPU(gpuEnv,w,h)
        .geometry(gpu.rectangle(w,h))
        .attribute('a_vertex',2,'float', 16,0)   // X, Y
        .attribute('a_texCoord',2, 'float', 16, 8)  // S, T
        .packWith(updatePixel)                       // VAO
        .texture(gprocStep0.framebuffers['fbo1'], textUnit = 1)
        .redirectTo('fbo2','float32',0)
        .preprocess()
        .uniform('u_resolution',
                  new Float32Array([1.0/w,1.0/h])
              )
        .uniform('u_raster',textUnit)
        .uniform("height", h)
        .uniform('u_textureSize', new Float32Array([w, h]))
        .run();

    for(let i = 0;i<h;i++){
        gprocStep1.texture(gprocStep1.framebuffers['fbo2'], textUnit = 1)
            .redirectTo('fbo3','float32',0)
            .preprocess()
            .uniform('u_resolution',
                      new Float32Array([1.0/w,1.0/h])
                  )
            .uniform('u_raster',textUnit)
            .uniform("height", h)
            .uniform('u_textureSize', new Float32Array([w, h]))
            .run();

        gprocStep1.texture(gprocStep1.framebuffers['fbo3'], textUnit = 1)
            .redirectTo('fbo2','float32',0)
            .preprocess()
            .uniform('u_resolution',
                      new Float32Array([1.0/w,1.0/h])
                  )
            .uniform('u_raster',textUnit)
            .uniform("height", h)
            .uniform('u_textureSize', new Float32Array([w, h]))
            .run();
    }


    let gprocDisplay = gpu.createGPU(gpuEnv,w,h)
        .geometry(gpu.rectangle(w,h))
        .attribute('a_vertex',2,'float', 16,0)   // X, Y
        .attribute('a_texCoord',2, 'float', 16, 8)  // S, T
        .packWith(display)                       // VAO
        .texture(gprocStep1.framebuffers['fbo2'], textUnit = 1)
        .preprocess()
        .uniform('u_resolution',
                  new Float32Array([1.0/w,1.0/h])
              )
        .uniform('u_raster',textUnit)
        .run();

        return img;
}
