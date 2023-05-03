((global) => {

     const OneSparkJs = {};

     //Rederer module
     OneSparkJs.Renderer = (() => {

          const AlignOnEnum = {
               Center: 0,
               UpperLeft: 1,
               UpperRight: 2,
               LowerLeft: 3,
               LowerRight: 4
          }

          const SortByEnum = {
               ByPriority: 0,
               ByDepth: 1
          }

          const SortByTypes = {
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

          const AnchorTypeEnum = {
               None: 0,
               Absolute: 1,
               Relative: 2,
               Centered: 3
          };

          class TransformType {

               constructor(parent, child, properties) {
                    this.parent = parent;

                    this.child = child;
                    this.childRegion = this.child.getRegion();

                    if (this.onInit) this.onInit(properties);
               }

               raiseTickEvent(timeStamp, deltaTime) {

                    if (this.onTick)
                         this.onTick(timeStamp, deltaTime);

                    this.child.raiseTickEvent(timeStamp, deltaTime);
               }

               raiseRenderEvent(context) {
                    this.child.raiseRenderEvent(context);
               }

               raiseResizeEvent(w, h) {

                    if (this.onResize)
                         this.onResize(w, h);

                    this.child.raiseRenderEvent(w, h);
               }

               raiseDisposeEvent() {
                    this.child.raiseDisposeEvent();
               }

               raiseShowStageEvent() {
                    this.child.raiseShowStageEvent();
               }

               raiseHideStageEvent() {
                    this.child.raiseHideStageEvent();
               }

          }

          class AnchorTransformType extends TransformType {

               onInit(properties) {
                    this.anchorLeft = properties.anchorLeft || AnchorTypeEnum.None;
                    this.anchorLeftValue = properties.anchorLeftValue || 0;
                    this.anchorRight = properties.anchorRight || AnchorTypeEnum.None;
                    this.anchorRightValue = properties.anchorRightValue || 0;
                    this.anchorTop = properties.anchorTop || AnchorTypeEnum.None;
                    this.anchorTopValue = properties.anchorTopValue || 0;
                    this.anchorBottom = properties.anchorBottom || AnchorTypeEnum.None;
                    this.anchorBottomValue = properties.anchorBottomValue || 0;

                    console.log(properties);

                    this.updateRegion();
               }

               onResize() {
                    this.updateRegion(); 
               }

               updateRegion() {
                    //left
                    if (this.anchorLeft == AnchorTypeEnum.Absolute) {
                         this.childRegion.x1 = this.anchorLeftValue;

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + this.child.width;
                    }
                    else if (this.anchorLeft == AnchorTypeEnum.Relative) {
                         this.childRegion.x1 = this.parent.width * (this.anchorLeftValue / 100);

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + this.child.width;
                    }
                    else if (this.anchorLeft == AnchorTypeEnum.Centered) {
                         this.childRegion.x1 = ((this.parent.width / 2) - (this.child.width / 2)) - this.anchorLeftValue;

                         if (this.anchorRight == AnchorTypeEnum.None)
                              this.childRegion.x2 = this.childRegion.x1 + this.child.width;
                    }

                    //right
                    if (this.anchorRight == AnchorTypeEnum.Absolute) {
                         this.childRegion.x2 = this.parent.width - this.anchorRightValue;

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - this.child.width;
                    }
                    else if (this.anchorRight == AnchorTypeEnum.Relative) {
                         this.childRegion.x2 = this.parent.width - (this.parent.width * (this.anchorRightValue / 100));

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - this.child.width;
                    }
                    else if (this.anchorRight == AnchorTypeEnum.Centered) {
                         this.childRegion.x2 = (this.parent.width - ((this.parent.width / 2) - (this.child.width / 2))) + this.anchorRightValue;

                         if (this.anchorLeft == AnchorTypeEnum.None)
                              this.childRegion.x1 = this.childRegion.x2 - this.child.width;
                    }

                    //top
                    if (this.anchorTop == AnchorTypeEnum.Absolute) {

                         console.log("hit here");

                         this.childRegion.y1 = this.anchorTopValue;
                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + this.child.height;
                         }
                    } else if (this.anchorTop == AnchorTypeEnum.Relative) {
                         this.childRegion.y1 = this.parent.height * (this.anchorTopValue / 100);
                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + this.child.height;
                         }
                    } else if (this.anchorTop == AnchorTypeEnum.Centered) {
                         this.childRegion.y1 = ((this.parent.height / 2) - (this.child.height / 2)) - this.anchorTopValue;
                         if (this.anchorBottom == AnchorTypeEnum.None) {
                              this.childRegion.y2 = this.childRegion.y1 + this.child.height;
                         }
                    }

                    //bottom
                    if (this.anchorBottom == AnchorTypeEnum.Absolute) {
                         this.childRegion.y2 = this.parent.height - this.anchorBottomValue;
                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - this.child.height;
                         }
                    } else if (this.anchorBottom == AnchorTypeEnum.Relative) {
                         this.childRegion.y2 = this.parent.height - (this.parent.height * (this.anchorBottomValue / 100));
                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - this.child.height;
                         }
                    } else if (this.anchorBottom == AnchorTypeEnum.Centered) {
                         this.childRegion.y2 = (this.parent.height - ((this.parent.height / 2) - (this.child.height / 2))) + this.anchorBottomValue;
                         if (this.anchorTop == AnchorTypeEnum.None) {
                              this.childRegion.y1 = this.childRegion.y2 - this.child.height;
                         }
                    }

                    this.child.setRegion(this.childRegion);

                    console.log(this.childRegion, this.child);
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

                    if ((!(instance instanceof StagePropType)) && !(instance instanceof TransformType))
                         throw new Error("Not a StagePropType or TransformType component.");

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

               raiseShowStageEvent() {

                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++) {
                              if (this.stageProps[i].Instance.raiseShowStageEvent)
                                   this.stageProps[i].Instance.raiseShowStageEvent();

                         }
                    }
                    if (this.onShowStage)
                         this.onShowStage();
               }

               raiseHideStageEvent() {
                    if (this.stageProps.length > 0) {
                         for (var i = 0; i < this.stageProps.length; i++)
                              if (this.stageProps[i].Instance.raiseHideStageEvent)
                                   this.stageProps[i].Instance.raiseHideStageEvent();
                    }
                    if (this.onHideStage)
                         this.onHideStage();
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

               getRegion() {
                    switch (this.alignOn) {
                         case AlignOnEnum.Center:
                             return { x1: this.x - this.width / 2, y1: this.y - this.height / 2, x2: this.x + this.width / 2, y2: this.y + this.height / 2 };
                              break;
                         case AlignOnEnum.UpperLeft:
                              return { x1: this.x, y1: this.y, x2: this.x + this.width, y2: this.y + this.height };
                              break;
                         case AlignOnEnum.UpperRight:
                              return { x1: this.x - this.width, y1: this.y, x2: this.x, y2: this.y + this.height };
                              break;
                         case AlignOnEnum.LowerLeft:
                              return { x1: this.x, y1: this.y - this.height, x2: this.x + this.width, y2: this.y };
                              break;
                         case AlignOnEnum.LowerRight:
                              return { x1: this.x - this.width, y1: this.y - this.height, x2: this.x, y2: this.y };
                              break;
                         default:
                              return { x1: this.x, y1: this.y, x2: this.x + this.width, y2: this.y + this.height };
                              break;
                    }
               }

               setRegion(region) {
                    this.width = Math.abs(region.x2 - region.x1);
                    this.height = Math.abs(region.y2 - region.y1);

                    switch (this.alignOn) {
                         case AlignOnEnum.Center:
                              this.x = (region.x1 + region.x2) / 2;
                              this.y = (region.y1 + region.y2) / 2;
                              break;
                         case AlignOnEnum.UpperLeft:
                              this.x = region.x1;
                              this.y = region.y1;
                              break;
                         case AlignOnEnum.UpperRight:
                              this.x = region.x2;
                              this.y = region.y1;
                              break;
                         case AlignOnEnum.LowerLeft:
                              this.x = region.x1;
                              this.y = region.y2;
                              break;
                         case AlignOnEnum.LowerRight:
                              this.x = region.x2;
                              this.y = region.y2;
                              break;
                         default:
                              this.x = region.x1;
                              this.y = region.y1;
                              break;
                    }
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

                    this.activeLoop = null;
                    this.spriteLoop = {};

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

               loadGroup(loopName) {
                    if (!loopName)
                         throw new Error("A sprite group is required.")

                    const loop = $1S.Assets.getSpriteLoop(loopName);

                    if (!loop)
                         throw new Error(`Sprite group ${loopName} not found.`)

                    this.adjustSize(loop);

                    this.spriteLoop[loopName] = loop;

                    if (!this.activeLoop) {
                         this.activeLoop = loop;
                    };
               }

               loadImage(imageName, frameCount) {
                    if (!imageName)
                         throw new Error("An image is required.")

                    const image = $1S.Assets.getImage(imageName);

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

                    this.spriteLoop[imageName] = group;

                    if (!this.activeLoop) {
                         this.activeLoop = group;
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

                    var group = this.spriteLoop[groupName];

                    if (!group) {
                         this.loadGroup(groupName)
                         group = this.spriteLoop[groupName];
                    }

                    this.frame = 0;
                    this.activeLoop = group;
               }

               onTick(timeStamp, deltaTime) {
                    if (this.activeLoop && this.isVisible && this.activeLoop.clipPaths.length > 1) {
                         const timeSinceLastFrameUpdate = timeStamp - this.lastFrameUpdateTime;
                         if (timeSinceLastFrameUpdate >= this.frameTime) {
                              this.lastFrameUpdateTime = timeStamp;
                              this.frame++;
                              if (this.frame >= this.activeLoop.clipPaths.length) {
                                   this.frame = 0;
                              }
                         }
                    }
               }

               onDraw(context) {
                    if (this.activeLoop && this.isVisible && this.frame != this.renderedFrame) {
                         const groupCanvas = this.activeLoop.clipPaths[this.frame].Canvas;
                         const groupContext = this.activeLoop.clipPaths[this.frame].CanvasContext;

                         context.clearRect(0, 0, this.workCanvas.width, this.workCanvas.height);
                         context.drawImage(groupCanvas, 0, 0);
                         this.renderedFrame = this.frame;
                    }
               }

          }

          class TilesetPropType extends StagePropType {

               constructor(layoutName, properties = {}) {
                    super(properties);

                    if (!layoutName)
                         throw new Error(`Layout name invalid.`)

                    this.layoutName = layoutName;

                    this.tiles = [];

                    this.initialize();
               }

               initialize() {
                    var layout = $1S.Assets.getTileset(this.layoutName);

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

          class Extension extends $1S.Application.ExtensionType {

               stages = {};
               activeStageName = null;

               constructor() {
                    super(0);
               }

               onLoad = (appPath, properties, oncomplete) => {
                    if (properties.canvas) {
                         OneSparkJs.Graphics.initialize(properties.canvas, properties.fullWindow);
                    }
                    oncomplete()
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
                         this.stages[this.activeStageName].raiseHideStageEvent();
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
                         this.stages[this.activeStageName].Instance.raiseHideStageEvent();
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

                    this.stages[this.activeStageName].Instance.raiseShowStageEvent();

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

          return { AlignOnEnum, StageType, SortByEnum, SortByTypes, StagePropType, SpritePropType, TilesetPropType, AnchorTypeEnum, AnchorTransformType, Ext }
     })();

     // Graphics module
     OneSparkJs.Graphics = (() => {
          let canvas = null;
          let context = null;
          let workCanvas = null;
          let workContext = null;
          let fullWindow = false;

          const initialize = (canvasId, useFullWindow) => {
               canvas = document.getElementById(canvasId);

               if (useFullWindow) {
                    fullWindow = true;
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
               }

               context = canvas.getContext("2d");
               workCanvas = document.createElement('canvas');
               workCanvas.width = canvas.width;
               workCanvas.height = canvas.height;
               workContext = workCanvas.getContext('2d');

               // Add an event listener to detect canvas resizing
               window.addEventListener('resize', () => {

                    if (fullWindow) {
                         canvas.width = window.innerWidth;
                         canvas.height = window.innerHeight;
                         context = canvas.getContext("2d");
                         workCanvas = document.createElement('canvas');
                         workCanvas.width = canvas.width;
                         workCanvas.height = canvas.height;
                         workContext = workCanvas.getContext('2d');
                    }

                    context = canvas.getContext("2d");
                    workCanvas = document.createElement('canvas');
                    workCanvas.width = canvas.width;
                    workCanvas.height = canvas.height;
                    workContext = workCanvas.getContext('2d');
                    OneSparkJs.Renderer.Ext.raiseResizeEvent(canvas.width, canvas.height);
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

          //still experimental
          const setFullScreen = (fullScreenMode) => {

               if (fullScreenMode) {
                    // Enter full screen mode
                    if (canvas.requestFullscreen) {
                         canvas.requestFullscreen();
                    } else if (canvas.webkitRequestFullscreen) {
                         canvas.webkitRequestFullscreen();
                    } else if (canvas.msRequestFullscreen) {
                         canvas.msRequestFullscreen();
                    }

                    canvas.width = screen.width;
                    canvas.height = screen.height;
                    context = canvas.getContext("2d");
                    workCanvas = document.createElement('canvas');
                    workCanvas.width = canvas.width;
                    workCanvas.height = canvas.height;
                    workContext = workCanvas.getContext('2d');

               } else {

                    try {
                         // Exit full screen mode
                         if (document.exitFullscreen) {
                              document.exitFullscreen();
                         } else if (document.webkitExitFullscreen) {
                              document.webkitExitFullscreen();
                         } else if (document.msExitFullscreen) {
                              document.msExitFullscreen();
                         }
                    } catch { }

                    canvas.width = originalWidth;
                    canvas.height = originalHeight;
                    context = canvas.getContext("2d");
                    workCanvas = document.createElement('canvas');
                    workCanvas.width = canvas.width;
                    workCanvas.height = canvas.height;
                    workContext = workCanvas.getContext('2d');

               }
          }

          return {
               initialize,
               setFullScreen,
               getContext,
               publish,
               getState,
               setState,
               getStyle,
               getSize
          }

     })();

     // Public API
     global.$1S.Renderer = {
          Type: {
               AlignOn: OneSparkJs.Renderer.AlignOnEnum,
               SortBy: OneSparkJs.Renderer.SortByEnum,
               StageType: OneSparkJs.Renderer.StageType,
               StagePropType: OneSparkJs.Renderer.StagePropType,
               SpriteType: OneSparkJs.Renderer.SpritePropType,
               TilesetType: OneSparkJs.Renderer.TilesetPropType,
               Transforms: {
                    AnchorType: OneSparkJs.Renderer.AnchorTypeEnum,
                    AnchorTransform: OneSparkJs.Renderer.AnchorTransformType
               }
          },
          Graphics: {
               setState: OneSparkJs.Graphics.setState,
               getState: OneSparkJs.Graphics.getState,
               getContext: OneSparkJs.Graphics.getContext,
               getSize: OneSparkJs.Graphics.getSize,
               getStyle: OneSparkJs.Graphics.getStyle,
               publish: OneSparkJs.Graphics.publish,
               setFullScreen: OneSparkJs.Graphics.setFullScreen
          },
          register: OneSparkJs.Renderer.Ext.register,
          render: OneSparkJs.Renderer.Ext.render,
          destroy: OneSparkJs.Renderer.Ext.destroy,
          get: OneSparkJs.Renderer.Ext.get,
          getActiveName: OneSparkJs.Renderer.Ext.getActiveName,
          switchTo: OneSparkJs.Renderer.Ext.switchTo
     };

})(typeof window !== 'undefined' ? window : global);
