class IsometricGrid extends $1S.Renderer.Type.Render2D.Prop {
     onInit(properties) {

          //each tile is a square
          this.tileSize = 50;
          this.accumulatedTime = 0;

          this.cameraFOV = 60;
          this.screenDistanceFromCamera = 25;

          //this start in upper left (0,0)
          this.cameraAngleToBoard = 65; //degrees
          this.cameraDistanceFromBoard = 100; //degrees

          this.tile = [];

          //creates a random two color board for now
          for (let i = 0; i < 10; i++) {
               for (let j = 0; j < 10; j++) {

                    // Generate tile square
                    const tile = {
                         x1: i * this.tileSize,
                         y1: j * this.tileSize,
                         x2: (i + 1) * this.tileSize,
                         y2: (j + 1) * this.tileSize,
                         z: 0,
                         name: this.numberToLetter(i) + j.toString(),
                         backgroundColor: this.getRandomColor()
                    };

                    const shape = [
                         { x: tile.x1, y: tile.y1, z: tile.z },
                         { x: tile.x2, y: tile.y1, z: tile.z },
                         { x: tile.x2, y: tile.y2, z: tile.z },
                         { x: tile.x1, y: tile.y2, z: tile.z }
                    ];

                    this.tile.push({
                         fillColor: tile.backgroundColor,
                         label: tile.name,
                         shape: shape,
                         i: i, j: j
                    });
               }
          }

          // Set the initial state and variables
          this.startTime = null; // Tracks the start time of the oscillation
     }


     onShowStage(properties) {
     }

     // Runs every clock tick
     onTick(timeStamp, deltaTime) {
          this.onTickOrbit(timeStamp, deltaTime);
     }

     onTickOrbit(timeStamp, deltaTime) {
          if (this.startTime === null) {
               // Initialize the start time
               this.startTime = timeStamp;
          }

          // Calculate the time elapsed since the oscillation started
          const elapsedTime = timeStamp - this.startTime;

          // Calculate the progress of the oscillation (0 to 1)
          const progress = elapsedTime / 1000;

          // Calculate the current camera position based on the progress
          const currentCameraTarget = this.calculateCurrentCameraTarget(
               progress,
               { x: 250, y: 250, z: 0 },
               { x: 250, y: 250, z: 0 }
          );

          const radians =
               ((progress * 2 * Math.PI) + this.cameraAngleToBoard) / 180 * Math.PI;

          // Calculate the camera position
          const camera = {
               x: currentCameraTarget.x + Math.cos(radians) * 200,
               y: currentCameraTarget.y + Math.sin(radians) * 200,
               z: currentCameraTarget.z + 100
          };

          this.setCamera(camera, currentCameraTarget);
     }


     // Calculates the current camera position based on the progress
     calculateCurrentCameraTarget(progress, startTarget, endTarget) {
          return {
               x: startTarget.x + (endTarget.x - startTarget.x) * progress,
               y: startTarget.y + (endTarget.y - startTarget.y) * progress,
               z: startTarget.z + (endTarget.z - startTarget.z) * progress,
          };
     }

     onDraw(context) {
          context.clearRect(0, 0, this.width, this.height);

          this.onDrawPerspective(context);
          this.onDrawTopDown(context);
     }

     onDrawTopDown(context) {
          for (let i = 0; i < this.tile.length; i++) {

               const squareShape = this.tile[i];

               context.beginPath();

               context.fillStyle = squareShape.fillColor;
               context.strokeStyle = "white";

               // Initialize variables to calculate the center of the shape
               let xSum = 0, ySum = 0, pointsCount = 0;

               for (let j = 0; j < squareShape.shape.length; j++) {

                    var screenPoint = squareShape.shape[j];

                    // Add the current point's coordinates to the sums
                    xSum += screenPoint.x;
                    ySum += screenPoint.y;
                    pointsCount++;

                    if (j === 0) {
                         context.moveTo(screenPoint.x, screenPoint.y);
                    } else {
                         context.lineTo(screenPoint.x, screenPoint.y);
                    }

               }

               context.closePath();
               context.fill();
               context.stroke();

               // Calculate the center of the shape
               let centerX = xSum / pointsCount;
               let centerY = ySum / pointsCount;

               // Draw the label at the center of the shape
               context.fillStyle = "black";  // or any color you want for the text
               context.font = "20px Arial";  // or any font and size you want
               context.textAlign = "center";
               context.textBaseline = "middle";
               context.fillText(squareShape.label, centerX, centerY);
          }

          context.beginPath();
          context.strokeStyle = "blue";
          context.moveTo(this.screenPlane.upperLeft.x, this.screenPlane.upperLeft.y);
          context.lineTo(this.screenPlane.upperRight.x, this.screenPlane.upperRight.y);
          context.lineTo(this.screenPlane.lowerRight.x, this.screenPlane.lowerRight.y);
          context.lineTo(this.screenPlane.lowerLeft.x, this.screenPlane.lowerLeft.y);
          context.closePath();
          context.stroke();

          context.beginPath();
          context.strokeStyle = "black";
          context.moveTo(this.camera.x, this.camera.y);
          context.lineTo(this.cameraTarget.x, this.cameraTarget.y);
          context.stroke();

          context.fillStyle = "black"; // Color of the dot
          context.fillRect(this.camera.x - 3, this.camera.y - 3, 6, 6); // Draw a 2px by 2px rectangle at (x, y)
          context.fillRect(this.cameraTarget.x - 3, this.cameraTarget.y - 3, 6, 6); // Draw a 2px by 2px rectangle at (x, y)


     }

     onDrawPerspective(context) {
          for (let i = 0; i < this.tile.length; i++) {

               const squareShape = this.tile[i];

               const camera = this.cameraTarget;

               const screenShape = [];
               var shapeInFront = false;
               for (let j = 0; j < squareShape.shape.length; j++) {
                    var screenPoint = this.getPointOnScreen(squareShape.shape[j]);

                    if (screenPoint.y > 0 && screenPoint.y < this.height)
                    {
                         shapeInFront = true;
                    }
                    screenShape.push(screenPoint);
               }

               if (shapeInFront) {

                    context.beginPath();

                    context.fillStyle = squareShape.fillColor;
                    context.strokeStyle = "white";

                    // Initialize variables to calculate the center of the shape
                    let xSum = 0, ySum = 0, pointsCount = 0;

                    for (let j = 0; j < screenShape.length; j++) {

                         const screenPoint = screenShape[j];

                         // Add the current point's coordinates to the sums
                         xSum += screenPoint.x;
                         ySum += screenPoint.y;
                         pointsCount++;

                         if (j === 0) {
                              context.moveTo(screenPoint.x, screenPoint.y);
                         } else {
                              context.lineTo(screenPoint.x, screenPoint.y);
                         }

                    }

                    context.closePath();
                    context.fill();
                    context.stroke();

                    // Calculate the center of the shape
                    let centerX = xSum / pointsCount;
                    let centerY = ySum / pointsCount;

                    // Draw the label at the center of the shape
                    context.fillStyle = "black";  // or any color you want for the text
                    context.font = "20px Arial";  // or any font and size you want
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText(squareShape.label, centerX, centerY);

               }

          }
     }

     onResize(parentWidth, parentHeight) {

     }

     onDestroy() {
     }

     numberToLetter(number) {
          const alphabetLength = 26;
          let result = '';

          while (number >= 0) {
               result = String.fromCharCode(number % alphabetLength + 65) + result;
               number = Math.floor(number / alphabetLength) - 1;
          }

          return result;
     }

     getRandomColor() {
          const colors = ["red", "green"];
          const randomIndex = Math.floor(Math.random() * colors.length);
          return colors[randomIndex];
     }

     setIsometricCamera(cameraTarget) {

          const radians = (this.cameraAngleToBoard * Math.PI) / 180;

          //camera
          const camera = {
               x: cameraTarget.x,
               y: cameraTarget.y + (Math.cos(radians) * this.cameraDistanceFromBoard),
               z: cameraTarget.z + (Math.sin(radians) * this.cameraDistanceFromBoard)
          };

          this.setCamera(camera, cameraTarget);

     }

     setCamera(camera, cameraTarget) {

          const cameraForwardVector = {
               x: cameraTarget.x - camera.x,
               y: cameraTarget.y - camera.y,
               z: cameraTarget.z - camera.z
          };

          // Calculate the magnitude of the vector
          const magnitude = Math.sqrt(cameraForwardVector.x ** 2 + cameraForwardVector.y ** 2 + cameraForwardVector.z ** 2);

          // Normalize the vector by dividing each component by the magnitude
          const normalizedVector = {
               x: cameraForwardVector.x / magnitude,
               y: cameraForwardVector.y / magnitude,
               z: cameraForwardVector.z / magnitude
          };

          const aspectRatio = this.width / this.height;

          // Assuming field of view is vertical
          const fieldOfViewInRadians = (this.cameraFOV * Math.PI) / 180;
          const screenHeight = 2 * Math.tan(fieldOfViewInRadians / 2) * this.screenDistanceFromCamera;
          const screenWidth = screenHeight * aspectRatio;

          const screenMidPoint = {
               x: camera.x + (cameraForwardVector.x * (this.screenDistanceFromCamera / this.cameraDistanceFromBoard)),
               y: camera.y + (cameraForwardVector.y * (this.screenDistanceFromCamera / this.cameraDistanceFromBoard)),
               z: camera.z + (cameraForwardVector.z * (this.screenDistanceFromCamera / this.cameraDistanceFromBoard))
          };

          const downVector = { x: 0, y: 0, z: -1 };

          const screenWidthVector = {
               x: normalizedVector.y * downVector.z - normalizedVector.z * downVector.y,
               y: normalizedVector.z * downVector.x - normalizedVector.x * downVector.z,
               z: normalizedVector.x * downVector.y - normalizedVector.y * downVector.x
          };

          const screenHeightVector = {
               x: normalizedVector.y * screenWidthVector.z - normalizedVector.z * screenWidthVector.y,
               y: normalizedVector.z * screenWidthVector.x - normalizedVector.x * screenWidthVector.z,
               z: normalizedVector.x * screenWidthVector.y - normalizedVector.y * screenWidthVector.x
          };


          const screenPlane = {
               // Upper left
               upperLeft: {
                    x: screenMidPoint.x - (screenWidth / 2) * screenWidthVector.x + (screenHeight / 2) * screenHeightVector.x,
                    y: screenMidPoint.y - (screenWidth / 2) * screenWidthVector.y + (screenHeight / 2) * screenHeightVector.y,
                    z: screenMidPoint.z - (screenWidth / 2) * screenWidthVector.z + (screenHeight / 2) * screenHeightVector.z
               },

               // Upper right
               upperRight: {
                    x: screenMidPoint.x + (screenWidth / 2) * screenWidthVector.x + (screenHeight / 2) * screenHeightVector.x,
                    y: screenMidPoint.y + (screenWidth / 2) * screenWidthVector.y + (screenHeight / 2) * screenHeightVector.y,
                    z: screenMidPoint.z + (screenWidth / 2) * screenWidthVector.z + (screenHeight / 2) * screenHeightVector.z
               },

               // Lower left
               lowerLeft: {
                    x: screenMidPoint.x - (screenWidth / 2) * screenWidthVector.x - (screenHeight / 2) * screenHeightVector.x,
                    y: screenMidPoint.y - (screenWidth / 2) * screenWidthVector.y - (screenHeight / 2) * screenHeightVector.y,
                    z: screenMidPoint.z - (screenWidth / 2) * screenWidthVector.z - (screenHeight / 2) * screenHeightVector.z
               },

               // Lower right
               lowerRight: {
                    x: screenMidPoint.x + (screenWidth / 2) * screenWidthVector.x - (screenHeight / 2) * screenHeightVector.x,
                    y: screenMidPoint.y + (screenWidth / 2) * screenWidthVector.y - (screenHeight / 2) * screenHeightVector.y,
                    z: screenMidPoint.z + (screenWidth / 2) * screenWidthVector.z - (screenHeight / 2) * screenHeightVector.z
               }
          }

          // Calculate normal vector of the plane (screen)
          const normalVector = {
               x: screenHeightVector.y * screenWidthVector.z - screenHeightVector.z * screenWidthVector.y,
               y: screenHeightVector.z * screenWidthVector.x - screenHeightVector.x * screenWidthVector.z,
               z: screenHeightVector.x * screenWidthVector.y - screenHeightVector.y * screenWidthVector.x
          };

          // Calculate D in the plane equation
          const planeConstant = -(normalVector.x * screenMidPoint.x + normalVector.y * screenMidPoint.y + normalVector.z * screenMidPoint.z);


          this.camera = camera;
          this.cameraTarget = cameraTarget;
          this.screenPlane = screenPlane;
          this.screenWidth = screenWidth;
          this.screenHeight = screenHeight;
          this.screenWidthVector = screenWidthVector;
          this.screenHeightVector = screenHeightVector;
          this.screenMidPoint = screenMidPoint;

          this.normalVector = normalVector;
          this.planeConstant = planeConstant;
     };

     getPointOnScreen(vertex) {

          if (!this.camera || !this.cameraTarget || !this.screenPlane) {
               throw new Error('screenSetup must be called before calculateVertexScreenLocation');
          }

          // Calculate t
          const t = - (this.normalVector.x * this.camera.x + this.normalVector.y * this.camera.y + this.normalVector.z * this.camera.z + this.planeConstant) /
               (this.normalVector.x * (vertex.x - this.camera.x) + this.normalVector.y * (vertex.y - this.camera.y) + this.normalVector.z * (vertex.z - this.camera.z));

          // Calculate intersection point
          const intersectionPoint = {
               x: this.camera.x + t * (vertex.x - this.camera.x),
               y: this.camera.y + t * (vertex.y - this.camera.y),
               z: this.camera.z + t * (vertex.z - this.camera.z)
          };

          const vectorToIntersection = {
               x: intersectionPoint.x - this.screenMidPoint.x,
               y: intersectionPoint.y - this.screenMidPoint.y,
               z: intersectionPoint.z - this.screenMidPoint.z
          };

          // Project onto screen vectors
          const screenX = vectorToIntersection.x * this.screenWidthVector.x + vectorToIntersection.y * this.screenWidthVector.y + vectorToIntersection.z * this.screenWidthVector.z;
          const screenY = vectorToIntersection.x * this.screenHeightVector.x + vectorToIntersection.y * this.screenHeightVector.y + vectorToIntersection.z * this.screenHeightVector.z;

          // Scale to screen pixel dimensions
          const screenPixelX = (screenX / this.screenWidth) * this.width;
          const screenPixelY = (screenY / this.screenHeight) * this.height;

          const adjustmentFactor = 0; // Adjust as needed
          return {
               x: this.width / 2 + screenPixelX + adjustmentFactor * this.width, // Add the adjustment factor to x-coordinate
               y: this.height / 2 - screenPixelY // Subtract from half the height to move the origin to the center and flip Y-axis
          }
     }

}

$1S.registerType(IsometricGrid, "IsometricGrid");
