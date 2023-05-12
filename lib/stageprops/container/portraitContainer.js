class PortraitContainer extends $1S.Renderer.Type.Render2D.Prop {

     //This stage prop is used to force a vertical/portrait stage similar to a mobile phone.  It will resize itself to the center of the screen.

     onInit(properties) {
          this.aspectRatio = properties.aspectRatio || (9 / 16);
          this.backgroundColor = properties.backgroundColor || "transparent";
          this.orientation.alignment = $1S.Renderer.Type.Render2D.AlignOn.UpperLeft;

          this.parent = properties.parent;

          if (!this.parent)
               throw new Error("A parent stage is required for this prop.");

          this.setSize();
     }

     onShowStage(properties) {


     }

     onHideStage(properties) {


     }

     onTick(timeStamp, deltaTime) {

     }

     onDraw(context) {
          context.clearRect(0, 0, this.width, this.height);
          context.fillStyle = this.backgroundColor;
          context.fillRect(0, 0, this.width, this.height);
     }

     onResize(parentWidth, parentHeight) {
          this.setSize();
     }

     onDestroy() {

     }

     setSize() {
          const aspectRatio = this.aspectRatio;
          const canvasAspectRatio = this.parent.width / this.parent.height;

          if (canvasAspectRatio > aspectRatio) {
               // The canvas is wider than the desired aspect ratio, so calculate the width based on height
               this.width = this.parent.height * aspectRatio;
               this.height = this.parent.height;
               this.orientation.x = (this.parent.width - this.width) / 2;
               this.orientation.y = 0;
          } else {
               this.orientation.x = 0;
               this.orientation.y = 0;
               this.width = this.parent.width;
               this.height = this.parent.height;
          }

          this.workCanvas = document.createElement('canvas');
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')
     }

}

$1S.registerType(PortraitContainer, "PortraitContainer");









