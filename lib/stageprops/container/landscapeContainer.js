class LandscapeContainer extends $1S.Renderer.Type.Render2D.Prop {

     //This prop is used to create a horizontal/landscape stage similar to a widescreen monitor and automatically resizes itself to the center of the screen.

     onInit(properties) {
          this.aspectRatio = properties.aspectRatio || (16 / 9);
          this.backgroundColor = properties.backgroundColor || "transparent";
          this.orientation.alignment = $1S.Renderer.Type.Render2D.AlignOn.UpperLeft;

          this.parent = properties.parent;

          if (!this.parent)
               throw new Error("A parent stage is required for this prop.");

          this.setSize();
     }

     onShowStage(properties) {
          this.setSize();
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
          this.parent = null;
     }

     setSize() {
          const aspectRatio = this.aspectRatio;
          const canvasAspectRatio = this.parent.width / this.parent.height;

          if (canvasAspectRatio < aspectRatio) {
               // The canvas is taller than the desired aspect ratio, so calculate the height based on width
               this.width = this.parent.width;
               this.height = this.parent.width / aspectRatio;
               this.orientation.x = 0;
               this.orientation.y = (this.parent.height - this.height) / 2;
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

$1S.registerType(LandscapeContainer, "LandscapeContainer");
