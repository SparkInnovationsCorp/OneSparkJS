class Logo extends $1S.Renderer.Type.StagePropType {

     onInit(properties) {
          this.width = 600;
          this.height = 320;
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')

          this.isDrawn = true;
     }

     onDraw(context) {

          this.workContext.fillStyle = 'black';
          this.workContext.fillRect(0, 0, this.width, this.height);

          const image = $1S.Assets.getImage("logo");
          const imageCanvas = image.Canvas;
          const imageContext = image.CanvasContext;

          const x = (this.width / 2) - (imageCanvas.width / 2);
          const y = (this.height / 2) - (imageCanvas.height / 2);
          this.workContext.drawImage(imageCanvas, x, y);

     }

}

$1S.registerType(await Logo, "Logo");



