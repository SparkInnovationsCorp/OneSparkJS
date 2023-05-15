((global) => {

     const OneSparkJs = {};

     //Audio module
     OneSparkJs.Assets = (() => {

          class Extension extends $1S.Application.ExtensionType {

               assetSheet = {
                    audio: [],
                    images: [],
                    loops: [],
                    layouts: []
               }

               constructor() {
                    super(100);
               }

               onLoad = (appPath, properties, oncomplete) => {
                    try {
                         const path = appPath + "assets.json";
                         var xhr = new XMLHttpRequest();
                         xhr.open('GET', path, true);
                         xhr.onload = () => {
                              if (xhr.status === 200) {
                                   const json = JSON.parse(xhr.responseText);
                                   if (Array.isArray(json.audio)) {
                                        this.assetSheet.audio = json.audio;
                                        if ($1S.Audio) {
                                             this.assetSheet.audio.forEach(function (node) {
                                                  $1S.Audio.preload(node.path);
                                             });
                                        }
                                   }
                                   if (Array.isArray(json.images)) {
                                        const images = json.images;
                                        images.forEach((node) => {
                                             this.preloadImage(node);
                                        });
                                   }
                                   if (Array.isArray(json.layouts)) {
                                        this.assetSheet.layouts = json.layouts;
                                   }
                              }
                              if (oncomplete) oncomplete();
                         };
                         xhr.onerror = () => {
                              console.error(`Error loading asset sheet`, xhr.statusText);
                              if (oncomplete) oncomplete();
                         }
                         xhr.send();
                    } catch (e) {
                         console.log("Error loading asset sheet", e);
                         if (oncomplete) oncomplete()                    }
               }

               getAudio = (name) => {
                    for (let i = 0; i < this.assetSheet.audio.length; i++) {
                         if (this.assetSheet.audio[i].name === name) {
                              return this.assetSheet.audio[i];
                         }
                    }
                    return null;
               }

               getImage = (name) => {
                    for (let i = 0; i < this.assetSheet.images.length; i++) {
                         if (this.assetSheet.images[i].name === name) {
                              return this.assetSheet.images[i];
                         }
                    }
                    return null;
               }

               getSpriteLoop = (name) => {
                    for (let i = 0; i < this.assetSheet.loops.length; i++) {
                         if (this.assetSheet.loops[i].group === name) {
                              return this.assetSheet.loops[i];
                         }
                    }
                    return null;
               }

               getTileset = (name) => {

                    for (let i = 0; i < this.assetSheet.layouts.length; i++) {
                         if (this.assetSheet.layouts[i].name === name) {
                              return this.assetSheet.layouts[i];
                         }
                    }
                    return null;
               }

               preloadImage = (imageNode) => {

                    if (!imageNode.path) return;

                    // Create a new image object
                    var img = new Image();
                    img.src = imageNode.path;

                    // When the image is loaded, draw it onto the canvas
                    img.onload = () => {

                         // Create a new canvas object
                         var sourceCanvas = document.createElement('canvas');
                         var sourceContext = sourceCanvas.getContext('2d');

                         sourceCanvas.width = img.width;
                         sourceCanvas.height = img.height;

                         // If no clipPath is defined, draw the entire image onto the canvas
                         sourceContext.drawImage(img, 0, 0, img.width, img.height);

                         if (imageNode.clipPaths && imageNode.clipPaths.length > 0) {

                              imageNode.clipPaths.forEach((cpNode) => {

                                   // Calculate the bounding box of the clip path
                                   var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
                                   for (var i = 0; i < cpNode.clipPath.length; i++) {
                                        xMin = Math.min(xMin, cpNode.clipPath[i].x);
                                        xMax = Math.max(xMax, cpNode.clipPath[i].x);
                                        yMin = Math.min(yMin, cpNode.clipPath[i].y);
                                        yMax = Math.max(yMax, cpNode.clipPath[i].y);
                                   }

                                   // Create a new canvas object
                                   var canvas = document.createElement('canvas');

                                   // Set the dimensions of the canvas based on the bounding box of the clip path
                                   canvas.width = xMax - xMin;
                                   canvas.height = yMax - yMin;

                                   var ctx = canvas.getContext('2d');

                                   sourceContext.strokeStyle = "red";
                                   sourceContext.lineWidth = 5;

                                   // Begin a new path and move to the first point in the clip path
                                   sourceContext.beginPath();
                                   sourceContext.moveTo(cpNode.clipPath[0].x, cpNode.clipPath[0].y);

                                   // Draw lines to the remaining points in the clip path
                                   for (var i = 1; i < cpNode.clipPath.length; i++) {
                                        sourceContext.lineTo(cpNode.clipPath[i].x, cpNode.clipPath[i].y);
                                   }

                                   // Close the path
                                   sourceContext.closePath();

                                   // Clip the canvas to the path
                                   sourceContext.clip();

                                   // Draw the image onto the canvas, offset by the top-left corner of the clip path
                                   ctx.drawImage(sourceCanvas, -xMin, -yMin);

                                   cpNode.Image = img;
                                   cpNode.Canvas = canvas;
                                   cpNode.CanvasContext = ctx;

                                   //if this is named, it means we may want to directly reference it
                                   if (cpNode.name) {
                                        this.assetSheet.images.push(cpNode);
                                   }

                              });

                              this.assetSheet.loops.push(imageNode);

                         } else {

                              imageNode.Image = img;

                              imageNode.Canvas = sourceCanvas;

                              imageNode.CanvasContext = sourceContext;

                              this.assetSheet.images.push(imageNode);

                         }

                    };

               }

          }

          const Ext = new Extension();

          return { Ext }
     })();

     // Public API
     global.$1S.Assets = {
          getAudio: OneSparkJs.Assets.Ext.getAudio,
          getImage: OneSparkJs.Assets.Ext.getImage,
          getSpriteLoop: OneSparkJs.Assets.Ext.getSpriteLoop,
          getTileset: OneSparkJs.Assets.Ext.getTileset
     };

})(typeof window !== 'undefined' ? window : global);
