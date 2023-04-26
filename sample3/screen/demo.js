const Ball = await $1S.import("Ball", "../props/ball.js");

class Demo extends $1S.Renderer.Type.StageType {

     onInit(properties) {

          this.registerProp(
               new Ball(
                    {
                         x: 100,
                         y: 100,
                         vectorX: .05,
                         vectorY: .05,
                         color: "blue",
                         width: 20,
                         height: 20,
                         takesCollisions: true,
                         givesCollisions: true
                    }), {}, 100);

          this.registerProp(
               new Ball(
                    {
                         x: 200,
                         y: 200,
                         vectorX: 0.05,
                         vectorY: 0.5,
                         color: "red",
                         width: 20,
                         height: 20,
                         takesCollisions: true,
                         givesCollisions: true
                    }), {}, 100);

          this.registerProp(
               new Ball(
                    {
                         x: 300,
                         y: 300,
                         vectorX: 0.8,
                         vectorY: 0.5,
                         color: "green",
                         width: 20,
                         height: 20,
                         takesCollisions: true,
                         givesCollisions: true
                    }), {}, 100);


     }


     onUpdate(timeStamp, deltaTime) {
     }

     onDraw(context) {

          context.fillStyle = 'black';
          context.fillRect(0, 0, this.width, this.height);

     }

}

$1S.registerType(Demo, "Demo");









