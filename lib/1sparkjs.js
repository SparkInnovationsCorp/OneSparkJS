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

                    //pre tick
                    if (application.onPreTick) {
                         application.onPreTick(timeStamp, deltaTime);
                    }

                    extensions.forEach(ext => {
                         if (ext.Instance.onPreTick) {
                              ext.Instance.onPreTick(timeStamp, deltaTime);
                         };
                    });

                    //tick
                    if (application.onTick) {
                         application.onTick(timeStamp, deltaTime);
                    }

                    extensions.forEach(ext => {
                         if (ext.Instance.onTick) {
                              ext.Instance.onTick(timeStamp, deltaTime);
                         };
                    });

                    //post tick
                    if (application.onPostTick) {
                         application.onPostTick(timeStamp, deltaTime);
                    }

                    extensions.forEach(ext => {
                         if (ext.Instance.onPostTick) {
                              ext.Instance.onPostTick(timeStamp, deltaTime);
                         };
                    });

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
               images: []
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
                                   assetSheet.images = json.images;

                                   assetSheet.images.forEach(function (node) {
                                        preloadImage(node);
                                   });
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
               for (let i = 0; i < assetSheet.images.length; i++) {
                    if (assetSheet.images[i].group === name) {
                         return assetSheet.images[i];
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

                              console.log(sourceCanvas.width, sourceCanvas.height, cpNode.name, canvas.width, canvas.height, cpNode.clipPath);

                              // Close the path
                              sourceContext.closePath();

                              // Clip the canvas to the path
                              sourceContext.clip();

                              // Draw the image onto the canvas, offset by the top-left corner of the clip path
                              ctx.drawImage(sourceCanvas, -xMin, -yMin);

                              cpNode.Canvas = canvas;
                              cpNode.CanvasContext = ctx;

                              console.log("clip load", cpNode);

                         });

                    } else {

                         imageNode.Canvas = sourceCanvas;
                         imageNode.CanvasContext = sourceContext;

                         console.log("image load", imageNode);

                    }

               };

          }

          return {
               load,
               getAudio,
               getImage,
               getImageGroup
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

          class FilterType {
               constructor(properties = {}) {
                    this.id = $1S.Helper.newId();

                    if (this.onInit) this.onInit(properties);
               }

               onRender(context = null) {
                    throw new Error("onRender not implemented.");
               }
          }

          class RenderableType {

               constructor(properties = {}) {
                    this.id = $1S.Helper.newId();
                    this.stageProps = [];  //sub props
                    this.filters = [];     //filters context response
               }

               registerProp = (instance, properties = {}, priority = 100000) => {

                    if (!(instance instanceof StagePropType))
                         throw new Error("Not a StagePropType component.");

                    this.stageProps.push({
                         Instance: instance,
                         Properties: properties,
                         Priority: priority
                    });

                    // Sort Props by priority
                    this.stageProps.sort((a, b) => a.Priority - b.Priority);
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

               registerFilter = (instance, priority = 100000) => {
                    if (!(instance instanceof FilterType))
                         throw new Error("Not a FilterType component.");

                    this.filters.push({
                         Instance: instance,
                         Priority: priority
                    });

                    // Sort Filters by priority
                    this.filters.sort((a, b) => a.Priority - b.Priority);
               }

               getFilter = (id) => {

                    const filtersObj = this.filters.find(Filter => Filter.Instance.id === id);

                    if (filtersObj) {
                         return filtersObj.Instance;
                    }

                    return null;
               }

               destroyFilter = (id) => {

                    const index = this.filters.findIndex(Filter => Filter.Instance.id === id);

                    if (index !== -1) {
                         if (this.filters[i].onDestroy)
                              this.filters[i].onDestroy();

                         this.filters.splice(index, 1);
                         return true;
                    }

                    return false;
               }

               onTick(timeStamp, deltaTime) {

                    if (this.onUpdate)
                         this.onUpdate(timeStamp, deltaTime);

                    for (var i = 0; i < this.stageProps.length; i++)
                         this.stageProps[i].Instance.onTick(timeStamp, deltaTime);

               }

               onRender(context) {
                    for (var i = 0; i < this.stageProps.length; i++)
                         if (this.stageProps[i].Instance.onRender)
                              this.stageProps[i].Instance.onRender(context);
               }

               onFilter(context) {
                    for (var i = 0; i < this.filters.length; i++)
                         if (this.filters[i].Instance.onRender)
                              this.filters[i].Instance.onRender(context);
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

               onRender() {
                    const context = $1S.Renderer.Graphics.getContext();

                    context.clearRect(0, 0, this.width, this.height);

                    if (this.onDraw)
                         this.onDraw(context);

                    super.onRender(context);

                    if (this.onPostDraw)
                         this.onPostDraw(context);

                    super.onFilter(context);

                    $1S.Renderer.Graphics.publish();
               }
          }

          class StagePropType extends RenderableType {
               constructor(properties = {}) {
                    super();
                    this.x = properties.x || 0;
                    this.y = properties.y || 0;
                    this.width = properties.width || 100;
                    this.height = properties.height || 100;
                    this.rotation = properties.rotation || 0;

                    //get screen size
                    const size = $1S.Renderer.Graphics.getSize();
                    this.screenWidth = size.width;
                    this.screenHeight = size.height;

                    this.workCanvas = document.createElement('canvas');
                    this.workCanvas.width = this.width;
                    this.workCanvas.height = this.height;
                    this.workContext = this.workCanvas.getContext('2d')
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

               onRender(context = null) {

                    if (context == null)
                         throw new Error("Canvas context is missing in onRender.")

                    if (this.onDraw)
                         this.onDraw(this.workContext);

                    super.onRender(this.workContext);

                    if (this.onPostDraw)
                         this.onPostDraw(this.workContext);

                    super.onFilter(this.workContext);

                    // Calculate the center point of the workCanvas
                    const centerX = this.x;
                    const centerY = this.y;

                    // Save the current canvas state
                    context.save();

                    // Translate the context to the center point
                    context.translate(centerX, centerY);

                    // Rotate the context by the current rotation value
                    context.rotate((this.rotation) * Math.PI / 180);


                    // Draw the workCanvas onto the context, offset by half its width and height
                    context.drawImage(
                         this.workCanvas,
                         -this.width / 2,
                         -this.height / 2,
                         this.width,
                         this.height
                    );

                    // Restore the canvas state to the previous saved state
                    context.restore();

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

               render = () => {

                    if (this.activeStageName == null) return;

                    const stage = this.stages[this.activeStageName];

                    if (!stage) return;

                    if (stage.Instance.onRender) {
                         stage.Instance.onRender();
                    }

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

                    stage.clearProps();

                    // Call destroy on stage
                    if (stage.onDestroy) {
                         stage.onDestroy();
                    }

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
                    }
               }

               onTick = (timeStamp, deltaTime) => {

                    if (this.activeStageName) {
                         const stage = this.stages[this.activeStageName];

                         stage.Instance.onTick(timeStamp, deltaTime);
                    }

               }

               onPostTick = (timeStamp, deltaTime) => {
                    this.render();
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

          return { StageType, StagePropType, Ext }
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
                    StageType: OneSparkJs.Renderer.StageType,
                    StagePropType: OneSparkJs.Renderer.StagePropType,
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
                    getImageGroup: OneSparkJs.Assets.getImageGroup
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
