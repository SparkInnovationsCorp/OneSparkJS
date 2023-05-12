class AspectRatioContainer extends $1S.Renderer.Type.Render2D.Prop {
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

          if (canvasAspectRatio > 1) {
               // The parent is in landscape mode
               this.width = this.parent.width;
               this.height = this.parent.width / aspectRatio;
               this.orientation.x = 0;
               this.orientation.y = (this.parent.height - this.height) / 2;

               if (this.parent.changeOrientation)
                    this.parent.changeOrientation("landscape", this.width, this.height);

          } else {
               // The parent is in portrait mode
               this.width = this.parent.height / aspectRatio;
               this.height = this.parent.height;
               this.orientation.x = (this.parent.width - this.width) / 2;
               this.orientation.y = 0;

               if (this.parent.changeOrientation)
                    this.parent.changeOrientation("portrait", this.width, this.height);
          }

          this.workCanvas = document.createElement("canvas");
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext("2d");
     }
}

$1S.registerType(AspectRatioContainer, "AspectRatioContainer");
