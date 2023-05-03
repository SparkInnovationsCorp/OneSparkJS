class Laser extends $1S.Physics.Types.PhysicsBoundType {

     onInit(properties) {
          this.width = 20;
          this.height = 20;
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')
          this.collisionBorder = $1S.Physics.Collisions.createHexagon(this.width, this.height);
          this.updateDrawing = true;
     }

     destroy() {
          const stage = $1S.Renderer.get().Instance;
          stage.destroyProp(this.id);
     }

     onTick(timeStamp, deltaTime) {
          if (this.isOffScreen()) {
               this.destroy();
          }
     }

     onDraw(context) {

          if (this.updateDrawing) {
               context.translate(0, 0);
               context.beginPath();
               context.moveTo(0, this.height / 2);
               context.lineTo(this.width, this.height / 2);
               context.closePath();
               context.strokeStyle = '#ffffff';
               context.lineWidth = 2;
               context.stroke();
               this.updateDrawing = false;
          }

     }

     isOffScreen(obj) {

          const r = this.getRegion();

          // Calculate the edges of the shape
          const leftEdge = r.x1;
          const rightEdge = r.x2;
          const topEdge = r.y1;
          const bottomEdge = r.y2;

          // Check if any of the edges are outside the canvas bounds
          const isOffLeft = rightEdge < 0;
          const isOffRight = leftEdge > this.screenWidth;
          const isOffTop = bottomEdge < 0;
          const isOffBottom = topEdge > this.screenHeight;

          // Return true if all edges are offscreen, false otherwise
          return isOffLeft || isOffRight || isOffTop || isOffBottom;
     }

}

$1S.registerType(await Laser, "Laser");



