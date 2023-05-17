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
                         { x: tile.x1, y: tile.y1, z: j % 2 ? 10 : tile.z },
                         { x: tile.x2, y: tile.y1, z: j % 2 ? 10 : tile.z },
                         { x: tile.x2, y: tile.y2, z: j % 2 ? tile.z : 10 },
                         { x: tile.x1, y: tile.y2, z: j % 2 ? tile.z : 10 }
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

          this.grassImage = $1S.Assets.getImage("grass");

     }

     onShowStage(properties) {
     }

     onTick(timeStamp, deltaTime) {
          if (this.startTime === null) {
               // Initialize the start time
               this.startTime = timeStamp;
          }

          // Calculate the time elapsed since the oscillation started
          const elapsedTime = timeStamp - this.startTime;

          // Calculate the progress of the oscillation (0 to 1)
          const progress = elapsedTime / 1000;


          const currentCameraTarget = {
               x: 250, y: 250, z: 0
          }

          const radians =
               ((progress * 2 * Math.PI) + this.cameraAngleToBoard) / 180 * Math.PI;

          // Calculate the camera position
          const camera = {
               x: currentCameraTarget.x + Math.cos(radians) * 200,
               y: currentCameraTarget.y + Math.sin(radians) * 200,
               z: currentCameraTarget.z + 100
          };

          this.setCameraPosition(camera, currentCameraTarget);
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

          const grassImage = this.grassImage;

          for (let i = 0; i < this.tile.length; i++) {

               const squareShape = this.tile[i];

               const camera = this.cameraTarget;

               const screenShape = [];
               var shapeInFront = false;
               for (let j = 0; j < squareShape.shape.length; j++) {
                    var screenPoint = this.projectPointOnScreen(squareShape.shape[j]);

                    if (screenPoint.y > 0 && screenPoint.y < this.height)
                    {
                         shapeInFront = true;
                    }
                    screenShape.push(screenPoint);
               }

               if (shapeInFront) {

                    var minX = Math.min(screenShape[0].x, screenShape[1].x, screenShape[2].x, screenShape[3].x);
                    var minY = Math.min(screenShape[0].y, screenShape[1].y, screenShape[2].y, screenShape[3].y);

                    const topLeft = [screenShape[0].x - minX, screenShape[0].y - minY];
                    const topRight = [screenShape[1].x - minX, screenShape[1].y - minY];
                    const bottomRight = [screenShape[2].x - minX, screenShape[2].y - minY];
                    const bottomLeft = [screenShape[3].x - minX, screenShape[3].y - minY];

                    const wi = this.warpTextureToTileShape(grassImage.Image, topLeft, topRight, bottomLeft, bottomRight);

                    context.drawImage(wi, minX, minY);

                    context.beginPath();

                    //context.fillStyle = squareShape.fillColor;
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

                    //const pattern = context.createPattern(wi, 'no-repeat');

                    //context.fillStyle = pattern;

                    //context.fill();

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

     onResize(w, h) {

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
          const colors = ["rgba(255,0,0,0.4)", "rgba(0,255,0,0.4)"];
          const randomIndex = Math.floor(Math.random() * colors.length);
          return colors[randomIndex];
     }

     //this function sets camera and target coordinates, and pre-calcs a lot of things (like the virtual screen);
     setCameraPosition(camera, cameraTarget) {

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

     //this fuction calculates where a vertext would appear on your computer screen.
     projectPointOnScreen(vertex) {

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

     //this function will take a tile, and stretch the perspective to fit the 3d tile on screen.
     warpTextureToTileShape(img, topLeft, topRight, bottomLeft, bottomRight) {

          const utils = {

               rndInt(max, override) {
                    return Math.round(Math.random() * max);
               },

               calcIncircle(A, B, C) {
                    function lineLen(p1, p2) {
                         const dx = p2[0] - p1[0],
                              dy = p2[1] - p1[1];
                         return Math.sqrt(dx * dx + dy * dy);
                    }

                    const a = lineLen(B, C),
                         b = lineLen(C, A),
                         c = lineLen(A, B),
                         p = (a + b + c),
                         s = p / 2;

                    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

                    const r = area / s,
                         cx = (a * A[0] + b * B[0] + c * C[0]) / p,
                         cy = (a * A[1] + b * B[1] + c * C[1]) / p;
                    return {
                         r,
                         c: [cx, cy],
                    }
               },

               expandTriangle(A, B, C, amount) {
                    const incircle = this.calcIncircle(A, B, C),
                         c = incircle.c,
                         factor = (incircle.r + amount) / (incircle.r);

                    function extendPoint(p) {
                         const dx = p[0] - c[0],
                              dy = p[1] - c[1],
                              x2 = (dx * factor) + c[0],
                              y2 = (dy * factor) + c[1];
                         return [x2, y2];
                    }

                    const A2 = extendPoint(A),
                         B2 = extendPoint(B),
                         C2 = extendPoint(C);
                    return [A2, B2, C2];
               },

               linearSolution(r1, s1, t1, r2, s2, t2, r3, s3, t3) {
                    var a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
                    var b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
                    var c = t1 - (r1 * a) - (s1 * b);

                    return [a, b, c];
               },

               drawImageTriangle(img, ctx, s1, s2, s3, d1, d2, d3) {
                    const xm = this.linearSolution(s1[0], s1[1], d1[0], s2[0], s2[1], d2[0], s3[0], s3[1], d3[0]),
                         ym = this.linearSolution(s1[0], s1[1], d1[1], s2[0], s2[1], d2[1], s3[0], s3[1], d3[1]);

                    ctx.save();

                    ctx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
                    ctx.beginPath();
                    ctx.moveTo(s1[0], s1[1]);
                    ctx.lineTo(s2[0], s2[1]);
                    ctx.lineTo(s3[0], s3[1]);
                    ctx.closePath();

                    ctx.clip();
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    ctx.restore();

                    return;

                    const incircle = this.calcIncircle(d1, d2, d3),
                         c = incircle.c;

                    ctx.beginPath();
                    ctx.arc(c[0], c[1], incircle.r, 0, 2 * Math.PI, false);
                    ctx.moveTo(d1[0], d1[1]);
                    ctx.lineTo(d2[0], d2[1]);
                    ctx.lineTo(d3[0], d3[1]);
                    ctx.closePath();

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgba(255,0,0, .4)';
                    ctx.stroke();
               }

          };

          var minX = Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
          var maxX = Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
          var minY = Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
          var maxY = Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);

          const canvas = document.createElement('canvas');

          // Set the size of the canvas to match the image
          canvas.width = maxX - minX;
          canvas.height = maxY - minY;

          const ctx = canvas.getContext('2d');

          const w = img.width;
          const h = img.height;

          // Draw a white box on the new context
          //ctx.fillStyle = 'black';
          //ctx.fillRect(0, 0, canvas.width, canvas.height);

          const corners = [
               topLeft,
               topRight,
               [(topLeft[0] + topRight[0] + bottomLeft[0] + bottomRight[0]) / 4, (topLeft[1] + topRight[1] + bottomLeft[1] + bottomRight[1]) / 4],
               bottomLeft,
               bottomRight
          ];

          function drawTriangle(s1, s2, s3, d1, d2, d3) {
               const [d1x, d2x, d3x] = utils.expandTriangle(d1, d2, d3, .3);
               const [s1x, s2x, s3x] = utils.expandTriangle(s1, s2, s3, .3);
               utils.drawImageTriangle(img, ctx, s1x, s2x, s3x, d1x, d2x, d3x);
          }

          drawTriangle([0, 0], [w / 2, h / 2], [0, h], corners[0], corners[2], corners[3]);
          drawTriangle([0, 0], [w / 2, h / 2], [w, 0], corners[0], corners[2], corners[1]);
          drawTriangle([w, 0], [w / 2, h / 2], [w, h], corners[1], corners[2], corners[4]);
          drawTriangle([0, h], [w / 2, h / 2], [w, h], corners[3], corners[2], corners[4]);

          return canvas;
     }

}

$1S.registerType(IsometricGrid, "IsometricGrid");
