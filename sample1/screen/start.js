class Start extends $1S.Renderer.Type.Stage {

     onInit(properties) {
          this.stars = [];
          this.starCount = 100;

          this.centerX = this.width / 2;
          this.centerY = this.height / 2;

          //create the starfield
          this.createStarField();

          this.lblTitle = new $1S.UI.Controls.Label(
               {
                    width: this.width,
                    height: 40,
                    fontFamily: '"Press Start 2P"',
                    fontSize: 30,
                    textAlign: "center",
                    textColor: "white",
                    text: "Asteroid Blaster"
               });

          this.lblCredit = new $1S.UI.Controls.Label(
               {
                    width: this.width,
                    height: 20,
                    fontSize: 16,
                    textAlign: "center",
                    textColor: "white",
                    text: "By Jason Bramble"
               });

          var btn = new $1S.UI.Controls.Button(
               {
                    fontSize: 16,
                    width: 200,
                    height: 40,
                    textColor: "white",
                    backColor: "#0072C6",
                    text: "Click to Start",
                    onClick: this.startButtonClick.bind(this)
               });

          const AnchorType = $1S.Renderer.Type.Render2D.Transform.AnchorType;
          const AnchorTransform = $1S.Renderer.Type.Render2D.Transform.AnchorTransform;

          this.registerProp(new AnchorTransform(this, this.lblTitle,
               {
                    anchorLeft: AnchorType.Centered,
                    anchorRight: AnchorType.Centered,
                    anchorTop: AnchorType.Centered,
                    anchorTopValue: 50
               }), {}, 10000);

          this.registerProp(new AnchorTransform(this, this.lblCredit,
               {
                    anchorLeft: AnchorType.Centered,
                    anchorRight: AnchorType.Centered,
                    anchorTop: AnchorType.Centered,
               }), {}, 10000);

          this.registerProp(new AnchorTransform(this, btn,
               {
                    anchorLeft: AnchorType.Centered,
                    anchorRight: AnchorType.Centered,
                    anchorBottom: AnchorType.Centered,
                    anchorBottomValue: 100
               }), {}, 10000);

     }

     onTick(timeStamp, deltaTime) {
          this.stars.forEach((star, index) => {
               star.distance += star.speed * deltaTime;
               star.x = this.centerX + Math.cos(star.angle) * star.distance;
               star.y = this.centerY + Math.sin(star.angle) * star.distance;

               if (star.x < 0 || star.x > this.width || star.y < 0 || star.y > this.height) {
                    this.stars.splice(index, 1);
                    this.addStar();
               }
          });
     }

     onDraw(context) {
          //blackness of space
          context.fillStyle = 'black';
          context.fillRect(0, 0, this.width, this.height);

          //my god, its full of stars
          context.fillStyle = 'white';
          this.stars.forEach((star) => {
               context.beginPath();
               context.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
               context.fill();
          });
     }

     onDispose() {
          this.stars = [];
     }

     startButtonClick(e) {
          $1S.Application.get().stageEventHandler("start", this);
     }

     createStarField() {
          for (let i = 0; i < this.starCount; i++) {
               this.addStar();
          }
     }

     addStar() {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 50; // Start near the center
          const x = this.centerX + Math.cos(angle) * distance;
          const y = this.centerY + Math.sin(angle) * distance;
          var speed = 0.005 + Math.random();
          if (speed > 0.5) speed = 0.5;
          const size = 1 + Math.random() * 3;
          this.stars.push({ x, y, speed, size, angle, distance });
     }

}

$1S.registerType(Start, "Start");









