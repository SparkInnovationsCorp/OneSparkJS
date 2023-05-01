class Ball extends $1S.Physics.Types.PhysicsBoundType {

     onInit(properties) {
          this.color = properties.color || "gray";
          this.width = 50;
          this.height = 50;
          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')

          this.mass = 1;
          this.acceleration = 0.01;
          this.steeringSpeed = 2;
          this.frictionNormal = 0.0001;

          //slows down over time
          //this.friction = new $1S.Physics.Motion.Friction(this, { frictionCoefficient: this.frictionNormal });

          //wraps around on screen axis
          this.bounce = new $1S.Physics.Motion.Bounce(this, { width: 800, height: 600, bounceReduction: .001 });

          //gravity
          this.gravity = new $1S.Physics.Motion.GravitationalAttraction(this, { gravityConstant: .01 });

          //register the physics modifiers with the engine that control vectorX, vectorY for this object
          //this.registerPhysicsModifier(this.friction);
          this.registerPhysicsModifier(this.bounce);
          this.registerPhysicsModifier(this.gravity);

          //bounce on collisions
          this.collisionBorder = $1S.Physics.Collisions.createHexagon(this.width, this.height);
          this.bounceModifier = new $1S.Physics.Collisions.Modifiers.Bounce(this);

          this.registerCollisionModifier(this.bounceModifier);

          this.updateDrawing = true;
     }

     onTick(timeStamp, deltaTime) {

     }

     onDraw(context) {

          if (this.updateDrawing) {
               // Reset the transformation matrix and begin a new path
               context.setTransform(1, 0, 0, 1, 0, 0);
               context.beginPath();
               // Draw a circle at the center of the canvas
               context.arc(this.width / 2, this.height / 2, Math.min(this.width, this.height) / 2, 0, 2 * Math.PI);
               // Fill the circle with white and stroke it with a black outline
               context.fillStyle = this.color;
               context.strokeStyle = '#ffffff';
               context.lineWidth = 2;
               context.fill();
               context.stroke();
               this.updateDrawing = false;
          }
     }

}

$1S.registerType(await Ball, "Ball");



