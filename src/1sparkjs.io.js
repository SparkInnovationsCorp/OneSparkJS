((global) => {

     const OneSparkJs = {};

     OneSparkJs.InputEventTypes = {
          KEY_DOWN: 'keydown',
          KEY_UP: 'keyup',
          MOUSE_MOVE: 'mousemove',
          MOUSE_UP: 'mouseup',
          MOUSE_CLICK: 'mouseclick',
          MOUSE_CLICK_OUT: 'mouseclickout',
          MOUSE_DOUBLE_CLICK: 'mousedoubleclick',
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
          TAP_OUT: 'tapout',
          DOUBLE_TAP: 'tap',
          PINCH: 'pinch',
          EXPAND: 'expand',
          ROTATE: 'rotate',
          SHAKE: 'shake',
          DEVICE_ORIENTATION: 'deviceorientation',
          DEVICE_MOTION: 'devicemotion',
          VISIBILITY_CHANGE: 'visibilitychange'
     };

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

     //Audio module
     OneSparkJs.Inputs = (() => {

          class Extension extends $1S.Application.ExtensionType {

               //swipe
               swipeStartX = null;
               swipeStartT = null;
               swipeThreshold = 50; // Minimum distance in pixels to be considered a swipe

               //pinch, expand, rotate
               initialDistance = null;
               initialAngle = null;
               pinchThreshold = 10; // Minimum distance change in pixels to be considered a pinch or expand gesture

               //shake
               shakeHandlers = [];
               lastShakeTime = 0;
               shakeThreshold = 15; // Adjust this value to make the shake detection more or less sensitive
               shakeTimeout = 1000; // Time in milliseconds to wait before allowing another shake event

               tapTimeout = null;
               doubleTapTimeout = null;
               doubleTapThreshold = 300; // Maximum time in milliseconds between two taps to be considered a double tap
               tapThreshold = 200; // Maximum time in milliseconds between touchstart and touchend to be considered a tap

               handles = {};

               constructor() {
                    super(0);
               }

               onLoad = (appPath, properties, oncomplete) => {
                    if (properties.canvas) {
                         const canvas = document.getElementById(properties.canvas);

                         canvas.addEventListener(OneSparkJs.InputEventTypes.MOUSE_MOVE, this.mouseMoveEvent);
                         canvas.addEventListener("mousedown", this.mouseDownEvent);
                         canvas.addEventListener(OneSparkJs.InputEventTypes.MOUSE_UP, this.mouseUpEvent);
                         canvas.addEventListener("wheel", this.mouseScrollEvent);
                         canvas.addEventListener("mouseenter", this.mouseCanvasEnterEvent);
                         canvas.addEventListener("mouseleave", this.mouseCanvasLeaveEvent);
                         canvas.addEventListener(OneSparkJs.InputEventTypes.TOUCH_START, this.touchStartEvent);
                         canvas.addEventListener(OneSparkJs.InputEventTypes.TOUCH_MOVE, this.touchMoveEvent);
                         canvas.addEventListener(OneSparkJs.InputEventTypes.TOUCH_END, this.touchEndEvent);
                         canvas.addEventListener(OneSparkJs.InputEventTypes.TOUCH_CANCEL, this.touchCancelEvent);
                    }
                    window.addEventListener(OneSparkJs.InputEventTypes.KEY_DOWN, this.keyDownEvent);
                    window.addEventListener(OneSparkJs.InputEventTypes.KEY_UP, this.keyUpEvent);
                    window.addEventListener(OneSparkJs.InputEventTypes.DEVICE_ORIENTATION, this.deviceOrientationEvent);
                    window.addEventListener(OneSparkJs.InputEventTypes.DEVICE_MOTION, this.deviceMotionEvent);
                    document.addEventListener(OneSparkJs.InputEventTypes.VISIBILITY_CHANGE, this.visibilityChangeEvent);

                    oncomplete()
               }

               keyUpEvent = (event) => {
                    if (!this.handles[OneSparkJs.InputEventTypes.KEY_UP]) return;

                    // Sort the event this.handles by priority
                    this.handles[OneSparkJs.InputEventTypes.KEY_UP].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[OneSparkJs.InputEventTypes.KEY_UP].length; i++) {
                         const handle = this.handles[OneSparkJs.InputEventTypes.KEY_UP][i];

                         // Call the event handle with the event object as a parameter
                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               keyDownEvent = (event) => {
                    if (!this.handles[OneSparkJs.InputEventTypes.KEY_DOWN]) return;

                    // Sort the event this.handles by priority
                    this.handles[OneSparkJs.InputEventTypes.KEY_DOWN].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[OneSparkJs.InputEventTypes.KEY_DOWN].length; i++) {
                         const handle = this.handles[OneSparkJs.InputEventTypes.KEY_DOWN][i];

                         // Call the event handle with the event object as a parameter
                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               mouseMoveEvent = (event) => {
                    this.handleMouseEvent(event, OneSparkJs.InputEventTypes.MOUSE_MOVE);
               };

               mouseUpEvent = (event) => {
                    switch (event.button) {
                         case 0:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.MOUSE_UP);
                              break;
                         case 1:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.CENTER_MOUSE_UP);
                              break;
                         case 2:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.RIGHT_MOUSE_UP);
                              break;
                    }
               };

               mouseDownEvent = (event) => {
                    switch (event.button) {
                         case 0:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.MOUSE_CLICK);
                              break;
                         case 1:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.CENTER_MOUSE_CLICK);
                              break;
                         case 2:
                              this.handleMouseEvent(event, OneSparkJs.InputEventTypes.RIGHT_MOUSE_CLICK);
                              break;
                    }
               };

               mouseCanvasEnterEvent = (event) => {
                    this.handleGenericEvent(event, OneSparkJs.InputEventTypes.MOUSE_CANVAS_ENTER);
               };

               mouseCanvasLeaveEvent = (event) => {
                    this.handleGenericEvent(event, OneSparkJs.InputEventTypes.MOUSE_CANVAS_LEAVE);
               };

               mouseScrollEvent = (event) => {
                    if (event.deltaY > 0) {
                         this.handleMouseEvent(event, OneSparkJs.InputEventTypes.MOUSE_SCROLL_DOWN);
                    } else {
                         this.handleMouseEvent(event, OneSparkJs.InputEventTypes.MOUSE_SCROLL_UP);
                    }
               };

               touchStartEvent = (event) => {
                    if (event.touches.length === 1) {
                         this.swipeStartX = event.touches[0].clientX;
                         this.swipeStartT = event.touches[0].clientY;
                    } else if (event.touches.length === 2) {
                         this.initialDistance = calculateDistance(event.touches[0], event.touches[1]);
                         this.this.initialAngle = calculateAngle(event.touches[0], event.touches[1]);
                    }
                    this.handleTouchEvent(event, OneSparkJs.InputEventTypes.TOUCH_START);
               };

               touchMoveEvent = (event) => {
                    if (event.touches.length === 2) {
                         if (this.initialDistance !== null) {
                              const currentDistance = calculateDistance(event.touches[0], event.touches[1]);
                              if (Math.abs(currentDistance - this.initialDistance) > this.pinchThreshold) {
                                   if (currentDistance > this.initialDistance) {
                                        this.handlePinchEvent(event, OneSparkJs.InputEventTypes.EXPAND);
                                   } else {
                                        this.handlePinchEvent(event, OneSparkJs.InputEventTypes.PINCH);
                                   }
                                   this.initialDistance = currentDistance;
                              }
                         }

                         if (this.initialAngle !== null) {
                              const currentAngle = calculateAngle(event.touches[0], event.touches[1]);
                              const angleDifference = currentAngle - this.initialAngle;

                              this.handleRotationEvent(event, OneSparkJs.InputEventTypes.ROTATE, angleDifference);

                              this.initialAngle = currentAngle;
                         }
                    }
                    this.handleTouchEvent(event, OneSparkJs.InputEventTypes.TOUCH_MOVE);
               };

               touchEndEvent = (event) => {
                    if (event.touches.length === 0 && this.initialDistance === null && this.initialAngle === null) {
                         if (this.doubleTapTimeout !== null) {
                              clearTimeout(this.doubleTapTimeout);
                              this.doubleTapTimeout = null;
                              this.handleTapEvent(event, OneSparkJs.InputEventTypes.DOUBLE_TAP);
                         } else {
                              this.tapTimeout = setTimeout(() => {
                                   this.handleTapEvent(event, OneSparkJs.InputEventTypes.TAP);
                                   this.doubleTapTimeout = setTimeout(() => {
                                        this.doubleTapTimeout = null;
                                   }, this.doubleTapThreshold);
                              }, this.tapThreshold);
                         }
                    }

                    if (this.swipeStartX !== null && this.swipeStartT !== null) {
                         const touch = event.changedTouches[0];
                         const diffX = touch.clientX - this.swipeStartX;
                         const diffY = touch.clientY - this.swipeStartT;

                         if (Math.abs(diffX) > Math.abs(diffY)) {
                              if (Math.abs(diffX) > this.this.swipeThreshold) {
                                   if (diffX > 0) {
                                        this.handleSwipeEvent(event, OneSparkJs.InputEventTypes.SWIP_RIGHT);
                                   } else {
                                        this.handleSwipeEvent(event, OneSparkJs.InputEventTypes.SWIP_LEFT);
                                   }
                              }
                         }
                    }
                    this.swipeStartX = null;
                    this.swipeStartT = null;
                    this.initialDistance = null;
                    this.initialAngle = null;

                    this.handleTouchEvent(event, OneSparkJs.InputEventTypes.TOUCH_END);
               };

               touchCancelEvent = (event) => {
                    this.handleTouchEvent(event, OneSparkJs.InputEventTypes.TOUCH_CANCEL);
               };

               deviceOrientationEvent = (event) => {
                    this.handleDeviceEvent(event, OneSparkJs.InputEventTypes.DEVICE_ORIENTATION);
               };

               deviceMotionEvent = (event) => {
                    this.handleDeviceEvent(event, OneSparkJs.InputEventTypes.DEVICE_MOTION);

                    if (!event.accelerationIncludingGravity) return;

                    const { x, y, z } = event.accelerationIncludingGravity;
                    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

                    if (accelerationMagnitude > this.shakeThreshold && Date.now() - this.lastShakeTime > this.shakeTimeout) {
                         this.lastShakeTime = Date.now();
                         this.handleShakeEvent();
                    }
               };

               visibilityChangeEvent = () => {
                    const hidden = document.hidden;
                    this.handleVisibilityChange(hidden);
               };

               handleGenericEvent = (event, eventType) => {

                    if (!this.handles[eventType]) return;

                    // Sort the event this.handles by priority
                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         // Call the event handle with the event object as a parameter
                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handleMouseEvent = (event, eventType) => {

                    if (!this.handles[eventType]) return;

                    // Sort the event this.handles by priority
                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {

                         const handle = this.handles[eventType][i];

                         // If the handle has specified a region, check if the event is inside the region
                         if (handle.region) {
                              if (
                                   event.clientX < handle.region.x1 ||
                                   event.clientX > handle.region.x2 ||
                                   event.clientY < handle.region.y1 ||
                                   event.clientY > handle.region.y2
                              ) {
                                   if (eventType == OneSparkJs.InputEventTypes.MOUSE_MOVE && (handle.isOver)) {
                                        handle.isOver = false;
                                        this.handleGenericEvent(event, OneSparkJs.InputEventTypes.MOUSE_LEAVE);
                                   }

                                   if (eventType == OneSparkJs.InputEventTypes.MOUSE_CLICK) {
                                        handle.isOver = false;
                                        this.handleGenericEvent(event, OneSparkJs.InputEventTypes.MOUSE_CLICK_OUT);
                                   }

                                   continue;
                              }
                         }

                         if (eventType == OneSparkJs.InputEventTypes.MOUSE_MOVE && (!handle.isOver)) {
                              handle.isOver = true;
                              this.handleGenericEvent(event, OneSparkJs.InputEventTypes.MOUSE_ENTER);
                         }

                         // Call the event handle with the event object as a parameter
                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handleTouchEvent = (event, eventType) => {
                    if (!this.handles[eventType]) return;

                    // Sort the event this.handles by priority
                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         // Check if any of the touch points are inside the region
                         let insideRegion = false;
                         for (let j = 0; j < event.touches.length; j++) {
                              const touch = event.touches[j];
                              if (
                                   touch.clientX >= handle.region.x1 &&
                                   touch.clientX <= handle.region.x2 &&
                                   touch.clientY >= handle.region.y1 &&
                                   touch.clientY <= handle.region.y2
                              ) {
                                   insideRegion = true;
                                   break;
                              }
                         }

                         // If none of the touch points are inside the region, skip this handle
                         if (!insideRegion) continue;

                         // Call the event handle with the event object as a parameter
                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }

               };

               handleTapEvent = (event, eventType) => {
                    if (!this.handles[eventType]) return;

                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         if (handle.region) {
                              if (
                                   event.clientX < handle.region.x1 ||
                                   event.clientX > handle.region.x2 ||
                                   event.clientY < handle.region.y1 ||
                                   event.clientY > handle.region.y2
                              ) {
                                   if (eventType == OneSparkJs.InputEventTypes.TAP) {
                                        handle.isOver = false;
                                        this.handleGenericEvent(event, OneSparkJs.InputEventTypes.TAP_OUT);
                                   }

                                   continue;
                              }
                         }

                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handleSwipeEvent = (event, eventType) => {
                    if (!this.handles[eventType]) return;

                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         if (handle.region) {
                              if (
                                   event.clientX < handle.region.x1 ||
                                   event.clientX > handle.region.x2 ||
                                   event.clientY < handle.region.y1 ||
                                   event.clientY > handle.region.y2
                              ) {
                                   continue;
                              }
                         }

                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handlePinchEvent = (event, eventType) => {
                    if (!this.handles[eventType]) return;

                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         if (handle.region) {
                              if (
                                   event.clientX < handle.region.x1 ||
                                   event.clientX > handle.region.x2 ||
                                   event.clientY < handle.region.y1 ||
                                   event.clientY > handle.region.y2
                              ) {
                                   continue;
                              }
                         }

                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handleRotationEvent = (event, eventType, angleDifference) => {
                    if (!this.handles[eventType]) return;

                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         if (handle.region) {
                              if (
                                   event.clientX < handle.region.x1 ||
                                   event.clientX > handle.region.x2 ||
                                   event.clientY < handle.region.y1 ||
                                   event.clientY > handle.region.y2
                              ) {
                                   continue;
                              }
                         }

                         const stopPropagation = handle.eventHandler(event, angleDifference);
                         if (stopPropagation) break;
                    }
               };

               handleDeviceEvent = (event, eventType) => {
                    if (!this.handles[eventType]) return;

                    this.handles[eventType].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[eventType].length; i++) {
                         const handle = this.handles[eventType][i];

                         const stopPropagation = handle.eventHandler(event);
                         if (stopPropagation) break;
                    }
               };

               handleShakeEvent = () => {
                    if (!this.handles[OneSparkJs.InputEventTypes.SHAKE]) return;

                    this.handles[OneSparkJs.InputEventTypes.SHAKE].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[OneSparkJs.InputEventTypes.SHAKE].length; i++) {
                         const handle = this.handles[OneSparkJs.InputEventTypes.SHAKE][i];

                         const stopPropagation = handle.eventHandler();
                         if (stopPropagation) break;
                    }
               };

               handleVisibilityChange = (hidden) => {
                    if (!this.handles[OneSparkJs.InputEventTypes.VISIBILITY_CHANGE]) return;

                    this.handles[OneSparkJs.InputEventTypes.VISIBILITY_CHANGE].sort((a, b) => a.priority - b.priority);

                    for (let i = 0; i < this.handles[OneSparkJs.InputEventTypes.VISIBILITY_CHANGE].length; i++) {
                         const handle = this.handles[OneSparkJs.InputEventTypes.VISIBILITY_CHANGE][i];

                         const stopPropagation = handle.eventHandler({ hidden });
                         if (stopPropagation) break;
                    }
               };

               attach = (eventType, source, eventHandler, priority = 100, region = null) => {
                    if (!this.handles[eventType]) this.handles[eventType] = [];

                    const h = {
                         source,
                         eventHandler,
                         priority: priority || 0,
                         isOver: false,
                         region
                    };

                    this.handles[eventType].push(h);

                    return h;
               };

               release = (source) => {
                    for (const eventType in this.handles) {
                         if (this.handles.hasOwnProperty(eventType)) {
                              this.handles[eventType] = this.handles[eventType].filter(
                                   (handle) => handle.source !== source
                              );
                         }
                    }
               };

               clear = (source) => {
                    this.handles = {};
               };

               calculateDistance = (touch1, touch2) => {
                    const diffX = touch2.clientX - touch1.clientX;
                    const diffY = touch2.clientY - touch1.clientY;
                    return Math.sqrt(diffX * diffX + diffY * diffY);
               };

               calculateAngle = (touch1, touch2) => {
                    const diffX = touch2.clientX - touch1.clientX;
                    const diffY = touch2.clientY - touch1.clientY;
                    return Math.atan2(diffY, diffX);
               };

          }

          const Ext = new Extension();

          return { Ext }
     })();

     // Public API
     global.$1S.IO = {
          Input: {
               EventType: OneSparkJs.InputEventTypes,
               attach: OneSparkJs.Inputs.Ext.attach,
               release: OneSparkJs.Inputs.Ext.release,
               clear: OneSparkJs.Inputs.Ext.clear
          },
          loadJSON: OneSparkJs.IO.loadJSON,
     };

})(typeof window !== 'undefined' ? window : global);
