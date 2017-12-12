console.log("labelling 2 pass");


let img = new T.Image('uint8',256,254);
img.setPixels(blobs_bin256x254);
let win0 = new T.Window('Binary');
let view0 = T.view(img.getRaster());
// Create the window content from the view
win0.addView(view0);
// Add the window to the DOM and display it
win0.addToDOM('workspace');

result = labelling(img);

for(let i=0;i<result.length;i++){
    if (result[i] == undefined){
        result[i] = 0;
    }
}
console.log(result);
// show(result, img.height, img.width)
// result = result.map(function(i){i*50})
// show(result, img.height, img.width)
let img_result = new T.Image('uint8',img.width,img.height);
img_result.setPixels(result);
let win1 = new T.Window('Binary result');
let view1 = T.view(img_result.getRaster());
console.log(img_result.getRaster().pixeData);
// Create the window content from the view
win1.addView(view1);
// Add the window to the DOM and display it
win1.addToDOM('workspace');
// show(result, img.height, img.width)


// let win1 = new T.Window('Labbeling');
// let view1 = T.view(img.getRaster());
// Create the window content from the view
// win0.addView(view0);
// // Add the window to the DOM and display it
// win0.addToDOM('workspace');


// data = [
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 255, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 0, 0, 255, 255, 0, 0, 0, 0, 0,
//   0, 0, 255, 255, 0, 0, 0, 0, 0, 0];
//
// let img;
// img = new T.Image('uint8',10,10);


// img.setPixels(data);
