class Demo extends $1S.Renderer.Type.StageType {

     onInit(properties) {
          this.centerX = this.width / 2;
          this.centerY = this.height / 2;
          this.initializeControls();
          this.frame = 0;
          this.framesPerSecond = 12;
          this.frameTime = 1000 / this.framesPerSecond;
          this.group = $1S.Renderer.Graphics.getImageGroup("walk-forward");
          this.lastFrameUpdateTime = 0;
     }

     initializeControls() {
          //draw image on imageCanvas to the workCanvas at centerX and centerY
     }

     startButtonClick(e) {

     }

     onUpdate(timeStamp, deltaTime) {
          const timeSinceLastFrameUpdate = timeStamp - this.lastFrameUpdateTime;
          if (timeSinceLastFrameUpdate >= this.frameTime) {
               this.lastFrameUpdateTime = timeStamp;
               this.frame++;
               if (this.frame >= 4) {
                    this.frame = 0;
               }
          }
     }

     onDraw(context) {

          context.fillStyle = 'black';
          context.fillRect(0, 0, this.width, this.height);

          const image = $1S.Renderer.Graphics.getImage("logo");
          const imageCanvas = image.Canvas;
          const imageContext = image.CanvasContext;

          const x = (this.width / 2) - (imageCanvas.width / 2);
          const y = (this.height / 2) - (imageCanvas.height / 2);
          context.drawImage(imageCanvas, x, y);

          const groupCanvas = this.group.clipPaths[this.frame].Canvas;
          const groupContext = this.group.clipPaths[this.frame].CanvasContext;
          context.drawImage(groupCanvas, x, 0);

     }

}

$1S.registerType(Demo, "Demo");









