class IsometricGrid extends $1S.Renderer.Type.Render2D.Prop {
     onInit(properties) {

          this.gameBoard = [];

          //each tile is a square
          this.tileSize = 50;
          this.accumulatedTime = 0;


          //this start in upper left (0,0)
          this.cameraAngleToBoard = 65; //degrees
          this.cameraDistanceFromBoard = 50; //degrees

          //creates a random two color board for now
          for (let i = 0; i < 10; i++) {
               // Create an empty row
               const row = [];

               for (let j = 0; j < 10; j++) {
                    // Add tile square
                    row.push({
                         x1: i * this.tileSize,
                         y1: j * this.tileSize,
                         x2: (i + 1) * this.tileSize,
                         y2: (j + 1) * this.tileSize,
                         z: 0,
                         name: this.numberToLetter(i) + j.toString(),
                         backgroundColor: this.getRandomColor()
                    });
               }

               // Add the row to the 2D array
               this.gameBoard.push(row);
          }

          this.shape3D = [];

          for (let i = 0; i < this.gameBoard.length; i++) {
               for (let j = 0; j < this.gameBoard[i].length; j++) {

                    const tile = this.gameBoard[i][j];
                    const shapePath3D = [
                         { x: tile.x1, y: tile.y1, z: tile.z },
                         { x: tile.x2, y: tile.y1, z: tile.z },
                         { x: tile.x2, y: tile.y2, z: tile.z },
                         { x: tile.x1, y: tile.y2, z: tile.z }
                    ];

                    this.shape3D.push({
                         fillColor: tile.backgroundColor,
                         label: tile.name,
                         shape: shapePath3D,
                         i: i, j: j
                    })
               }
          }

          this.lookAtTileRow = 5;
          this.lookAtTileColumn = 9;

          const lookAt1 = this.gameBoard[5][9];

          //camera target
          this.cameraTarget1 = {
               x: lookAt1.x1 + ((lookAt1.x2 - lookAt1.x1) / 2),
               y: lookAt1.y1 + ((lookAt1.y2 - lookAt1.y1) / 2),
               z: 0
          }

          const lookAt2 = this.gameBoard[5][0];

          //camera target
          this.cameraTarget2 = {
               x: lookAt2.x1 + ((lookAt2.x2 - lookAt2.x1) / 2),
               y: lookAt2.y1 + ((lookAt2.y2 - lookAt2.y1) / 2),
               z: 0
          }

          // Set the initial state and variables
          this.isForward = true; // Tracks the direction of oscillation
          this.startTime = null; // Tracks the start time of the oscillation
          this.oscillationDuration = 20000; // Oscillation duration in milliseconds


     }

     onShowStage(properties) {
     }

     sceneSetup(cameraTarget) {

          const radians = (this.cameraAngleToBoard * Math.PI) / 180;

          //camera
          const camera = {
               x: cameraTarget.x,
               y: cameraTarget.y + (Math.cos(radians) * this.cameraDistanceFromBoard),
               z: cameraTarget.z + (Math.sin(radians) * this.cameraDistanceFromBoard)
          };

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

          const cameraFOV = 45;

          const screenDistanceFromCamera = 25;

          const aspectRatio = this.width / this.height;

          // Assuming field of view is vertical
          const fieldOfViewInRadians = (cameraFOV * Math.PI) / 180;
          const screenHeight = 2 * Math.tan(fieldOfViewInRadians / 2) * screenDistanceFromCamera;
          const screenWidth = screenHeight * aspectRatio;

          const screenMidPoint = {
               x: camera.x + (cameraForwardVector.x * (screenDistanceFromCamera / this.cameraDistanceFromBoard)),
               y: camera.y + (cameraForwardVector.y * (screenDistanceFromCamera / this.cameraDistanceFromBoard)),
               z: camera.z + (cameraForwardVector.z * (screenDistanceFromCamera / this.cameraDistanceFromBoard))
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

          //final step hopefully!!!

          // Vector from screen upper left corner to intersection point
          const vectorToIntersection = {
               x: intersectionPoint.x - this.screenPlane.upperLeft.x,
               y: intersectionPoint.y - this.screenPlane.upperLeft.y,
               z: intersectionPoint.z - this.screenPlane.upperLeft.z
          };

          // Project onto screen vectors
          const screenX = vectorToIntersection.x * this.screenWidthVector.x + vectorToIntersection.y * this.screenWidthVector.y + vectorToIntersection.z * this.screenWidthVector.z;
          const screenY = vectorToIntersection.x * this.screenHeightVector.x + vectorToIntersection.y * this.screenHeightVector.y + vectorToIntersection.z * this.screenHeightVector.z;

          // Scale to screen pixel dimensions
          // And flip the Y-axis because the screen's origin is at the top-left
          const screenPixelX = (screenX / this.screenWidth) * this.width;
          const screenPixelY = this.height - (screenY / this.screenHeight) * this.height; // subtract from height to flip Y-axis

          return {
               x: screenPixelX,
               y: screenPixelY
          }

     }

     // Runs every clock tick
     onTick(timeStamp, deltaTime) {
          if (this.startTime === null) {
               // Initialize the start time
               this.startTime = timeStamp;
          }

          // Calculate the time elapsed since the oscillation started
          const elapsedTime = timeStamp - this.startTime;

          // Calculate the progress of the oscillation (0 to 1)
          const progress = elapsedTime / this.oscillationDuration;

          // Check if the oscillation has completed a full cycle
          if (progress >= 1) {
               // Reset the start time and change the direction
               this.startTime = timeStamp;
               this.isForward = !this.isForward;
          }

          // Calculate the current camera position based on the progress
          const currentCameraTarget = this.isForward
               ? this.calculateCurrentCameraTarget(progress, this.cameraTarget1, this.cameraTarget2)
               : this.calculateCurrentCameraTarget(progress, this.cameraTarget2, this.cameraTarget1);

          // Apply the current camera position to the scene setup
          this.sceneSetup(currentCameraTarget, this.isForward);
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

          this.onDrawPerspective2(context);
          this.onDrawTopDown(context);
     }

     onDrawTopDown(context) {
          for (let i = 0; i < this.shape3D.length; i++) {

               const squareShape = this.shape3D[i];

               context.beginPath();

               context.fillStyle = squareShape.i == this.lookAtTileRow && squareShape.j == this.lookAtTileColumn ? "yellow" : squareShape.fillColor;
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
          for (let i = 0; i < this.shape3D.length; i++) {

               const squareShape = this.shape3D[i];

               context.beginPath();

               context.fillStyle = squareShape.i == this.lookAtTileRow && squareShape.j == this.lookAtTileColumn ? "yellow" : squareShape.fillColor;
               context.strokeStyle = "white";

               const camera = this.cameraTarget;

               // Initialize variables to calculate the center of the shape
               let xSum = 0, ySum = 0, pointsCount = 0;

               for (let j = 0; j < squareShape.shape.length; j++) {

                    var screenPoint = this.getPointOnScreen(squareShape.shape[j]);

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

     onDrawPerspective2(context) {
          for (let i = 0; i < this.shape3D.length; i++) {

               const squareShape = this.shape3D[i];

               const camera = this.cameraTarget;

               const screenShape = [];
               var shapeInFront = false;
               for (let j = 0; j < squareShape.shape.length; j++) {
                    var screenPoint = this.getPointOnScreen(squareShape.shape[j]);

                    if (squareShape.shape[j].y < camera.y) {
                         shapeInFront = true;
                    }
                    screenShape.push(screenPoint);
               }

               if (shapeInFront) {

                    context.beginPath();

                    context.fillStyle = squareShape.i == this.lookAtTileRow && squareShape.j == this.lookAtTileColumn ? "yellow" : squareShape.fillColor;
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
          this.gameBoard = null;
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

     getCameraForwardVector(cameraPosition, cameraTarget) {
          // Vector operations
          function subtract(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }; }
          function normalize(v) {
               let length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
               return { x: v.x / length, y: v.y / length, z: v.z / length };
          }

          // Calculate cameraDirection
          let cameraDirection = normalize(subtract(cameraTarget, cameraPosition));

          return cameraDirection;
     }

     getScreenCoordinates(cameraPosition, cameraTarget, screenWidth, screenHeight, fov) {
          // Vector operations
          function subtract(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }; }
          function add(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }; }
          function multiply(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s }; }
          function cross(v1, v2) {
               return {
                    x: v1.y * v2.z - v1.z * v2.y,
                    y: v1.z * v2.x - v1.x * v2.z,
                    z: v1.x * v2.y - v1.y * v2.x
               };
          }
          function normalize(v) {
               let length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
               return { x: v.x / length, y: v.y / length, z: v.z / length };
          }

          // Calculate cameraDirection
          let cameraDirection = normalize(subtract(cameraTarget, cameraPosition));

          // Calculate distance from the camera to the screen
          let hFOV = fov * (Math.PI / 180); // Convert to radians
          let distanceToScreen = (screenWidth / 2) / Math.tan(hFOV / 2);

          // Calculate screenCenter
          let screenCenter = add(cameraPosition, multiply(cameraDirection, distanceToScreen));

          // Calculate screen's right and up vectors
          let worldUp = { x: 0, y: 1, z: 0 }; // Assuming Y is up
          let screenRight = normalize(cross(cameraDirection, worldUp));
          let screenUp = normalize(cross(screenRight, cameraDirection));

          // Calculate screen's corners
          let halfWidth = screenWidth / 2;
          let halfHeight = screenHeight / 2;
          let screenCorners = [
               add(add(screenCenter, multiply(screenRight, halfWidth)), multiply(screenUp, halfHeight)),  // Top-right
               add(subtract(screenCenter, multiply(screenRight, halfWidth)), multiply(screenUp, halfHeight)),  // Top-left
               subtract(subtract(screenCenter, multiply(screenRight, halfWidth)), multiply(screenUp, halfHeight)),  // Bottom-left
               subtract(add(screenCenter, multiply(screenRight, halfWidth)), multiply(screenUp, halfHeight))  // Bottom-right
          ];

          return screenCorners;
     }

}

$1S.registerType(IsometricGrid, "IsometricGrid");
