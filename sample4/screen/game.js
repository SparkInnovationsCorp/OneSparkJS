const IsometricGrid = await $1S.import("IsometricGrid", "../lib/isometricGrid.js");

class Game extends $1S.Renderer.Type.Stage {

     onInit(properties) {
          const AnchorTransform = $1S.Renderer.Type.Render2D.Transform.AnchorTransform;
          const AnchorType = $1S.Renderer.Type.Render2D.Transform.AnchorType;
          this.container = new IsometricGrid({ width: this.width, height: this.height, alignment: $1S.Renderer.Type.Render2D.AlignOn.UpperLeft });
          this.registerProp(this.container, {}, 10000);


          this.lblTitle = new $1S.UI.Controls.Label(
               {
                    width: this.width - 20,
                    height: 40,
                    fontFamily: 'Arial',
                    fontSize: 30,
                    textAlign: "right",
                    textColor: "white",
                    text: "How To 3D Render WITHOUT WebGl"
               });

          this.registerProp(new AnchorTransform(this, this.lblTitle,
               {
                    anchorRight: AnchorType.Absolute,
                    anchorRightValue: 20,
                    anchorTop: AnchorType.Absolute,
                    anchorTopValue: 20
               }), {}, 10000);
     }


     //fires when the stage this is on is shown
     onShowStage(properties) {
     }

     //fires when this stage is hidden
     onHideStage(properties) {
     }

     //runs every clock tick
     onTick(timeStamp, deltaTime) {
     }

     //draws our page onto its local canvas context
     onDraw(context) {
          context.clearRect(0, 0, this.width, this.height);

          context.fillStyle = 'black';
          context.fillRect(0, 0, this.width, this.height);
     }

     onResize(w,h) {
          this.container.width = w;
          this.container.height = h;
     }

     onDestroy() {

     }

}

$1S.registerType(Game, "Game");





