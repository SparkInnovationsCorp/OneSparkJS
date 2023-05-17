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
                         instance: this,
                         Priority: priority
                    });

                    extensions.sort((a, b) => a.Priority - b.Priority);
               }
          }

          const load = (appPath, properties = {}, callback = null) => {
               if (!appPath.endsWith('/')) {
                    appPath += '/';
               }

               if (properties.threeSupport) {
                    loadThreeJS(() => {
                         loadExtensions(appPath, properties, () => {
                              console.log("All extensions loaded.")
                              loadApplication(appPath);
                         })
                    });
               } else {
                    loadExtensions(appPath, properties, () => {
                         console.log("All extensions loaded.")
                         loadApplication(appPath);
                    })
               }
          }

          const loadExtensions = (appPath, properties, callback) => {
               var numExtensions = extensions.length;
               var numLoaded = 0;

               extensions.forEach(ext => {
                    if (ext.instance.onLoad) {
                         ext.instance.onLoad(appPath, properties, () => {
                              numLoaded++;
                              if (numLoaded === numExtensions) {
                                   callback();
                              }
                         });
                    }
               });
          }

          const loadThreeJS = (callback) => {
               // Create a script element
               const script = document.createElement('script');

               // Set the source of the script to the Three.js library URL
               script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

               // Set a callback function to execute once the script is loaded
               script.onload = callback;

               // Append the script element to the document's body
               document.body.appendChild(script);
          }

          const loadApplication = (appPath) => {
               $1S.include(`${appPath}main.js`, null, (success, errorMessage) => {
                    if (success) {
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

               $1S.Renderer.Canvas.clear();

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
                         if (ext.instance.handleTickEvent) {
                              ext.instance.handleTickEvent(timeStamp, deltaTime);
                         };
                    });

                    //post tick
                    extensions.forEach(ext => {
                         if (ext.instance.handlePostTickEvent) {
                              ext.instance.handlePostTickEvent(timeStamp, deltaTime);
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
                         instance: obj,
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

     // Helper functions
     OneSparkJs.Helper = (() => {
          const newId = () => {
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
