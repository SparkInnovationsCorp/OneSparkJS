((global) => {

     const OneSparkJs = {};

     // Application module
     OneSparkJs.Application = (() => {
          const version = "1.0.0";

          let rootPath = null;
          let lastTime = 0;
          let clockRunning = false;
          let applicationType = null;
          let application = null;
          let extensions = [];

          class ExtensionType {
               constructor(priority = 0) {
                    extensions.push({
                         Instance: this,
                         Priority: priority
                    });

                    extensions.sort((a, b) => a.Priority - b.Priority);
               }
          }

          const load = (appPath, properties = {}, callback = null) => {

               extensions.forEach(ext => {
                    if (ext.Instance.onLoad) {
                         ext.Instance.onLoad(appPath, properties);
                    };
               });

               if (!appPath.endsWith('/')) {
                    appPath += '/';
               }

               rootPath = appPath;

               OneSparkJs.Assets.load(rootPath + "assets.json");

               $1S.include(`${appPath}main.js`, null, (success, errorMessage) => {
                    if (success) {
                         if (properties.autoStart)
                              start();

                         if (callback)
                              callback();
                    } else {
                         console.error(errorMessage);
                    }
               });
          }

          const start = async () => {

               const appType = await $1S.getTypeAsync("MainApp");

               if (!appType) {
                    console.error('Application not defined.');
                    return
               }

               application = new appType();

               if (application.onStart)
                    application.onStart();

               startClock();

          }

          const stop = async () => {

               if (application.onStop)
                    application.onStop();

               stopClock();

               $1S.Renderer.Graphics.clear();

               OneStartJS.Stage.reset();

          }

          const startClock = () => {
               lastTime = 0;
               clockRunning = true;
               window.requestAnimationFrame(tick);;
          }

          const tick = (timeStamp) => {

               let deltaTime = timeStamp - lastTime;

               if (application) {

                    //tick
                    if (application.onTick) {
                         application.onTick(timeStamp, deltaTime);
                    }

                    extensions.forEach(ext => {
                         if (ext.Instance.handleTickEvent) {
                              ext.Instance.handleTickEvent(timeStamp, deltaTime);
                         };
                    });

                    //post tick
                    extensions.forEach(ext => {
                         if (ext.Instance.handlePostTickEvent) {
                              ext.Instance.handlePostTickEvent(timeStamp, deltaTime);
                         };
                    });

                    if (application.onPostTick) {
                         application.onPostTick(timeStamp, deltaTime);
                    }

               }

               lastTime = timeStamp;

               if (clockRunning) {
                    window.requestAnimationFrame(tick);;
               }
          }

          const stopClock = () => {
               clockRunning = false;
          }

          const get = () => {
               return application;
          }

          const registerExtension = (obj, priority = 0) => {
               if (obj instanceof ExtensionType) {
                    extensions.push({
                         Instance: obj,
                         Priority: priority
                    });

                    extensions.sort((a, b) => a.Priority - b.Priority);
               } else {
                    console.error('Error: obj is not an instance of ApplicationExtensionType');
               }
          }

          return {
               ExtensionType,
               version,
               load,
               start,
               stop,
               get,
               tick,
               startClock,
               stopClock,
               registerExtension
          }
     })();

     //Asset manager
     OneSparkJs.Assets = (() => {

          let assetSheet = {
               audio: [],
               images: [],
               groups: [],
               layouts: []
          }

          load = (path) => {
               try {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', path, true);
                    xhr.onload = function () {
                         if (xhr.status === 200) {
                              const json = JSON.parse(xhr.responseText);
                              if (Array.isArray(json.audio)) {
                                   assetSheet.audio = json.audio;
                                   assetSheet.audio.forEach(function (node) {
                                        OneSparkJs.Audio.preloadAudio(node.path);
                                   });
                              }
                              if (Array.isArray(json.images)) {
                                   const images = json.images;

                                   images.forEach(function (node) {
                                        preloadImage(node);
                                   });
                              }
                              if (Array.isArray(json.layouts)) {
                                   assetSheet.layouts = json.layouts;
                              }
                         }
                    };
                    xhr.onerror = function () {
                         console.error(`Error loading assets:`, xhr.statusText);
                    }
                    xhr.send();
               } catch { }
          }

          getAudio = (name) => {
               for (let i = 0; i < assetSheet.audio.length; i++) {
                    if (assetSheet.audio[i].name === name) {
                         return assetSheet.audio[i];
                    }
               }
               return null;
          }

          getImage = (name) => {
               for (let i = 0; i < assetSheet.images.length; i++) {
                    if (assetSheet.images[i].name === name) {
                         return assetSheet.images[i];
                    }
               }
               return null;
          }

          getImageGroup = (name) => {
               for (let i = 0; i < assetSheet.groups.length; i++) {
                    if (assetSheet.groups[i].group === name) {
                         return assetSheet.groups[i];
                    }
               }
               return null;
          }

          getLayout = (name) => {

               for (let i = 0; i < assetSheet.layouts.length; i++) {
                    if (assetSheet.layouts[i].name === name) {
                         return assetSheet.layouts[i];
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
               img.onload = function () {

                    // Create a new canvas object
                    var sourceCanvas = document.createElement('canvas');
                    var sourceContext = sourceCanvas.getContext('2d');

                    sourceCanvas.width = img.width;
                    sourceCanvas.height = img.height;

                    // If no clipPath is defined, draw the entire image onto the canvas
                    sourceContext.drawImage(img, 0, 0, img.width, img.height);

                    if (imageNode.clipPaths && imageNode.clipPaths.length > 0) {

                        imageNode.clipPaths.forEach(function (cpNode) {

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

                              cpNode.Canvas = canvas;
                              cpNode.CanvasContext = ctx;

                              //if this is named, it means we may want to directly reference it
                              if (cpNode.name) {
                                   assetSheet.images.push(cpNode);
                              }

                         });

                         assetSheet.groups.push(imageNode);

                    } else {

                         imageNode.Canvas = sourceCanvas;

                         imageNode.CanvasContext = sourceContext;

                         assetSheet.images.push(imageNode);

                    }

               };

          }

          return {
               load,
               getAudio,
               getImage,
               getImageGroup,
               getLayout
          }

     })();

     //supports MP3, WAV, Ogg
     OneSparkJs.Audio = (() => {

          let audioCache = new Map();
          let activeAudios = new Set();

          const playAudio = (name, loop = false, volume = 1) => {

               const node = OneSparkJs.Assets.getAudio(name);
               if (node == null) return;
               const src = node.path;

               const audioElement = getAudioElement(src);

               if (activeAudios.has(audioElement)) {
                    // If the audio element is already active, restart it from the beginning
                    audioElement.currentTime = 0;
               } else {
                    // Otherwise, add the audio element to the set of active audios
                    activeAudios.add(audioElement);
               }

               // Set the loop property if necessary
               if (loop) {
                    audioElement.loop = true;
               }

               // Set the volume if necessary
               if (volume !== 1) {
                    audioElement.volume = volume;
               }

               // Play the audio file
               audioElement.play();
          };

          const stopAudio = (name) => {

               const node = OneSparkJs.Assets.getAudio(name);
               if (node == null) return;
               const src = node.path;

               const audioElement = audioCache.get(src);
               if (audioElement && activeAudios.has(audioElement)) {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    activeAudios.delete(audioElement);
               }
          }

          const stopAllAudios = () => {
               activeAudios.forEach((audioElement) => {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    activeAudios.delete(audioElement);
               });
          }

          const preloadAudio = (src) => {
               getAudioElement(src);
          }

          const getAudioElement = (src) => {
               if (audioCache.has(src)) {
                    return audioCache.get(src);
               } else {
                    const audioElement = new Audio(src);
                    audioCache.set(src, audioElement);
                    return audioElement;
               }
          }

          return {
               playAudio,
               stopAudio,
               stopAllAudios,
               preloadAudio
          }

     })();

     // Graphics module
     OneSparkJs.Graphics = (() => {
          let canvas = null;
          let context = null;
          let workCanvas = null;
          let workContext = null;

          const initialize = (canvasId) => {
               canvas = document.getElementById(canvasId);
               context = canvas.getContext("2d");
               workCanvas = document.createElement('canvas');
               workCanvas.width = canvas.width;
               workCanvas.height = canvas.height;
               workContext = workCanvas.getContext('2d');

               // Add an event listener to detect canvas resizing
               window.addEventListener('resize', () => {

                    // Update the canvas dimensions
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    // Update the workCanvas dimensions
                    workCanvas.width = canvas.width;
                    workCanvas.height = canvas.height;

                    OneSparkJs.Renderer.Ext.raiseResizeEvent(window.innerWidth, window.innerHeight);
               });
          }

          const getStyle = () => {
               return canvas.style;
          }

          const getSize = () => {
               return {
                    width: canvas.width,
                    height: canvas.height
               }
          }

          const getContext = () => {
               return workContext;
          }

          const publish = () => {
               context.clearRect(0, 0, canvas.width, canvas.height);
               context.drawImage(workCanvas, 0, 0);
          }

          const setState = (savedState) => {
               // Clear the canvas
               context.clearRect(0, 0, canvas.width, canvas.height);

               // Restore the saved state of the canvas
               const img = new Image();
               img.onload = function () {
                    context.drawImage(img, 0, 0);
               };
               img.src = savedState;
          }

          const getState = () => {
               // Save the current state of the canvas
               const savedState = canvas.toDataURL();

               return savedState;
          }

          ///this will eventually be replaced with a Input Module
          const attachEvent = (eventType, eventHandler) => {
               canvas.addEventListener(eventType, (event) => {
                    eventHandler(event);
               });
          }

          return {
               initialize,
               attachEvent,
               getContext,
               publish,
               getState,
               setState,
               getStyle,
               getSize
          }

     })();

     // Helper functions
     OneSparkJs.Helper = (() => {
          newId = () => {
               let guid = '';
               for (let i = 0; i < 32; i++) {
                    guid += Math.floor(Math.random() * 16).toString(16);
                    if (i === 7 || i === 11 || i === 15 || i === 19) {
                         guid += '-';
                    }
               }
               return guid;
          }

          return {
               newId
          }
     })();

     // IO module
     OneSparkJs.IO = (() => {
          const loadJSON = (path, callback) => {
               const xhr = new XMLHttpRequest();
               xhr.overrideMimeType('application/json');
               xhr.open('GET', path, true);
               xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                         callback(JSON.parse(xhr.responseText));
                    }
               };
               xhr.send(null);
          }

          return {
               loadJSON
          }
     })();

     // Module module
     OneSparkJs.Module = (() => {
          let gamePath = null;
          let filesLoaded = [];
          let filesErrored = [];
          let dependencies = [];
          let types = [];

          const include = (files, parent = null, callback = null) => {
               if (typeof files === 'string') {
                    files = [files];
               } else if (!Array.isArray(files)) {
                    if (typeof callback === 'function') {
                         callback(false, "Error: 'files' parameter must be an array or a string");
                    }
                    return;
               }

               const parentFilePath = parent == null ? getParentFilePath() : parent;

               const parentPath = parentFilePath.replace(/\/[^\/]+$/, '') + "/";

               const loadScript = (file) => {

                    const url = resolveUrl(file, parentPath);

                    // add new dependency only if it does not already exist
                    const dependencyExists = dependencies
                         .some(dependency => dependency.Parent === parentFilePath && dependency.Child === file);

                    if (!dependencyExists) {
                         dependencies.push({
                              Parent: parentFilePath,
                              Child: file
                         });
                    }

                    if (filesLoaded.includes(file)) {
                         return;
                    }

                    if (filesErrored.includes(file)) {
                         const index = filesErrored.indexOf(file);
                         if (index > -1) {
                              filesErrored.splice(index, 1);
                         }
                    }

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onload = function () {
                         if (xhr.status === 200) {
                              var script = xhr.responseText;

                              script = modifyIncludeCalls(script, url);

                              script = "async function factory() {\n" + script + "\n}\nfactory();";

                              try {
                                   eval(script); // Evaluate the script

                                   loadedCount++;
                                   if (!filesLoaded.includes(file)) {
                                        filesLoaded.push(file);
                                   }
                                   checkIfAllLoaded();

                              } catch (e) {
                                   console.error(`Error evaluating script in ${url}:`, e);
                                   errorCount++;
                                   filesErrored.push(file);
                                   checkIfAllLoaded();
                              }
                         }
                    };
                    xhr.onerror = function () {
                         console.error(`Error evaluating script in ${url}:`, xhr.statusText);
                         errorCount++;
                         filesErrored.push(file);
                         checkIfAllLoaded();
                    }
                    xhr.send();
               };

               let loadedCount = 0;
               let errorCount = 0;
               let errorMessages = [];

               const checkIfAllLoaded = () => {
                    if (loadedCount + errorCount === files.length) {
                         const success = errorCount === 0;
                         const message = success ? "All files loaded successfully" : `Errors loading files: ${errorMessages.join("; ")}`;
                         callback && callback(success, message);
                    }
               };

               const modifyIncludeCalls = (script, file) => {
                    const includeStr = "$1S.include(";
                    const importStr = "$1S.import(";
                    let startIndex = 0;

                    while (true) {
                         // Find the next occurrence of the include function call
                         const includeIndex = script.indexOf(includeStr, startIndex);
                         const importIndex = script.indexOf(importStr, startIndex);
                         var index = -1;

                         if (includeIndex === -1 && importIndex === -1) {
                              break; // No more occurrences found
                         }

                         if (includeIndex != -1 && (importIndex == -1 || (importIndex != -1 && includeIndex < importIndex))) {
                              index = includeIndex;
                         }

                         if (importIndex != -1 && (includeIndex == -1 || (includeIndex != -1 && importIndex < includeIndex))) {
                              index = importIndex;
                         }

                         if (index === -1) {
                              break; // No more occurrences found
                         }

                         // Find the closing parenthesis of the function call
                         let depth = 1;
                         let end = index + includeStr.length;
                         while (depth > 0 && end < script.length) {
                              if (script.charAt(end) === "(") {
                                   depth++;
                              } else if (script.charAt(end) === ")") {
                                   depth--;
                              }
                              end++;
                         }
                         if (depth !== 0) {
                              break; // Malformed include function call
                         }

                         // Build the new function call with the updated second argument
                         const oldCall = script.slice(index, end);
                         const newCall = oldCall.slice(0, -1) + `, "${file}")`;

                         // Replace the old function call with the new one
                         script = script.slice(0, index) + newCall + script.slice(end);

                         // Update the startIndex to search for the next occurrence
                         startIndex = index + newCall.length;
                    }

                    return script;
               }

               if (files && files.length) {
                    files.forEach(loadScript);
               } else if (typeof callback === 'function') {
                    callback(true, "No files to load");
               }
          }

          const importType = async (alias, file, parent = null) => {

               include(file, parent);

               return getTypeAsync(alias);
          }

          const registerType = (type, alias) => {
               const existingType = types.find(t => t.Alias === alias);
               if (!existingType) {
                    types.push({
                         Type: type,
                         Alias: alias
                    });
               }
          }

          const getTypeAsync = async (alias) => {
               while (true) {
                    const existingType = types.find(t => t.Alias === alias);
                    if (existingType) {
                         return existingType.Type;
                    } else {
                         // Wait for 100 milliseconds before trying again
                         await new Promise(resolve => setTimeout(resolve, 100));
                    }
               }
          }

          const getType = (alias) => {

               const existingType = types.find(t => t.Alias === alias);
               if (existingType) {
                    return existingType.Type;
               } else {
                    throw new Error(`Type with alias ${alias} not found`);
               }
          }

          const getParentFilePath = () => {
               const stackTrace = (new Error().stack || '').split('\n')[3] || '';
               const filePathStartIndex = stackTrace.indexOf('/', stackTrace.indexOf('//') + 2);
               const filePathEndIndex = stackTrace.indexOf(':', filePathStartIndex);
               const parentFilePath = filePathStartIndex !== -1 && filePathEndIndex !== -1 ? stackTrace.substring(filePathStartIndex, filePathEndIndex) : '';
               return parentFilePath;
          }

          const resolveUrl = (file, parentPath) => {
               if (!file.toLowerCase().startsWith('http://') && !file.toLowerCase().startsWith('https://')) {
                    const parentUrl = new URL(parentPath, window.location.href);
                    const fileUrl = new URL(file, parentUrl);
                    file = fileUrl.pathname;
               }
               return file;
          }

          return {
               include,
               importType,
               registerType,
               getType,
               getTypeAsync
          }
     })();

     //Rederer module
     OneSparkJs.Renderer = (() => {

          AlignOnEnum = {
               Center: 0,
               UpperLeft: 1,
               UpperRight: 2,
               LowerLeft: 3,
               LowerRight: 4
          }

          SortByEnum = {
               ByPriority: 0,
               ByDepth: 1
          }

          SortByTypes = {
               ByPriority: {
                    sortOnRegister: true,
                    sortOnRender: false,
                    compare: function(a, b){
                         return a.Priority - b.Priority;
                    }
               },
               ByDepth: {
                    sortOnRegister: true,
                    sortOnRender: true,
                    compare: function(a, b) {
                         return a.Instance.z - b.Instance.z;
                    }
               }
          }

          class RenderableType {

               constructor(properties = {}) {
                    this.id = $1S.Helper.newId();
                    this.stageProps = [];  //sub props

                    if (this.sortBy)
                         this.setRenderSort(this.sortBy);
                    else
                         this.setRenderSort(SortByEnum.ByPriority);
               }

               setRenderSort = (sortByEnum) => {

                    if (sortByEnum == SortByEnum.ByPriority) {
                         this.sortBy = OneSparkJs.Renderer.SortByTypes.ByPriority;
                    }
                    if (sortByEnum == SortByEnum.ByDepth) {
                         this.sortBy = OneSparkJs.Renderer.SortByTypes.ByDepth;
                    }
               }

               registerProp = (instance, properties = {}, priority = 100000) => {

                    if (!(instance instanceof StagePropType))
                         throw new Error("Not a StagePropType component.");

                    const newRegistration = {
                         Instance: instance,
                         Properties: properties,
                         Priority: priority
                    };

                    this.stageProps.push(newRegistration);

                    if (this.sortBy.sortOnRegister) {
                         this.stageProps.sort(this.sortBy.compare);
                    }

                    return this.registerProp;
               }

               getProp = (id) => {

                    const subPropsObj = this.stageProps.find(prop => prop.Instance.id === id);

                    if (subPropsObj) {
                         return subPropsObj.Instance;
                    }

                    return null;
               }

               destroyProp = (id) => {

                    const index = this.stageProps.findIndex(prop => prop.Instance.id === id);

                    if (index !== -1) {
                         if (this.stageProps[index].onDestroy)
                              this.stageProps[index].onDestroy();

                         this.stageProps.splice(index, 1);
                         return true;
                    }

                    return false;
               }

               clearProps = () => {
                    for (var i = 0; i < this.stageProps.length; i++)
                         if (this.stageProps[i].onDestroy)
                              this.stageProps[i].onDestroy();

                    this.stageProps[i] = [];
               }

               raiseTickEvent (timeStamp, deltaTime) {

                    if (this.onTick)
                         this.onTick(timeStamp, deltaTime);

                    for (var i = 0; i < this.stageProps.length; i++)
                         this.stageProps[i].Instance.raiseTickEvent(timeStamp, deltaTime);

               }

               raiseRenderEvent(context) {
                    if (this.onDraw)
                         this.onDraw(context);

                    if (this.stageProps.length > 0) {
                         if (this.sortBy.sortOnRender) {
                              this.stageProps.sort(this.sortBy.compare);
                         }

                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].Instance.raiseRenderEvent)
                                   this.stageProps[i].Instance.raiseRenderEvent(context);
                    }


                    if (this.onPostDraw)
                         this.onPostDraw(context);
               }

               raiseResizeEvent(w, h) {
                    if (this.onResize)
                         this.onResize(w, h);

                    for (var i = 0; i < this.stageProps.length; i++)
                         this.stageProps[i].Instance.raiseResizeEvent(this.width, this.height);
               }

               raiseDisposeEvent() {
                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].Instance.raiseDisposeEvent)
                                   this.stageProps[i].Instance.raiseDisposeEvent();
                    }
                    if (this.onDispose)
                         this.onDispose();
               }

          }

          class StageType extends RenderableType {
               constructor(name, properties = {}) {
                    super();

                    const size = $1S.Renderer.Graphics.getSize();
                    this.width = size.width;
                    this.height = size.height;

                    this.name = name;
                    $1S.Renderer.register(name, this);

                    if (this.onInit) this.onInit(properties);
               }

               raiseRenderEvent = (context) => {
                    context.clearRect(0, 0, this.width, this.height);

                    super.raiseRenderEvent(context);

                    $1S.Renderer.Graphics.publish();
               }

               raiseResizeEvent(w, h) {
                    this.width = w;
                    this.height = h;

                    super.raiseResizeEvent(w, h);
               }

          }

          class StagePropType extends RenderableType {

               constructor(properties = {}, skipInit = false) {
                    super();
                    this.x = properties.x || 0;
                    this.y = properties.y || 0;
                    this.z = properties.z || 0;
                    this.width = properties.width || 100;
                    this.height = properties.height || 100;
                    this.rotation = properties.rotation || 0;
                    this.isVisible = properties.isShown || true;
                    this.alignOn = properties.alignOn || AlignOnEnum.Center;

                    //get screen size
                    const size = $1S.Renderer.Graphics.getSize();
                    this.screenWidth = size.width;
                    this.screenHeight = size.height;

                    this.workCanvas = document.createElement('canvas');
                    this.workCanvas.width = this.width;
                    this.workCanvas.height = this.height;
                    this.workContext = this.workCanvas.getContext('2d')

                    if ((!skipInit) && this.onInit) this.onInit(properties);
               }

               isOffScreen(obj) {
                    // Calculate the edges of the shape
                    const leftEdge = this.x;
                    const rightEdge = this.x + this.width;
                    const topEdge = this.y;
                    const bottomEdge = this.y + this.height;

                    // Check if any of the edges are outside the canvas bounds
                    const isOffLeft = rightEdge < 0;
                    const isOffRight = leftEdge > this.screenWidth;
                    const isOffTop = bottomEdge < 0;
                    const isOffBottom = topEdge > this.screenHeight;

                    // Return true if all edges are offscreen, false otherwise
                    return isOffLeft || isOffRight || isOffTop || isOffBottom;
               }

               show() {
                    this.isVisible = true;
               }

               hide() {
                    this.isVisible = false;
               }

               raiseRenderEvent = (context) => {

                    if (!this.isVisible) return;

                    if (context == null)
                         throw new Error("Canvas context is missing.")

                    if (this.onDraw)
                         this.onDraw(this.workContext);

                    super.raiseRenderEvent(this.workContext);

                    if (this.onPostDraw)
                         this.onPostDraw(this.workContext);

                    if (this.rotation != 0) {
                         //for now, rotations always assume an AlignOnEnum of Center
                         const rotationAngle = (Math.PI / 180) * this.rotation;
                         context.save();
                         context.translate(this.x, this.y);
                         context.rotate(rotationAngle);
                         context.translate(-(this.width / 2), -(this.height /2 ));
                         context.drawImage(this.workCanvas, 0, 0);
                         context.restore();
                    } else {
                         switch (this.alignOn) {
                              case AlignOnEnum.Center:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x - (this.width / 2),
                                        this.y - (this.height / 2)
                                   );
                                   break;
                              case AlignOnEnum.UpperLeft:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x,
                                        this.y
                                   );
                                   break;
                              case AlignOnEnum.UpperRight:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x,
                                        this.y - this.height
                                   );
                                   break;
                              case AlignOnEnum.LowerLeft:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x - this.width,
                                        this.y
                                   );
                                   break;
                              case AlignOn.LowerRight:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x - this.width,
                                        this.y - this.height
                                   );
                                   break;
                              default:
                                   context.drawImage(
                                        this.workCanvas,
                                        this.x - (this.width / 2),
                                        this.y - (this.height / 2)
                                   );
                         }
                    }

               }

          }

          class SpritePropType extends StagePropType {

               constructor(properties = {}) {
                    super(properties);

                    this.framesPerSecond = properties.framesPerSecond || 12;

                    this.activeGroup = null;
                    this.spriteGroups = {};

                    this.frame = properties.frameStart || 0;
                    this.framesPerSecond = properties.framesPerSecond || 12;
                    this.frameTime = 1000 / this.framesPerSecond;

                    this.sizeChange = false;

                    this.renderedFrame = -1;
                    this.lastFrameUpdateTime = 0;

                    if (properties.groupName)
                         this.loadGroup(properties.groupName);

                    if (properties.imageName)
                         this.loadImage(properties.imageName, 1);

               }

               loadGroup(groupName) {
                    if (!groupName)
                         throw new Error("A sprite group is required.")

                    const group = $1S.Renderer.Graphics.getImageGroup(groupName);

                    if (!group)
                         throw new Error(`Sprite group ${groupName} not found.`)

                    this.adjustSize(group);

                    this.spriteGroups[groupName] = group;

                    if (!this.activeGroup) {
                         this.activeGroup = group;
                    };
               }

               loadImage(imageName, frameCount) {
                    if (!imageName)
                         throw new Error("An image is required.")

                    const image = $1S.Renderer.Graphics.getImage(imageName);

                    if (!image)
                         throw new Error(`Sprite image ${imageName} not found.`)

                    const group = {
                         group: imageName,
                         clipPaths: []
                    }

                    for (var i = 0; i < frameCount; i++) {
                         group.clipPaths.push({
                              Canvas: image.Canvas,
                              CanvasContext: image.CanvasContext
                         });
                    }

                    this.adjustSize(group);

                    this.spriteGroups[imageName] = group;

                    if (!this.activeGroup) {
                         this.activeGroup = group;
                    };
               }

               adjustSize(group) {
                    var changeSize = false;

                    for (var i = 0; i < group.clipPaths.length; i++) {
                         if (this.width < group.clipPaths[i].Canvas.width) {
                              this.width = group.clipPaths[i].Canvas.width;
                              changeSize = true;
                         }

                         if (this.height < group.clipPaths[i].Canvas.height) {
                              this.height = group.clipPaths[i].Canvas.height;
                              changeSize = true;
                         }
                    }

                    if (changeSize) {
                         this.workCanvas.width = this.width;
                         this.workCanvas.height = this.height;
                         this.workContext = this.workCanvas.getContext('2d');
                    }
               }

               show(groupName) {

                    var group = this.spriteGroups[groupName];

                    if (!group) {
                         this.loadGroup(groupName)
                         group = this.spriteGroups[groupName];
                    }

                    this.frame = 0;
                    this.activeGroup = group;
               }

               onTick(timeStamp, deltaTime) {
                    if (this.activeGroup && this.isVisible && this.activeGroup.clipPaths.length > 1) {
                         const timeSinceLastFrameUpdate = timeStamp - this.lastFrameUpdateTime;
                         if (timeSinceLastFrameUpdate >= this.frameTime) {
                              this.lastFrameUpdateTime = timeStamp;
                              this.frame++;
                              if (this.frame >= this.activeGroup.clipPaths.length) {
                                   this.frame = 0;
                              }
                         }
                    }
               }

               onDraw(context) {
                    if (this.activeGroup && this.isVisible && this.frame != this.renderedFrame) {
                         const groupCanvas = this.activeGroup.clipPaths[this.frame].Canvas;
                         const groupContext = this.activeGroup.clipPaths[this.frame].CanvasContext;

                         context.clearRect(0, 0, this.workCanvas.width, this.workCanvas.height);
                         context.drawImage(groupCanvas, 0, 0);
                         this.renderedFrame = this.frame;
                    }
               }

          }

          class LayoutPropType extends StagePropType {

               constructor(layoutName, properties = {}) {
                    super(properties);

                    if (!layoutName)
                         throw new Error(`Layout name invalid.`)

                    this.layoutName = layoutName;

                    this.tiles = [];

                    this.initialize();
               }

               initialize() {
                    var layout = $1S.Renderer.Graphics.getLayout(this.layoutName);

                    if (!layout)
                         throw new Error(`Layout ${layoutName} not found.`)

                    for (var i = 0; i < layout.tiles.length; i++) {
                         const tile = layout.tiles[i];

                         const sprite = new $1S.Renderer.Type.SpriteType(
                              {
                                   imageName: tile.imageName,
                                   groupName: tile.groupName,
                                   framesPerSecond: tile.frameRate || 0,
                                   framesStart: tile.frameStart || 0,
                                   x: tile.x || 0,
                                   y: tile.y || 0,
                                   alignOn: tile.alignOn || $1S.Renderer.Type.AlignOn.UpperLeft
                              });

                         this.registerProp(sprite);

                    };

               }

          }

          class Extension extends OneSparkJs.Application.ExtensionType {

               stages = {};
               activeStageName = null;

               constructor() {
                    super(0);
               }

               getActiveName = () => {
                    return this.activeStageName;
               }

               register = (name, instance = null) => {
                    if (!name)
                         throw new Error("Invalid stage name.");

                    if (this.stages[name])
                         throw new Error("Stage already defined.");

                    if (instance == null || !(instance instanceof StageType))
                         throw new Error("Not a StageType.");

                    this.stages[name] = {
                         Name: name,
                         Instance: instance,
                         SavedState: null
                    };
               }

               raiseResizeEvent = (w,h) => {
                    if (this.activeStageName == null) return;

                    const stage = this.stages[this.activeStageName];

                    if (!stage) return;

                    stage.Instance.raiseResizeEvent(w, h);
               }

               raiseRenderEvent = () => {

                    if (this.activeStageName == null) return;

                    const stage = this.stages[this.activeStageName];

                    if (!stage) return;

                    const context = $1S.Renderer.Graphics.getContext();

                    stage.Instance.raiseRenderEvent(context);
               }

               get = () => {
                    var stage = null;

                    if (this.activeStageName != null) {
                         stage = this.stages[this.activeStageName];
                    }

                    return stage;
               }

               destroy = (stageName = null) => {
                    stageName = stageName || this.activeStageName;

                    if (this.activeStageName === stageName) {
                         this.activeStageName = null;
                    }

                    const stage = this.stages[stageName];

                    if (!stage) {
                         throw new Error("Stage not found.");
                    }

                    stage.raiseDisposeEvent();

                    stage.clearProps();

                    delete this.stages[stageName];
               }

               switchTo = (name) => {

                    if (this.activeStageName != null) {
                         this.stages[this.activeStageName].SavedState = $1S.Renderer.Graphics.getState();
                    }

                    if (name == null) {
                         this.activeStageName = null;
                         return;
                    }

                    if (!this.stages[name]) {
                         throw new Error(`Stage not found: ${name}`);
                    }

                    this.activeStageName = name;
                    if (this.stages[this.activeStageName].SavedState != null) {
                         if (this.stages[this.activeStageName].SavedState)
                              $1S.Renderer.Graphics.setState(this.stages[this.activeStageName].SavedState);
                    }

               }

               onLoad = (appPath, properties) => {
                    if (properties.canvas) {
                         OneSparkJs.Graphics.initialize(properties.canvas);
                         OneSparkJs.Inputs.initialize(properties.canvas);
                    }
               }

               handleTickEvent = (timeStamp, deltaTime) => {
                    if (this.activeStageName) {
                         const stage = this.stages[this.activeStageName];
                         stage.Instance.raiseTickEvent(timeStamp, deltaTime);
                    }
               }

               handlePostTickEvent = (timeStamp, deltaTime) => {
                    this.raiseRenderEvent();
               }

               reset = () => {

                    const stageNames = Object.keys(this.stages);

                    for (var i = 0; i < this.stagesNames.length; i++) {
                         destroy(stageNames[i]);
                    };

                    this.stages = {};
                    this.activeStageName = null;
               }

          }

          const Ext = new Extension();

          return { AlignOnEnum, StageType, SortByEnum, SortByTypes, StagePropType, SpritePropType, LayoutPropType, Ext }
     })();

     //Inputs
     OneSparkJs.Inputs = (() => {

          const EventTypes = {
               KEY_DOWN: 'keydown',
               KEY_UP: 'keyup',
               MOUSE_MOVE: 'mousemove',
               MOUSE_UP: 'mouseup',
               MOUSE_CLICK: 'mouseclick',
               RIGHT_MOUSE_CLICK: 'rightmouseclick',
               CENTER_MOUSE_CLICK: 'centermouseclick',
               RIGHT_MOUSE_UP: 'rightmouseup',
               CENTER_MOUSE_UP: 'centermouseup',
               MOUSE_SCROLL_UP: 'mousescrollup',
               MOUSE_SCROLL_DOWN: 'mousescrolldown',
               MOUSE_ENTER: 'mouseenter',
               MOUSE_LEAVE: 'mouseleave',
               MOUSE_CANVAS_ENTER: 'mousecanvasenter',
               MOUSE_CANVAS_LEAVE: 'mousecanvasleave',
               TOUCH_START: 'touchstart',
               TOUCH_MOVE: 'touchmove',
               TOUCH_END: 'touchend',
               TOUCH_CANCEL: 'touchcancel',
               SWIP_LEFT: 'swipeleft',
               SWIPE_RIGHT: 'swiperight',
               TAP: 'tap',
               DOUBLE_TAP: 'doubletap',
               PINCH: 'pinch',
               EXPAND: 'expand',
               ROTATE: 'rotate',
               SHAKE: 'shake',
               DEVICE_ORIENTATION: 'deviceorientation',
               DEVICE_MOTION: 'devicemotion',
               VISIBILITY_CHANGE: 'visibilitychange'
          };

          //swipe
          let swipeStartX = null;
          let swipeStartY = null;
          let swipeThreshold = 50; // Minimum distance in pixels to be considered a swipe

          //pinch, expand, rotate
          let initialDistance = null;
          let initialAngle = null;
          let pinchThreshold = 10; // Minimum distance change in pixels to be considered a pinch or expand gesture

          //shake
          let shakeHandlers = [];
          let lastShakeTime = 0;
          const shakeThreshold = 15; // Adjust this value to make the shake detection more or less sensitive
          const shakeTimeout = 1000; // Time in milliseconds to wait before allowing another shake event

          let tapTimeout = null;
          let doubleTapTimeout = null;
          let tapThreshold = 200; // Maximum time in milliseconds between touchstart and touchend to be considered a tap
          let doubleTapThreshold = 300; // Maximum time in milliseconds between two taps to be considered a double tap

          let handlers = {};

          const initialize = (canvasId) => {
               const canvas = document.getElementById(canvasId);

               canvas.addEventListener(EventTypes.MOUSE_MOVE, mouseMoveEvent);
               canvas.addEventListener("mousedown", mouseDownEvent);
               canvas.addEventListener(EventTypes.MOUSE_UP, mouseUpEvent);
               canvas.addEventListener("wheel", mouseScrollEvent);
               canvas.addEventListener("mouseenter", mouseCanvasEnterEvent);
               canvas.addEventListener("mouseleave", mouseCanvasLeaveEvent);
               canvas.addEventListener(EventTypes.TOUCH_START, touchStartEvent);
               canvas.addEventListener(EventTypes.TOUCH_MOVE, touchMoveEvent);
               canvas.addEventListener(EventTypes.TOUCH_END, touchEndEvent);
               canvas.addEventListener(EventTypes.TOUCH_CANCEL, touchCancelEvent);
               window.addEventListener(EventTypes.KEY_DOWN, keyDownEvent);
               window.addEventListener(EventTypes.KEY_UP, keyUpEvent);
               window.addEventListener(EventTypes.DEVICE_ORIENTATION, deviceOrientationEvent);
               window.addEventListener(EventTypes.DEVICE_MOTION, deviceMotionEvent);
               document.addEventListener(EventTypes.VISIBILITY_CHANGE, visibilityChangeEvent);

          };

          const keyUpEvent = (event) => {
               if (!handlers[EventTypes.KEY_UP]) return;

               // Sort the event handlers by priority
               handlers[EventTypes.KEY_UP].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[EventTypes.KEY_UP].length; i++) {
                    const handler = handlers[EventTypes.KEY_UP][i];

                    // Call the event handler with the event object as a parameter
                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const keyDownEvent = (event) => {
               if (!handlers[EventTypes.KEY_DOWN]) return;

               // Sort the event handlers by priority
               handlers[EventTypes.KEY_DOWN].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[EventTypes.KEY_DOWN].length; i++) {
                    const handler = handlers[EventTypes.KEY_DOWN][i];

                    // Call the event handler with the event object as a parameter
                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const mouseMoveEvent = (event) => {
               handleMouseEvent(event, EventTypes.MOUSE_MOVE);
          };

          const mouseUpEvent = (event) => {
               switch (event.button) {
                    case 0:
                         handleMouseEvent(event, EventTypes.MOUSE_UP);
                         break;
                    case 1:
                         handleMouseEvent(event, EventTypes.CENTER_MOUSE_UP);
                         break;
                    case 2:
                         handleMouseEvent(event, EventTypes.RIGHT_MOUSE_UP);
                         break;
               }
          };

          const mouseDownEvent = (event) => {
               switch (event.button) {
                    case 0:
                         handleMouseEvent(event, EventTypes.MOUSE_CLICK);
                         break;
                    case 1:
                         handleMouseEvent(event, EventTypes.CENTER_MOUSE_CLICK);
                         break;
                    case 2:
                         handleMouseEvent(event, EventTypes.RIGHT_MOUSE_CLICK);
                         break;
               }
          };

          const mouseCanvasEnterEvent = (event) => {
               handleCanvasEvent(event, EventTypes.MOUSE_CANVAS_ENTER);
          };

          const mouseCanvasLeaveEvent = (event) => {
               handleCanvasEvent(event, EventTypes.MOUSE_CANVAS_LEAVE);
          };

          const mouseScrollEvent = (event) => {
               if (event.deltaY > 0) {
                    handleMouseEvent(event, EventTypes.MOUSE_SCROLL_DOWN);
               } else {
                    handleMouseEvent(event, EventTypes.MOUSE_SCROLL_UP);
               }
          };

          const touchStartEvent = (event) => {
               if (event.touches.length === 1) {
                    swipeStartX = event.touches[0].clientX;
                    swipeStartY = event.touches[0].clientY;
               } else if (event.touches.length === 2) {
                    initialDistance = calculateDistance(event.touches[0], event.touches[1]);
                    initialAngle = calculateAngle(event.touches[0], event.touches[1]);
               }
               handleTouchEvent(event, EventTypes.TOUCH_START);
          };

          const touchMoveEvent = (event) => {
               if (event.touches.length === 2) {
                    if (initialDistance !== null) {
                         const currentDistance = calculateDistance(event.touches[0], event.touches[1]);
                         if (Math.abs(currentDistance - initialDistance) > pinchThreshold) {
                              if (currentDistance > initialDistance) {
                                   handlePinchEvent(event, EventTypes.EXPAND);
                              } else {
                                   handlePinchEvent(event, EventTypes.PINCH);
                              }
                              initialDistance = currentDistance;
                         }
                    }

                    if (initialAngle !== null) {
                         const currentAngle = calculateAngle(event.touches[0], event.touches[1]);
                         const angleDifference = currentAngle - initialAngle;

                         handleRotationEvent(event, EventTypes.ROTATE, angleDifference);

                         initialAngle = currentAngle;
                    }
               }
               handleTouchEvent(event, EventTypes.TOUCH_MOVE);
          };

          const touchEndEvent = (event) => {
               if (event.touches.length === 0 && initialDistance === null && initialAngle === null) {
                    if (doubleTapTimeout !== null) {
                         clearTimeout(doubleTapTimeout);
                         doubleTapTimeout = null;
                         handleTapEvent(event, EventTypes.DOUBLE_TAP);
                    } else {
                         tapTimeout = setTimeout(() => {
                              handleTapEvent(event, EventTypes.TAP);
                              doubleTapTimeout = setTimeout(() => {
                                   doubleTapTimeout = null;
                              }, doubleTapThreshold);
                         }, tapThreshold);
                    }
               }

               if (swipeStartX !== null && swipeStartY !== null) {
                    const touch = event.changedTouches[0];
                    const diffX = touch.clientX - swipeStartX;
                    const diffY = touch.clientY - swipeStartY;

                    if (Math.abs(diffX) > Math.abs(diffY)) {
                         if (Math.abs(diffX) > swipeThreshold) {
                              if (diffX > 0) {
                                   handleSwipeEvent(event, EventTypes.SWIP_RIGHT);
                              } else {
                                   handleSwipeEvent(event, EventTypes.SWIP_LEFT);
                              }
                         }
                    }
               }
               swipeStartX = null;
               swipeStartY = null;
               initialDistance = null;
               initialAngle = null;

               handleTouchEvent(event, EventTypes.TOUCH_END);
          };

          const touchCancelEvent = (event) => {
               handleTouchEvent(event, EventTypes.TOUCH_CANCEL);
          };

          const deviceOrientationEvent = (event) => {
               handleDeviceEvent(event, EventTypes.DEVICE_ORIENTATION);
          };

          const deviceMotionEvent = (event) => {
               handleDeviceEvent(event, EventTypes.DEVICE_MOTION);

               if (!event.accelerationIncludingGravity) return;

               const { x, y, z } = event.accelerationIncludingGravity;
               const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

               if (accelerationMagnitude > shakeThreshold && Date.now() - lastShakeTime > shakeTimeout) {
                    lastShakeTime = Date.now();
                    handleShakeEvent();
               }
          };

          const visibilityChangeEvent = () => {
               const hidden = document.hidden;
               handleVisibilityChange(hidden);
          };

          const handleCanvasEvent = (event, eventType) => {

               if (!handlers[eventType]) return;

               // Sort the event handlers by priority
               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    // Call the event handler with the event object as a parameter
                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handleMouseEvent = (event, eventType) => {

               if (!handlers[eventType]) return;

               // Sort the event handlers by priority
               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {

                    const handler = handlers[eventType][i];

                    // If the handler has specified a region, check if the event is inside the region
                    if (handler.region) {
                         if (
                              event.clientX < handler.region.x1 ||
                              event.clientX > handler.region.x2 ||
                              event.clientY < handler.region.y1 ||
                              event.clientY > handler.region.y2
                         )
                         {
                              if (eventType == EventTypes.MOUSE_MOVE && (handler.isOver)) {

                                   console.log("out", eventType, handler);

                                   handler.isOver = false;
                                   handleMouseEvent(event, EventTypes.MOUSE_LEAVE);
                              }

                              continue;
                         }
                    }

                    if (eventType == EventTypes.MOUSE_MOVE && (!handler.isOver)) {
                         handler.isOver = true;
                         handleMouseEvent(event, EventTypes.MOUSE_ENTER);
                    }

                    // Call the event handler with the event object as a parameter
                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handleTouchEvent = (event, eventType) => {
               if (!handlers[eventType]) return;

               // Sort the event handlers by priority
               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    // Check if any of the touch points are inside the region
                    let insideRegion = false;
                    for (let j = 0; j < event.touches.length; j++) {
                         const touch = event.touches[j];
                         if (
                              touch.clientX >= handler.region.x1 &&
                              touch.clientX <= handler.region.x2 &&
                              touch.clientY >= handler.region.y1 &&
                              touch.clientY <= handler.region.y2
                         ) {
                              insideRegion = true;
                              break;
                         }
                    }

                    // If none of the touch points are inside the region, skip this handler
                    if (!insideRegion) continue;

                    // Call the event handler with the event object as a parameter
                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }

          };

          const handleTapEvent = (event, eventType) => {
               if (!handlers[eventType]) return;

               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    if (handler.region) {
                         if (
                              event.clientX < handler.region.x1 ||
                              event.clientX > handler.region.x2 ||
                              event.clientY < handler.region.y1 ||
                              event.clientY > handler.region.y2
                         ) {
                              continue;
                         }
                    }

                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handleSwipeEvent = (event, eventType) => {
               if (!handlers[eventType]) return;

               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    if (handler.region) {
                         if (
                              event.clientX < handler.region.x1 ||
                              event.clientX > handler.region.x2 ||
                              event.clientY < handler.region.y1 ||
                              event.clientY > handler.region.y2
                         ) {
                              continue;
                         }
                    }

                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handlePinchEvent = (event, eventType) => {
               if (!handlers[eventType]) return;

               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    if (handler.region) {
                         if (
                              event.clientX < handler.region.x1 ||
                              event.clientX > handler.region.x2 ||
                              event.clientY < handler.region.y1 ||
                              event.clientY > handler.region.y2
                         ) {
                              continue;
                         }
                    }

                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handleRotationEvent = (event, eventType, angleDifference) => {
               if (!handlers[eventType]) return;

               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    if (handler.region) {
                         if (
                              event.clientX < handler.region.x1 ||
                              event.clientX > handler.region.x2 ||
                              event.clientY < handler.region.y1 ||
                              event.clientY > handler.region.y2
                         ) {
                              continue;
                         }
                    }

                    const stopPropagation = handler.eventHandler(event, angleDifference);
                    if (stopPropagation) break;
               }
          };

          const handleDeviceEvent = (event, eventType) => {
               if (!handlers[eventType]) return;

               handlers[eventType].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[eventType].length; i++) {
                    const handler = handlers[eventType][i];

                    const stopPropagation = handler.eventHandler(event);
                    if (stopPropagation) break;
               }
          };

          const handleShakeEvent = () => {
               if (!handlers[EventTypes.SHAKE]) return;

               handlers[EventTypes.SHAKE].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[EventTypes.SHAKE].length; i++) {
                    const handler = handlers[EventTypes.SHAKE][i];

                    const stopPropagation = handler.eventHandler();
                    if (stopPropagation) break;
               }
          };

          const handleVisibilityChange = (hidden) => {
               if (!handlers[EventTypes.VISIBILITY_CHANGE]) return;

               handlers[EventTypes.VISIBILITY_CHANGE].sort((a, b) => a.priority - b.priority);

               for (let i = 0; i < handlers[EventTypes.VISIBILITY_CHANGE].length; i++) {
                    const handler = handlers[EventTypes.VISIBILITY_CHANGE][i];

                    const stopPropagation = handler.eventHandler({ hidden });
                    if (stopPropagation) break;
               }
          };

          const attach = (eventType, source, eventHandler, priority = 100, region = null) => {
               if (!handlers[eventType]) handlers[eventType] = [];

               const h = {
                    source,
                    eventHandler,
                    priority: priority || 0,
                    isOver: false,
                    region
               };

               handlers[eventType].push(h);

               return h;
          };

          const release = (source) => {
               for (const eventType in handlers) {
                    if (handlers.hasOwnProperty(eventType)) {
                         handlers[eventType] = handlers[eventType].filter(
                              (handler) => handler.source !== source
                         );
                    }
               }
          };

          const clear = (source) => {
               handlers = { };
          };

          const calculateDistance = (touch1, touch2) => {
               const diffX = touch2.clientX - touch1.clientX;
               const diffY = touch2.clientY - touch1.clientY;
               return Math.sqrt(diffX * diffX + diffY * diffY);
          };

          const calculateAngle = (touch1, touch2) => {
               const diffX = touch2.clientX - touch1.clientX;
               const diffY = touch2.clientY - touch1.clientY;
               return Math.atan2(diffY, diffX);
          };

          return {
               EventTypes,
               initialize,
               attach,
               release,
               clear
          };

     })();

     // Public API
     global.$1S = {
          Application: {
               ExtensionType: OneSparkJs.Application.ExtensionType,
               load: OneSparkJs.Application.load,
               start: OneSparkJs.Application.start,
               startClock: OneSparkJs.Application.startClock,
               stopClock: OneSparkJs.Application.stopClock,
               get: OneSparkJs.Application.get,
               registerExtension: OneSparkJs.Application.registerExtension
          },
          Renderer: {
               Type: {
                    AlignOn: OneSparkJs.Renderer.AlignOnEnum,
                    SortBy: OneSparkJs.Renderer.SortByEnum,
                    StageType: OneSparkJs.Renderer.StageType,
                    StagePropType: OneSparkJs.Renderer.StagePropType,
                    SpriteType: OneSparkJs.Renderer.SpritePropType,
                    LayoutType: OneSparkJs.Renderer.LayoutPropType
               },
               Graphics: {
                    setState: OneSparkJs.Graphics.setState,
                    getState: OneSparkJs.Graphics.getState,
                    getContext: OneSparkJs.Graphics.getContext,
                    getSize: OneSparkJs.Graphics.getSize,
                    getStyle: OneSparkJs.Graphics.getStyle,
                    publish: OneSparkJs.Graphics.publish,
                    attachEvent: OneSparkJs.Graphics.attachEvent,
                    getImage: OneSparkJs.Assets.getImage,
                    getImageGroup: OneSparkJs.Assets.getImageGroup,
                    getLayout: OneSparkJs.Assets.getLayout
               },
               register: OneSparkJs.Renderer.Ext.register,
               render: OneSparkJs.Renderer.Ext.render,
               destroy: OneSparkJs.Renderer.Ext.destroy,
               get: OneSparkJs.Renderer.Ext.get,
               getActiveName: OneSparkJs.Renderer.Ext.getActiveName,
               switchTo: OneSparkJs.Renderer.Ext.switchTo
          },
          Audio: {
               get: OneSparkJs.Assets.getAudio,
               play: OneSparkJs.Audio.playAudio,
               stop: OneSparkJs.Audio.stopAudio,
               stopAll: OneSparkJs.Audio.stopAllAudios
          },
          IO: {
               Input: {
                    EventTypes: OneSparkJs.Inputs.EventTypes,
                    attach: OneSparkJs.Inputs.attach,
                    release: OneSparkJs.Inputs.release,
                    clear: OneSparkJs.Inputs.clear
               },
               loadJSON: OneSparkJs.IO.loadJSON,
          },
          Helper: {
               newId: OneSparkJs.Helper.newId,
          },
          import: OneSparkJs.Module.importType,
          include: OneSparkJs.Module.include,
          registerType: OneSparkJs.Module.registerType,
          getType: OneSparkJs.Module.getType,
          getTypeAsync: OneSparkJs.Module.getTypeAsync
     };

})(typeof window !== 'undefined' ? window : global);
