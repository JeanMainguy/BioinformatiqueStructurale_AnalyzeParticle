
// Create an Image containing boats (from ImageJ))
let img = new T.Image('uint8',200,100);
img.setPixels(new Uint8Array(particles_pixels));

raster = img.getRaster();

let view = cpu.view(raster);

// Create the window content from the view
let win = new T.Window(`Particles`);
win.addView(view);
// Add the window to the DOM and display it
win.addToDOM('workspace');

// Get a graphics context from canvas
let gpuEnv = gpu.getGraphicsContext();

labeled = labelling(raster, gpuEnv);

console.log(labeled);
