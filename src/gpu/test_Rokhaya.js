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

let img = new T.Image('uint8',200,100);
img.setPixels(new Uint8ClampedArray(particles_pixels));

raster = img.getRaster();
let view = cpu.view(raster);
// Create the window content from the view
let win = new T.Window(`Particles`);
win.addView(view);
// Add the window to the DOM and display it
win.addToDOM('workspace');

let gpuEnv = gpu.getGraphicsContext();

let src_vs = `#version 300 es
    in vec2 a_vertex;
    in vec2 a_texCoord;
    uniform vec2 u_resolution;
    out vec2 v_texCoord;
    void main() {
        v_texCoord = a_texCoord;
        vec2 clipSpace = a_vertex * u_resolution * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
}` ; // On utilise pas trop le vertex shader donc on laisse avec les paramètres de taveau

let src_fs = `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;

    uniform float u_kernel[9];
    uniform sampler2D u_raster;
    uniform vec2 u_textureSize;

    // Declare an output for the fragment shader
    out vec4 outColor;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
        // vec2 st = vec2(v_texCoord.x, v_texCoord.y);
        // vec4(rand(st), rand(1.0-st), rand(st+1.0), 1.0);

        // compute 1 pixel in texture coordinates.
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

        if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord + vec2(onePixel.x, 0.0)).r < 1.0){
            outColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
        if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord - vec2(onePixel.x, 0.0)).r < 1.0){
            outColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
        // outColor = vec4(rand(st) - texture(u_raster, v_texCoord).rgb, 1.0);
        // if(v_texCoord.x>0.5){
        //     outColor = texture(u_raster, v_texCoord);
        // }
}` ; // On mets nos algos dans le main ; le if definit cherche les pixels noirs et celles à droites noires. r> 1 pixel noir sinon pixel blanc

let program = gpu.createProgram(gpuEnv,src_vs,src_fs);

w = raster.width;
h = raster.height;

let gproc = gpu.createGPU(gpuEnv,w,h);

gproc.geometry(gpu.rectangle(raster.width,raster.height));

// gproc.geometry({
//     type : 'TRIANGLE_STRIP',
//     num : 4,
//     vertices : new Float32Array([
//         0.0,0.0,0.0,0.0,
//         0.0,h  ,0.0,1.0,
//         w  ,0.0,1.0,0.0,
//         w  ,h  ,1.0,1.0])
// })


gproc.attribute('a_vertex',2,'float', 16,0)   // X, Y
    .attribute('a_texCoord',2, 'float', 16, 8)  // S, T
    .packWith(program)                         // VAO
gproc.texture(raster,0) ;


gproc.clearCanvas([0.0,1.0,0.0,1.0]);

gproc.preprocess()
    .uniform('u_resolution',
            new Float32Array([1.0/w,1.0/h])
        )
        .uniform('u_raster',0)
        .uniform('u_textureSize', new Float32Array([w, h]));

gproc.run();

// gpu.invert(img.getRaster(),gpuEnv);
