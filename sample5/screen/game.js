class Game extends $1S.Renderer.Type.Stage {

     onInit(properties) {

          const AnchorTransform = $1S.Renderer.Type.Render2D.Transform.AnchorTransform;
          const AnchorType = $1S.Renderer.Type.Render2D.Transform.AnchorType;

          this.lblTitle = new $1S.UI.Controls.Label(
               {
                    width: this.width - 20,
                    height: 40,
                    fontFamily: 'Arial',
                    fontSize: 30,
                    textAlign: "right",
                    textColor: "white",
                    text: "How To 3D Render WITH THREE Library"
               });

          this.registerProp(new AnchorTransform(this, this.lblTitle,
               {
                    anchorRight: AnchorType.Absolute,
                    anchorRightValue: 20,
                    anchorTop: AnchorType.Absolute,
                    anchorTopValue: 20
               }), {}, 10000);

          // Set up Three.js scene, camera, and renderer
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
          this.renderer = $1S.Renderer.Canvas.getThreeRenderer();

          // Set the background color to black
          this.scene.background = new THREE.Color(0x000000);

          // Create an array of materials for each face of the cube
          const materials = [
               new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
               new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Green
               new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Blue
               new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Yellow
               new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Magenta
               new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Cyan
          ];

          // Create a cube geometry
          const geometry = new THREE.BoxGeometry(1, 1, 1);

          // Create a mesh using the geometry and material
          this.cube = new THREE.Mesh(geometry, materials);

          // Add the cube to the scene
          this.scene.add(this.cube);

          // Store the initial timestamp for rotation calculation
          this.startTime = performance.now();
     }


     //fires when the stage this is on is shown
     onShowStage(properties) {
     }

     //fires when this stage is hidden
     onHideStage(properties) {
     }

     //runs every clock tick
     onTick(timeStamp, deltaTime) {
          // Calculate the rotation based on elapsed time
          const elapsedTime = timeStamp - this.startTime;
          const rotation = elapsedTime * 0.001; // Adjust the rotation speed here

          // Update the cube's rotation
          this.cube.rotation.x = rotation;
          this.cube.rotation.y = rotation;
          this.cube.rotation.z = rotation;
     }

     //draws our page onto its local canvas context
     onDraw(context) {
          //clear 2D context
          context.clearRect(0, 0, this.width, this.height);

          // Position the camera
          this.camera.position.z = 5;

          // Render the scene with the camera
          this.renderer.render(this.scene, this.camera);
     }

     onResize(w,h) {
          this.container.width = w;
          this.container.height = h;
     }

     onDestroy() {

     }

}

$1S.registerType(Game, "Game");





