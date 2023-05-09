const PortraitContainer = await $1S.import("PortraitContainer", "../container/portrait.js");

class Start extends $1S.Renderer.Type.Stage {

     onInit(properties) {
          this.splash == null;

          this.loadSplash();

          this.container = new PortraitContainer({ parent: this });
          this.registerProp(this.container, {}, 10000);

          const AnchorTransform = $1S.Renderer.Type.Render2D.Transform.AnchorTransform;
          const AnchorType = $1S.Renderer.Type.Render2D.Transform.AnchorType;

          console.log("Start onInit");

          this.container.registerProp(new AnchorTransform(this.container,
               new $1S.Renderer.Type.Render2D.Sprite({ imageName: "logo", alignment: $1S.Renderer.Type.Render2D.AlignOn.Center }),
               {
                    keepAspectRatio: true,

                    anchorLeft: AnchorType.Relative,
                    anchorLeftValue: 10,

                    anchorRight: AnchorType.Relative,
                    anchorRightValue: 10,

                    anchorTop: AnchorType.Absolute,
                    anchorTopValue: 50

               }), {}, 10000);

     }

     onShowStage(properties) {

          //this.registerProp(new AnchorTransform(this,
          //     new $1S.Renderer.Type.SpriteType({ imageName: "ui-01-sprite-12" }),
          //     {
          //          anchorLeft: AnchorType.Centered,
          //          anchorRight: AnchorType.Centered,
          //          anchorTop: AnchorType.Absolute,
          //          anchorTopValue: 600
          //     }), {}, 10000);


     }

     onTick(timeStamp, deltaTime) {

     }

     onDraw(context) {

          context.clearRect(0, 0, this.width, this.height);

          context.fillStyle = 'white';
          context.fillRect(0, 0, this.width, this.height);

          this.splash.draw(context);
     }

     onResize() {
          this.loadSplash();
     }

     onDestroy() {

     }

     loadSplash() {
          var splash = $1S.Assets.getImage("splash");

          const splashCanvas = splash.Canvas;
          const scaleX = this.width / splashCanvas.width;
          const scaleY = this.height / splashCanvas.height;
          const scale = Math.max(scaleX, scaleY);
          const offsetX = (this.width - splashCanvas.width * scale) / 2;
          const offsetY = (this.height - splashCanvas.height * scale) / 2;

          this.splash = {
               image: splash,
               canvas: splashCanvas,
               scale: scale,
               offsetX: offsetX,
               offsetY: offsetY,
               draw: function (context) {
                    context.drawImage(
                         this.canvas,
                         0,
                         0,
                         this.canvas.width,
                         this.canvas.height,
                         this.offsetX,
                         this.offsetY,
                         this.canvas.width * this.scale,
                         this.canvas.height * this.scale
                    )
               }
          }
     }

}

$1S.registerType(Start, "Start");









