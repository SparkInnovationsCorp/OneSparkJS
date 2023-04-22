((global) => {

     const OneSparkJs = {};

     OneSparkJs.UI = (() => {

          class UiType extends $1S.Renderer.Type.StagePropType {

               constructor(properties = {}) {
                    super(properties)

                    this.backColor = properties.backColor || 'transparent';
                    this.textColor = properties.textColor || 'black';
                    this.fontSize = properties.fontSize || 16;
                    this.fontFamily = properties.fontFamily || 'Arial';
                    this.textAlign = properties.textAlign || 'left';
                    this.isFocused = false;

                    if (this.onInit) this.onInit(properties);
               }

               registerProp = (instance, properties = {}, priority = 0) => {
                    if (!(instance instanceof UiType))
                         throw new Error("Not a UiType component.");

                    super.registerProp(instance, properties = {}, priority + 100000);
               }
          }

          class TextBoxControl extends UiType {

               onInit(properties) {
                    this.text = properties.text || '';
                    this.isEditable = properties.isEditable !== undefined ? properties.isEditable : true;
                    this.cursorPosition = 0;
                    this.cursorBlinkInterval = null;
                    this.cursorVisible = false;
                    this.registerEventHandlers();
               }

               registerEventHandlers() {

                    $1S.Renderer.Graphics.attachEvent('mousedown', (event) => {
                         if (this.isEditable && this.isInside(event.offsetX, event.offsetY)) {
                              this.isFocused = true;
                              this.setCursorPosition(event.offsetX);
                              this.startCursorBlinking();
                         } else {
                              this.isFocused = false;
                              this.stopCursorBlinking();
                         }
                    });

                    window.addEventListener('keydown', (event) => {
                         if (this.isEditable && this.isFocused) {
                              event.preventDefault();
                              switch (event.keyCode) {
                                   case 8: // Backspace
                                        if (this.cursorPosition > 0) {
                                             this.text = this.text.slice(0, this.cursorPosition - 1) + this.text.slice(this.cursorPosition);
                                             this.cursorPosition--;
                                        }
                                        break;
                                   case 46: // Delete
                                        if (this.cursorPosition < this.text.length) {
                                             this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(this.cursorPosition + 1);
                                        }
                                        break;
                                   case 37: // Left arrow
                                        if (this.cursorPosition > 0) {
                                             this.cursorPosition--;
                                        }
                                        break;
                                   case 39: // Right arrow
                                        if (this.cursorPosition < this.text.length) {
                                             this.cursorPosition++;
                                        }
                                        break;
                                   default:
                                        if (event.key.length === 1) {
                                             this.text = this.text.slice(0, this.cursorPosition) + event.key + this.text.slice(this.cursorPosition);
                                             this.cursorPosition++;
                                        }
                                        break;
                              }
                         }
                    });
               }

               isInside(x, y) {
                    var adjX = this.x - (this.width / 2);
                    var adjY = this.y - (this.height / 2);

                    return x >= adjX && x <= adjX + this.width && y >= adjY && y <= adjY + this.height;
               }

               setCursorPosition(x) {
                    const localX = x - this.x;

                    let minDistance = Infinity;
                    let nearestPosition = 0;

                    for (let i = 0; i <= this.text.length; i++) {
                         const distance = Math.abs(this.getXPositionForCursorPosition(i) - localX);
                         if (distance < minDistance) {
                              minDistance = distance;
                              nearestPosition = i;
                         }
                    }

                    this.cursorPosition = nearestPosition;
               }

               getXPositionForCursorPosition(position) {
                    const textBeforeCursor = this.text.slice(0, position);
                    const context = this.workContext;
                    const textWidth = context.measureText(textBeforeCursor).width;
                    return textWidth;
               }

               startCursorBlinking() {
                    this.cursorVisible = true;
                    this.cursorBlinkInterval = setInterval(() => {
                         this.cursorVisible = !this.cursorVisible;
                    }, 500);
               }

               stopCursorBlinking() {
                    this.isFocused = false;
                    clearInterval(this.cursorBlinkInterval);
                    this.cursorBlinkInterval = null;
                    this.cursorVisible = false;
               }

               onDraw(context) {

                    context.clearRect(0, 0, this.width, this.height);

                    context.fillStyle = this.backColor;
                    context.fillRect(0, 0, this.width, this.height);

                    context.font = `${this.fontSize}px ${this.fontFamily}`;
                    context.fillStyle = this.textColor;
                    context.textBaseline = "middle";

                    const metrics = context.measureText(this.text); 
                    const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

                    context.fillText(this.text, 0, this.height / 2);

                    if (this.isEditable && this.isFocused && this.cursorVisible) {
                         const cursorX = this.getXPositionForCursorPosition(this.cursorPosition);
                         const cursorY = this.height / 2 - fontHeight / 2;
                         context.beginPath();
                         context.moveTo(cursorX, cursorY);
                         context.lineTo(cursorX, cursorY + fontHeight);
                         context.stroke();
                    }

               }
          }

          class LabelControl extends UiType {

               onInit(properties) {
                    this.text = properties.text || '';
               }

               onDraw(context) {

                    context.clearRect(0, 0, this.width, this.height);

                    context.fillStyle = this.backColor;
                    context.fillRect(0, 0, this.width, this.height);

                    context.font = `${this.fontSize}px ${this.fontFamily}`;
                    context.fillStyle = this.textColor;
                    context.textBaseline = "middle";

                    if (this.textAlign == "center") {
                         const textWidth = context.measureText(this.text).width;
                         context.fillText(this.text, (this.width - textWidth) / 2, this.height / 2, this.width);
                    }
                    else if (this.textAlign == "right")
                    {
                         const textWidth = context.measureText(this.text).width;
                         context.fillText(this.text, this.width - textWidth, this.height / 2, this.width);
                    }
                    else
                         context.fillText(this.text, 0, this.height / 2, this.width);

               }
          }

          class ButtonControl extends UiType {

               onInit(properties) {
                    this.text = properties.text || '';
                    this.onClickHandler = properties.onClick || null;
                    this.state = null;
                    this.stateIsDown = false;

                    this.registerEventHandlers();
               }

               registerEventHandlers() {

                    $1S.Renderer.Graphics.attachEvent('mousemove', (event) => {
                         if (this.isInside(event.offsetX, event.offsetY)) {
                              $1S.Renderer.Graphics.getStyle().cursor = "pointer";
                         } else {
                              $1S.Renderer.Graphics.getStyle().cursor = "default";
                         }
                    });

                    $1S.Renderer.Graphics.attachEvent('mousedown', (event) => {
                         if (this.isInside(event.offsetX, event.offsetY)) {
                              this.state = "down";
                              if (this.onClickHandler)
                                   this.onClickHandler(this);
                         }
                    });

                    $1S.Renderer.Graphics.attachEvent('mouseup', (event) => {
                         if (this.stateIsDown)
                              this.state = "up";
                    });

               }

               isInside(x, y) {
                    var adjX = this.x - (this.width / 2);
                    var adjY = this.y - (this.height / 2);

                    return x >= adjX && x <= adjX + this.width && y >= adjY && y <= adjY + this.height;
               }

               onDraw(context) {

                    context.clearRect(0, 0, this.width, this.height);

                    context.fillStyle = this.backColor;
                    context.fillRect(0, 0, this.width, this.height);

                    context.font = `${this.fontSize}px ${this.fontFamily}`;
                    context.fillStyle = this.textColor;
                    context.textBaseline = "middle";

                    if (this.state == "down") {
                         this.x += 2;
                         this.y += 2;
                         this.state = null;
                         this.stateIsDown = true;
                    }
                    else if (this.state == "up") {
                         this.x -= 2;
                         this.y -= 2;
                         this.state = null;
                         this.stateIsDown = false;
                    }

                    const textWidth = context.measureText(this.text).width;

                    context.fillText(this.text, (this.width - textWidth) / 2, this.height / 2, this.width);

               }
          }

          class MoveToModifer {
               constructor(target) {
                    this.target = target;
                    this.speed = 0; // current movement speed
                    this.milliSeconds = 0; // time to reach target position
                    this.startX = 0; // starting x position
                    this.startY = 0; // starting y position
                    this.targetX = 0; // target x position
                    this.targetY = 0; // target y position
                    this.callback = null; // callback function to be called when move is complete
               }

               onRender(context) {
                    //does nothing
               }

               moveToPosition(x, y, ms, callback) {
                    this.startX = this.target.x;
                    this.startY = this.target.y;
                    this.targetX = x;
                    this.targetY = y;
                    this.milliSeconds = ms;
                    const distance = Math.sqrt((x - this.target.x) ** 2 + (y - this.target.y) ** 2);
                    this.speed = distance / ms;
                    this.callback = callback;
               }

               onTick(timeStamp, deltaTime) {

                    if (this.target.x == this.targetX && this.target.y == this.targetY)
                         return;

                    const elapsedTime = deltaTime;
                    const deltaX = this.targetX - this.target.x;
                    const deltaY = this.targetY - this.target.y;
                    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

                    if (distance > 0) {
                         const moveDistance = this.speed * elapsedTime;
                         if (moveDistance >= distance) {
                              this.target.x = this.targetX;
                              this.target.y = this.targetY;
                              this.speed = 0;
                              if (this.callback) {
                                   this.callback();
                              }
                         } else {
                              const moveX = (deltaX / distance) * moveDistance;
                              const moveY = (deltaY / distance) * moveDistance;
                              this.target.x += moveX;
                              this.target.y += moveY;
                         }
                    }
               }
          }

          class FadeModifer {
               constructor(target) {
                    this.target = target;
                    this.callback = null; // callback function to be called when fade is complete
                    this.alpha = 0; // current opacity value
                    this.targetAlpha = 0; // target opacity value
                    this.milliSeconds = 0; // time to complete fade
                    this.inProgress = false;
               }

               fadeIn(ms, callback = null) {
                    this.milliSeconds = ms;
                    this.callback = callback;
                    this.targetAlpha = 1;
                    this.inProgress = true;
               }

               fadeOut(ms, callback = null) {
                    this.milliSeconds = ms;
                    this.callback = callback;
                    this.targetAlpha = 0;
                    this.inProgress = true;
               }

               onRender(context) {
                    context.globalAlpha = this.alpha;
               }

               onTick(timeStamp, deltaTime) {

                    if (this.inProgress) {

                         const alphaDiff = this.targetAlpha - this.alpha;
                         const alphaStep = alphaDiff * (deltaTime / this.milliSeconds);
                         this.alpha += alphaStep;

                         if (alpha < 0) this.alpha = 0;
                         if (alpha > 1) this.alpha = 1;

                         if ((this.targetAlpha == 0 && this.alpha == 0) ||
                              (this.targetAlpha == 1 && this.alpha == 1))
                         {
                              this.inProgress = false;
                              if (this.callback)
                                   this.callback();
                         }

                    }

               }
          }

          class Extension extends $1S.Application.ExtensionType {

               constructor() {
                    super(0);
               };

               onTick = (timeStamp, deltaTime) => {

               }


          }

          const Ext = new Extension();

          return {
               UiType,
               MoveToModifer,
               LabelControl,
               TextBoxControl,
               ButtonControl,
               Ext
          }
     })();

     // Public API
     global.$1S.UI = {
          UiType: OneSparkJs.UI.UiType,
          Animate: {
               moveTo: OneSparkJs.UI.MoveToModifer,
               fade: OneSparkJs.UI.FadeModifer
          },
          Controls: {
               TextBox: OneSparkJs.UI.TextBoxControl,
               Button: OneSparkJs.UI.ButtonControl,
               Label: OneSparkJs.UI.LabelControl
          }
     };



})(typeof window !== 'undefined' ? window : global);
