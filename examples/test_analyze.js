

let img = new T.Image('uint8',256,254);
img.setPixels(blobs_bin256x254);

let win0 = new T.Window('Binary');
let view0 = T.view(img.getRaster());
// Create the window content from the view
win0.addView(view0);
// Add the window to the DOM and display it
win0.addToDOM('workspace');


console.log("Labeling:");

console.log("labbeling One Pass of blob Image");
let labeled_raster_one = labellingOnePass(img);
let particules_one = getListParticle(labeled_raster_one);
console.log(particules_one.length, "particles have been found");



console.log("labbeling Two Pass of blob Image");
let labeled_raster_two = labellingTwoPass(img);
let particules_two = getListParticle(labeled_raster_two);
console.log(particules_two.length, "particles have been found");

console.log("labbeling one component of blob Image");
let labeled_raster_comp = labellingOneComponent(img);
let particules_compo = getListParticle(labeled_raster_comp);
console.log(particules_compo.length, "particles have been found");


console.log("Measure:");
measure(labeled_raster_two, particules_two, [area_obj, centroid_obj, boundingRectangle_obj, perimeter_obj])
