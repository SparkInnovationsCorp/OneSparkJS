const Asteroid = await $1S.import("Asteroid", "../props/asteroid.js");
const Ship = await $1S.import("Ship", "../props/ship.js");

class Game extends $1S.Renderer.Type.StageType {

     onInit(properties) {
          this.resetStage();

          this.lblScore = new $1S.UI.Controls.Label(
               {
                    x: 120,
                    y: 30,
                    width: 200,
                    height: 40,
                    fontSize: 16,
                    textAlign: "left",
                    textColor: "white",
                    text: "Score: 0"
               });

          this.exitButton = new $1S.UI.Controls.Button(
               {
                    x: this.width - 110,
                    y: 30,
                    fontSize: 16,
                    width: 100,
                    height: 40,
                    textAlign: "center",
                    textColor: "white",
                    backColor: "#0072C6",
                    text: "Exit",
                    onClick: this.exitButtonClick.bind(this)
               });

          this.player = new Ship(
               {
                    x: this.width / 2,
                    y: this.height / 2,
                    lineColor: "white",
                    width: 40,
                    height: 20,
                    takesCollisions: true
               });

          this.registerProp(this.lblScore, {}, 10000);
          this.registerProp(this.exitButton, {}, 10000);
          this.registerProp(this.player, {}, 100);

     }

     onShowStage() {
          this.keys = {};

          //$1S.Renderer.Graphics.setFullScreen(true);

          $1S.IO.Input.attach($1S.IO.Input.EventType.KEY_UP,
               this.id,
               (event) => {
                    this.keys[event.code] = false;
                    return true;
               });

          $1S.IO.Input.attach($1S.IO.Input.EventType.KEY_DOWN,
               this.id,
               (event) => {
                    this.keys[event.code] = true;
                    return true;
               });
     }

     onHideStage() {
          $1S.IO.Input.release(this.id);

          //$1S.Renderer.Graphics.setFullScreen(false);

     }

     onTick(timeStamp, deltaTime) {
          this.lblScore.text = "Score: " + this.score.toString();

          for (var i = this.asteroids.length - 1; i >= 0; i--) {

               if (this.isOffScreen(this.asteroids[i].instance)) {
                    if (this.asteroids[i].transited)
                    {
                         this.destroyProp(this.asteroids[i].id);
                         this.asteroids.splice(i, 1);

                         if (this.asteroids.length < this.densityFactor)
                              this.createAsteroid(this.densityFactor - this.asteroids.length);
                    }
               }
               else
                    this.asteroids[i].transited = true;

          }

          const player = this.player;

          if (player != null) {

               //we only want to fire once on key release
               if (!this.Entered)
                    this.Entered = false;

               // Handle player movement
               if (this.keys['ArrowLeft'] != undefined) {
                    player.moveLeft(this.keys['ArrowLeft']);
               }
               if (this.keys['ArrowRight'] != undefined) {
                    player.moveRight(this.keys['ArrowRight']);
               }
               if (this.keys['KeyA'] != undefined || this.thrust) {
                    player.forward(this.keys['KeyA']);
               }
               if (this.keys['KeyZ'] != undefined) {
                    player.brake(this.keys['KeyZ']);
               }
               if (this.keys['Enter'] != undefined) {
                    player.shoot(this.keys['Enter']);
               }

          }


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
          $1S.IO.Input.release(this.id);
     }

     resetStage() {
          this.stars = [];
          this.starCount = 100;
          this.asteroids = [];
          this.score = 0;
          this.hits = 0;
          this.densityFactor = 1;
          this.thrust = false;
     }

     newGame() {
          this.resetStage();

          this.createStarField();

          this.createAsteroid(this.densityFactor - this.asteroids.length); // start with 2 asteroids

          $1S.Audio.play("ambient space", true);

          // start the game
          this.gameDensityIncreaser = setInterval(() => {
               // increase density factor every 30 seconds
               this.densityFactor += 1;
          }, 15000);
     }

     //adds one asteroid
     createAsteroid(numAsteroids) {
          if (this.asteroids.length >= 5) return;

          for (let i = 0; i < numAsteroids; i++) {
               const obj = new Asteroid({ takesCollisions: true, givesCollisions: true });
               this.asteroids.push({
                    name: obj.id,
                    transited: false,
                    instance: obj,
               });

               this.registerProp(obj);
          }
     }

     asteroidCollision(asteroid, collisionObjects) {

          const lasers = $1S.getType("Laser");

          for (const obj of collisionObjects) {
               if (obj instanceof lasers) {

                    $1S.Audio.play("explosion");

                    const asteroidIndex = this.asteroids.findIndex(ast => ast.instance.id === asteroid.id);
                    if (asteroidIndex !== -1) {
                         const destroyedAsteroid = this.asteroids.splice(asteroidIndex, 1)[0];
                         this.destroyProp(destroyedAsteroid.instance.id);
                    }

                    obj.destroy();

                    this.createAsteroid(1);

                    this.score++;
               }
          }

     }

     shipCollision(collisionObjects) {
          console.log("ship", collisionObjects);
     }

     isOffScreen(obj) {

          // Calculate the edges of the shape
          const leftEdge = obj.x;
          const rightEdge = obj.x + obj.width;
          const topEdge = obj.y;
          const bottomEdge = obj.y + obj.height;

          // Check if any of the edges are outside the canvas bounds
          const isOffLeft = rightEdge < 0;
          const isOffRight = leftEdge > this.width;
          const isOffTop = bottomEdge < 0;
          const isOffBottom = topEdge > this.height;

          // Return true if all edges are offscreen, false otherwise
          return isOffLeft || isOffRight || isOffTop || isOffBottom;
     }

     createStarField() {
          for (let i = 0; i < this.starCount; i++) {
               const x = Math.random() * this.width;
               const y = Math.random() * this.height;
               const size = Math.random() * 3;
               const star = { x, y, size };
               this.stars.push(star);
          }
     }

     exitButtonClick(e) {
          clearInterval(this.gameDensityIncreaser);

          $1S.Audio.stopAll();

          $1S.Application.get().stageEventHandler("exit", this);
     }

}

$1S.registerType(Game, "Game");










