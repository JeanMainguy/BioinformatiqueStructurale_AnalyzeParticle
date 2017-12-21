imp =imp = IJ.openImage("http://wsr.imagej.net/images/blobs.gif");
Prefs.blackBackground = false;
IJ.run(imp, "Make Binary", "");
// imp.show();
//IJ.run(imp, "8-bit", "");

for(var x=1; x<5;x++) {
  var v = x+2;
  var z = Array(v);
  for(var y=0; y<v-1;y++){
    z[y] = imp.duplicate();
    z[y].show();
  }
  IJ.run(imp, "Images to Stack", "name=Stack"+x+" title=[DUP] use");
  var imp2 = WindowManager.getCurrentImage();
  IJ.run(imp2, "Make Montage...", "columns="+x+" rows=1 scale=1");
  var imp3 = WindowManager.getCurrentImage();
  var pix = pixel(imp3,x);
  // exec("ls");
  // exec("mv", "/net/cremi/jmainguy/M2/structural_biology/Analyse_Particle_programmation/benchmark/binary_blob.txt", "/net/cremi/jmainguy/M2/structural_biology/Analyse_Particle_programmation/benchmark/binary_blob.js");
  // IJ.openImage("/net/cremi/jmainguy/M2/structural_biology/Analyse_Particle_programmation/examples/analyse_two_pass.html");
  // LANCER MESURE:
  // imp3.show();

  imp2.close();
  imp3.close();
}
imp.changes = false;
imp.close();


function pixel(imp,x) {
  var arr = new Array(imp.width*imp.height);
  for(var i = 0; i<imp.height; i++){
     for(var j = 0; j<imp.width; j++){
        arr[i*imp.width+j] = imp.getPixel(j,i)[0];
     }
  }
  // IJ.log("lena"+x+"_pixels = ["+arr+"];");
  IJ.log("{nb_blob:"+x+" ,width:"+imp.width+", height:"+imp.height+", pixels:["+arr+"]}, ");
  IJ.selectWindow("Log");
  IJ.saveAs("Text", "/net/cremi/jmainguy/M2/structural_biology/Analyse_Particle_programmation/benchmark/binary_blob"+x+".js");
  print("\\Clear");
  IJ.run("Close")

}
