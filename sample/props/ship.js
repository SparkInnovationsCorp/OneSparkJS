const Laser = await $1S.import("Laser", "./laser.js");

class Ship extends $1S.Physics.Types.PhysicsBoundType {

     onInit(properties) {

          this.lineColor = properties.lineColor || 'black';

          this.mass = 0;
          this.acceleration = 0.01;
          this.steeringSpeed = 2;
          this.frictionNormal = 0.0001;
          this.frictionStop = 0.003;
          this.shot = false;

          //rocket control w/ keyboard
          this.input = new $1S.Physics.Motion.Thrust(this, { acceleration: this.acceleration, speedCap: 0.5 });

          //slows down over time
          this.friction = new $1S.Physics.Motion.Friction(this, { frictionCoefficient: this.frictionNormal })

          //wraps around on screen axis
          this.wrapAround = new $1S.Physics.Motion.WrapAround(this, { width: 800, height: 600 });

          //register the physics modifiers with the engine that control vectorX, vectorY for this object
          this.registerPhysicsModifier(this.input);
          this.registerPhysicsModifier(this.friction);
          this.registerPhysicsModifier(this.wrapAround);

          this.updateDrawing = true;
          this.isAccelerating = false;

          //this is our collision border
          this.collisionBorder = $1S.Physics.Collisions.createHexagon(this.width, this.width);

          this.playingRocket = false;
     }

     rotate(speed) {
          this.rotation += speed;
          if (this.rotation < 0) this.rotation = 359;
          if (this.rotation > 360) this.rotation = 1;
     }

     moveLeft(pressed) {
          if (pressed)
               this.rotate(-1 * this.steeringSpeed);
     }

     moveRight(pressed) {
          if (pressed)
               this.rotate(this.steeringSpeed);
     }

     forward(pressed) {
          if (pressed) {
               if (!this.playingRocket) {
                    $1S.Audio.play("rocket", true);
                    this.playingRocket = true;
               }
               this.input.moveForwardStart();
          }
          else {
               if (this.playingRocket) {
                    $1S.Audio.stop("rocket");
                    this.playingRocket = false;
               }
               this.input.moveForwardStop();
          }
     }

     shoot(pressed) {

          if (pressed) {
               if (!this.shot) {
                    this.shot = true;

                    $1S.Audio.play("laser");

                    this.stage = $1S.Renderer.get();

                    var laserSpeed = 0.3; //1px per ms

                    // Calculate the start x and y coordinates of the laser based on the ship's position and rotation
                    var startX = this.x;
                    var startY = this.y;

                    // Convert the rotation to radians before calculating the vectorX and vectorY
                    var radians = this.rotation * Math.PI / 180;

                    // Calculate the vectorX and vectorY of the laser based on the ship's rotation and the laserSpeed
                    var vectorX = Math.cos(radians) * laserSpeed;
                    var vectorY = Math.sin(radians) * laserSpeed;

                    // Create a new Laser object and register it with the game's stage
                    this.stage.Instance.registerProp(new Laser({ x: startX, y: startY, vectorX: vectorX, vectorY: vectorY, rotation: this.rotation, givesCollisions: true }));
               }
          }
          else {
               this.shot = false;
          }

     }

     brake(pressed) {
          if (pressed)
               this.friction.friction = this.frictionStop;
          else
               this.friction.friction = this.frictionNormal;
     }

     onCollision(collisionObjects) {
          $1S.Renderer.get().Instance.shipCollision(collisionObjects);
     }

     onDraw(context) {

          const isAccelerating = this.input.isAccelerating();

          if (isAccelerating != this.isAccelerating) this.updateDrawing = true;

          if (this.updateDrawing) {

               context.clearRect(0, 0, this.width, this.height);

               // Draw ship
               context.save(); // save the current transformation matrix
               context.translate(0, 0); // move the origin to the ship's position
               context.fillStyle = this.lineColor; // set the ship's color
               context.beginPath();
               context.moveTo(this.width * 0.25, 0); // draw the ship's triangle
               context.lineTo(this.width, this.height / 2);
               context.lineTo(this.width * 0.25, this.height);
               context.closePath();
               context.fill();
               context.restore(); // restore the previous transformation matrix


               // Draw rocket flame
               if (isAccelerating) {

                    context.save(); // save the current transformation matrix
                    context.fillStyle = "orange"; // set the flame color
                    context.beginPath();
                    context.moveTo(0, this.height * 0.2); // draw the flame's triangle
                    context.lineTo(this.width * 0.25, this.height / 2);
                    context.lineTo(0, this.height * 0.8);
                    context.closePath();
                    context.fill();
                    context.restore(); // restore the previous transformation matrix
               }

               this.updateDrawing = false;
               this.isAccelerating = isAccelerating;
          }

     }

}

$1S.registerType(await Ship, "Ship");



