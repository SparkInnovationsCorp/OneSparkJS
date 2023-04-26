class Demo extends $1S.Renderer.Type.StageType {

     onInit(properties) {
          this.centerX = this.width / 2;
          this.centerY = this.height / 2;

          this.inFront = true;
          this.audioOn = false;
          this.initialized = false;

          var base = this;
          setTimeout(function () {

               base.initializeControls();

          }, 500);

     }

     initializeControls() {

          this.layoutContainer = new $1S.Renderer.Type.LayoutType("demo",{ width: this.width, height: this.height, x: 0, y: 0, alignOn: $1S.Renderer.Type.AlignOn.UpperLeft });
          this.registerProp(this.layoutContainer);

          this.sprite = new $1S.Renderer.Type.SpriteType({ groupName: "walk-right", framesPerSecond: 12, x: 100, y: 100 });
          this.registerProp(this.sprite);

          var btn = new $1S.UI.Controls.Button(
               {
                    x: this.width / 2,
                    y: 670,
                    fontSize: 16,
                    width: 200,
                    height: 40,
                    textColor: "white",
                    backColor: "#0072C6",
                    text: "Audio Toggle",
                    onClick: this.toggleAudio.bind(this)
               });

          this.registerProp(btn, {});

          this.points = [
               { x: 100, y: 70, group: "walk-right", inFront: true },
               { x: 900, y: 70, group: "walk-forward", inFront: true },
               { x: 900, y: 490, group: "walk-left", inFront: true },
               { x: 100, y: 490, group: "walk-backward", inFront: true },
               { x: 100, y: 150, group: "walk-right", inFront: false },
               { x: 900, y: 150, group: "walk-forward", inFront: false },
               { x: 900, y: 400, group: "walk-left", inFront: false },
               { x: 100, y: 400, group: "walk-backward", inFront: false }
          ];

          this.walkSpeed = 2; //pixel per ms;

          this.timePerSegment = this.calculateTimePerSegment(this.points);
          
          this.currentSegment = 0;

          this.initialized = true;
     }


     toggleAudio(e) {

          this.audioOn = !this.audioOn;

          if (this.audioOn)
               $1S.Audio.play("steps", true);
          else
               $1S.Audio.stop("steps", true);
     }


     onUpdate(timeStamp, deltaTime) {
          if (!this.initialized) return;

          //Walk our man in a square
          const elapsed = timeStamp % (this.timePerSegment * this.points.length);

          // Update the current segment if needed
          const index = Math.floor(elapsed / this.timePerSegment);
          if (this.currentSegment !== index) {
               this.currentSegment = index;

               //change the sprite showing!
               this.sprite.show(this.points[this.currentSegment].group);
               this.inFront = this.points[this.currentSegment].inFront;
          }

          // Calculate the sprite's position based on the current segment
          const start = this.points[this.currentSegment];
          const end = this.points[(this.currentSegment + 1) % this.points.length];
          const segmentElapsed = elapsed % this.timePerSegment;
          const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          const ratio = segmentElapsed / this.timePerSegment;
          const newPosition = {
               x: start.x + (end.x - start.x) * ratio,
               y: start.y + (end.y - start.y) * ratio,
          };

          // Set the sprite's position to the new position
          this.sprite.x = newPosition.x;
          this.sprite.y = newPosition.y;
     }

     calculateTimePerSegment(points) {
          return points.reduce((total, point, index) => {
               if (index === 0) return total;
               const lastPoint = points[index - 1];
               const distance = Math.sqrt((point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2);
               return total + distance / this.walkSpeed;
          }, 0);
     }

     onDrawBeforeProp(context, prop) {
          if (!this.initialized) return;

          if (prop.Instance.id == this.sprite.id && this.inFront) {

               context.fillStyle = 'black';
               context.fillRect(200, 150, 624, 368);

               const image = $1S.Renderer.Graphics.getImage("logo");
               const imageCanvas = image.Canvas;
               const imageContext = image.CanvasContext;

               const x = (this.width / 2) - (imageCanvas.width / 2);
               const y = (this.height / 2) - (imageCanvas.height / 2) - 50;
               context.drawImage(imageCanvas, x, y);

          }

     }

     onPostDraw(context, prop) {
          if (!this.initialized) return;

          if (!this.inFront) {

               context.fillStyle = 'black';
               context.fillRect(200, 150, 624, 368);

               const image = $1S.Renderer.Graphics.getImage("logo");
               const imageCanvas = image.Canvas;
               const imageContext = image.CanvasContext;

               const x = (this.width / 2) - (imageCanvas.width / 2);
               const y = (this.height / 2) - (imageCanvas.height / 2) - 50;
               context.drawImage(imageCanvas, x, y);

          }

     }

}

$1S.registerType(Demo, "Demo");









