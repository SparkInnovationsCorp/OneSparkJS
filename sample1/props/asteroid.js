class Asteroid extends $1S.Physics.Type.PhysicsBound {

     onInit(properties) {
          this.radius = Math.floor(Math.random() * 100) + 5;
          this.width = this.radius * 2;
          this.height = this.radius * 2;
          this.mass = this.radius * 0.2;

          this.workCanvas.width = this.width;
          this.workCanvas.height = this.height;
          this.workContext = this.workCanvas.getContext('2d')

          this.vertexes = [];
          this.updateDrawing = true;

          this.collisionBorder = $1S.Physics.Collisions.createHexagon(this.width, this.height);

          this.initControls();
     }

     initControls() {

          //draw random asteriod ti vertextes here
          const sides = Math.floor(Math.random() * 5) + 5; // Generate a random number of sides between 5 and 10
          const angleStep = (Math.PI * 2) / sides; // Calculate the angle between each vertex
          const minRadius = this.radius * 0.5; // Set the minimum radius for a vertex
          const maxRadius = this.radius; // Set the maximum radius for a vertex

          for (let i = 0; i < sides; i++) {
               // Generate a random radius for the current vertex
               const radius = Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;
               // Calculate the angle for the current vertex
               const angle = angleStep * i;
               // Calculate the x and y coordinates for the current vertex
               const x = this.width / 2 + radius * Math.cos(angle);
               const y = this.height / 2 + radius * Math.sin(angle);

               // Add the vertex to the array of vertices
               this.vertexes.push({ x, y });
          }

          //get screen size
          const size = $1S.Renderer.Canvas.getSize();

          const side = Math.floor(Math.random() * 4);
          switch (side) {
               case 0: // left
                    this.orientation.x = -this.width;
                    this.orientation.y = Math.random() * size.height;
                    this.vectorX = Math.random() * 0.1 + 0.1;
                    this.vectorY = Math.random() * 0.2 - 0.1;
                    break;
               case 1: // top
                    this.orientation.x = Math.random() * size.width;
                    this.orientation.y = -this.height;
                    this.vectorX = Math.random() * 0.2 - 0.1;
                    this.vectorY = Math.random() * 0.1 + 0.1;
                    break;
               case 2: // right
                    this.orientation.x = size.width;
                    this.orientation.y = Math.random() * size.height;
                    this.vectorX = Math.random() * -0.1 - 0.1;
                    this.vectorY = Math.random() * 0.2 - 0.1;
                    break;
               case 3: // bottom
                    this.orientation.x = Math.random() * size.width;
                    this.orientation.y = size.height;
                    this.vectorX = Math.random() * 0.2 - 0.1;
                    this.vectorY = Math.random() * -0.1 - 0.1;
                    break;
          }

          this.rotationSpeed = (Math.random() * 0.5) - 0.25;
     }

     onCollision(collisionObjects) {
          this._stage.asteroidCollision(this, collisionObjects);
     }

     onDraw(context) {

          if (this.updateDrawing) {

               if (this.vertexes.length == 0) return;

               // Translate the context to the asteroid's position
               context.translate(0, 0);

               // Generate asteroid shape by connecting vertices with lines
               context.beginPath();
               context.moveTo(this.vertexes[0].x, this.vertexes[0].y);

               for (let i = 1; i < this.vertexes.length; i++) {
                    context.lineTo(this.vertexes[i].x, this.vertexes[i].y);
               }
               context.closePath();

               // Set stroke style for asteroid shape
               context.strokeStyle = '#ffffff';
               context.lineWidth = 2;
               context.stroke();

               this.updateDrawing = false;
          }

     }

}

$1S.registerType(await Asteroid, "Asteroid");



