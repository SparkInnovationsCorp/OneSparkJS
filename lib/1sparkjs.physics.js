((global) => {

     const OneSparkJs = {};

     OneSparkJs.Debug = true;

     OneSparkJs.Physics = (() => {

          class PhysicsModifierType {
               constructor(target, properties = {}) {

                    if (!(target instanceof PhysicsBoundType))
                         throw new Error("No PhysicsBoundType target provided.");

                    this.id = $1S.Helper.newId();

                    this.target = target;

                    if (this.onInit) this.onInit(properties);
               }

               onTick(timeStamp, deltaTime) {
                    if (this.onUpdate)
                         this.onUpdate(timeStamp, deltaTime);
               }
          }

          class CollisionModifierType {
               constructor(target, properties) {

                    if (!(target instanceof PhysicsBoundType))
                         throw new Error("No PhysicsBoundType target provided.");

                    this.id = $1S.Helper.newId();

                    this.target = target;

                    if (this.onInit) this.onInit(properties);
               }

               onCollision(collisionObjects) {
                    throw new Error("onCollision not defined.");
               }
          }

          class PhysicsBoundType extends $1S.Renderer.Type.StagePropType {
               constructor(properties = {}) {
                    super(properties);

                    this.vectorX = properties.vectorX || 0;
                    this.vectorY = properties.vectorY || 0;
                    this.rotationSpeed = properties.rotationSpeed || 0;
                    this.vectorX2 = properties.vectorX || 0;
                    this.vectorY2 = properties.vectorY || 0;
                    this.rotationSpeed2 = properties.rotationSpeed || 0;
                    this.mass = properties.mass || 1;
                    this.takesCollisions = properties.takesCollisions || false;
                    this.givesCollisions = properties.givesCollisions || false;
                    this.collisionBorder = properties.collisionBorder || [];
                    this.physicsModifiers = [];
                    this.collisionModifiers = [];
                    this.collisions = [];

                    if (this.onInit) this.onInit(properties);

               }

               registerPhysicsModifier = (instance, priority = 100) => {
                    if (!(instance instanceof PhysicsModifierType))
                         throw new Error("Not a PhysicsModifierType component.");

                    this.physicsModifiers.push({
                         Instance: instance,
                         Priority: priority
                    });

                    // Sort PhysicsModifiers by priority
                    this.physicsModifiers.sort((a, b) => a.Priority - b.Priority);
               }

               getPhysicsModifier = (id) => {

                    const subPhysicsModifiersObj = this.physicsModifiers.find(prop => prop.Instance.id === id);

                    if (subPhysicsModifiersObj) {
                         return subPhysicsModifiersObj.Instance;
                    }

                    return null;
               }

               destroyPhysicsModifier = (id) => {

                    const index = this.physicsModifiers.findIndex(prop => prop.Instance.id === id);

                    if (index !== -1) {
                         if (this.physicsModifiers[i].onDestroy)
                              this.physicsModifiers[i].onDestroy();

                         this.physicsModifiers.splice(index, 1);
                         return true;
                    }

                    return false;
               }

               clearPhysicsModifiers = () => {
                    for (var i = 0; i < this.physicsModifiers.length; i++)
                         if (this.physicsModifiers[i].onDestroy)
                              this.physicsModifiers[i].onDestroy();

                    this.physicsModifiers[i] = [];
               }

               registerCollisionModifier = (instance, priority = 100) => {
                    if (!(instance instanceof CollisionModifierType))
                         throw new Error("Not a CollisionModifierType component.");

                    this.collisionModifiers.push({
                         Instance: instance,
                         Priority: priority
                    });

                    // Sort CollisionModifiers by priority
                    this.collisionModifiers.sort((a, b) => a.Priority - b.Priority);
               }

               getCollisionModifier = (id) => {

                    const subCollisionModifiersObj = this.collisionModifiers.find(prop => prop.Instance.id === id);

                    if (subCollisionModifiersObj) {
                         return subCollisionModifiersObj.Instance;
                    }

                    return null;
               }

               destroyCollisionModifier = (id) => {

                    const index = this.collisionModifiers.findIndex(prop => prop.Instance.id === id);

                    if (index !== -1) {
                         if (this.collisionModifiers[i].onDestroy)
                              this.collisionModifiers[i].onDestroy();

                         this.collisionModifiers.splice(index, 1);
                         return true;
                    }

                    return false;
               }

               clearCollisionModifiers = () => {
                    for (var i = 0; i < this.collisionModifiers.length; i++)
                         if (this.collisionModifiers[i].onDestroy)
                              this.collisionModifiers[i].onDestroy();

                    this.collisionModifiers[i] = [];
               }

               onTick(timeStamp, deltaTime) {
                    super.onTick(timeStamp, deltaTime);

                    for (var i = 0; i < this.physicsModifiers.length; i++)
                         this.physicsModifiers[i].Instance.onTick(timeStamp, deltaTime);

                    // update position based on velocity
                    this.x += this.vectorX * deltaTime;
                    this.y += this.vectorY * deltaTime;
                    this.rotation += this.rotationSpeed * deltaTime;
               }

               onCollision(collisionObjects) {

                    if (this.onCollide) 
                         this.onCollide(collisionObjects);

                    this.vectorX2 = this.vectorX;
                    this.vectorY2 = this.vectorY;
                    this.rotationSpeed2 = this.rotationSpeed;

                    for (var i = 0; i < this.collisionModifiers.length; i++) {

                         console.log("collision mod", this.collisionModifiers[i])

                         this.collisionModifiers[i].Instance.onCollision(collisionObjects);
                    }
               }

               onCollisionVectorCommit() {
                    this.vectorX = this.vectorX2;
                    this.vectorY = this.vectorY2;
                    this.rotationSpeed = this.rotationSpeed2;
               }

               onRender(context = null) {

                    if (OneSparkJs.Debug) {
                         if (this.collisionBorder) {
                              const shape = $1S.Physics.Collisions.getAbsoluteBorder(this.x, this.y, this.collisionBorder);
                              context.strokeStyle = 'red'; // Set the stroke color to red
                              context.lineWidth = 1; // Set the line width to 1 pixel

                              // Begin drawing the hexagon shape
                              context.beginPath();
                              context.moveTo(shape[0].x, shape[0].y); // Move to the first vertex
                              for (let i = 1; i < shape.length; i++) {
                                   context.lineTo(shape[i].x, shape[i].y); // Draw a line to each subsequent vertex
                              }
                              context.closePath(); // Close the path
                              context.stroke(); // Draw the stroke
                         }
                    }

                    super.onRender(context);
               }
          }

          class ThrustModifer extends PhysicsModifierType {

               onInit(properties) {
                    this.thrust = properties.acceleration; // acceleration in pixels/second^2
                    this.speedCap = properties.speedCap;
                    this.thrusts = {
                         up: false,
                         down: false,
                         left: false,
                         right: false,
                         forward: false,
                         backward: false
                    };
               }

               isAccelerating() {
                    return this.thrusts.up || this.thrusts.down || this.thrusts.left || this.thrusts.right || this.thrusts.forward || this.thrusts.backward;
               }

               moveForwardStart() {
                    this.thrusts.forward = true;
               }

               moveBackwardStart() {
                    this.thrusts.backward = true;
               }

               moveUpStart() {
                    this.thrusts.up = true;
               }

               moveDownStart() {
                    this.thrusts.down = true;
               }

               moveLeftStart() {
                    this.thrusts.left = true;
               }

               moveRightStart() {
                    this.thrusts.right = true;
               }

               moveForwardStop() {
                    this.thrusts.forward = false;
               }

               moveBackwardStop() {
                    this.thrusts.backward = false;
               }

               moveUpStop() {
                    this.thrusts.up = false;
               }

               moveDownStop() {
                    this.thrusts.down = false;
               }

               moveLeftStop() {
                    this.thrusts.left = false;
               }

               moveRightStop() {
                    this.thrusts.right = false;
               }

               onUpdate(timeStamp, deltaTime) {
                    let thrustCount = 0;
                    if (this.thrusts.up) thrustCount++;
                    if (this.thrusts.down) thrustCount++;
                    if (this.thrusts.left) thrustCount++;
                    if (this.thrusts.right) thrustCount++;
                    if (this.thrusts.forward) thrustCount++;
                    if (this.thrusts.backward) thrustCount++;

                    if (thrustCount > 0) {
                         const deltaAcc = this.thrust / thrustCount;

                         if (this.thrusts.up) this.target.vectorY -= deltaAcc;
                         if (this.thrusts.down) this.target.vectorY += deltaAcc;
                         if (this.thrusts.left) this.target.vectorX -= deltaAcc;
                         if (this.thrusts.right) this.target.vectorX += deltaAcc;

                         if (this.thrusts.forward) {
                              const angle = this.target.rotation * (Math.PI / 180);
                              this.target.vectorX += deltaAcc * Math.cos(angle);
                              this.target.vectorY += deltaAcc * Math.sin(angle);
                         }

                         if (this.thrusts.backward) {
                              const angle = this.target.rotation * (Math.PI / 180);
                              this.target.vectorX -= (deltaAcc * Math.cos(angle));
                              this.target.vectorY -= (deltaAcc * Math.sin(angle));
                         }

                         // Enforce speed limit
                         if (this.speedCap > 0) {
                              const currentSpeed = Math.sqrt(this.target.vectorX ** 2 + this.target.vectorY ** 2);
                              if (currentSpeed > this.speedCap) {
                                   const scaleFactor = this.speedCap / currentSpeed;
                                   this.target.vectorX *= scaleFactor;
                                   this.target.vectorY *= scaleFactor;
                              }
                         }
                    }
               }
          }

          class FrictionModifier extends PhysicsModifierType {

               onInit(properties) {
                    this.friction = properties.frictionCoefficient; // friction in pixels/second^2
               }

               onUpdate(timeStamp, deltaTime) {
                    // apply friction to slow down the velocity of the target object
                    const frictionX = this.target.vectorX > 0 ? -1 : 1;
                    const frictionY = this.target.vectorY > 0 ? -1 : 1;
                    const deltaVelX = Math.abs(this.target.vectorX) * this.friction * deltaTime * frictionX;
                    const deltaVelY = Math.abs(this.target.vectorY) * this.friction * deltaTime * frictionY;

                    if (Math.abs(deltaVelX) > Math.abs(this.target.vectorX)) {
                         this.target.vectorX = 0;
                    } else {
                         this.target.vectorX += deltaVelX;
                    }

                    if (Math.abs(deltaVelY) > Math.abs(this.target.vectorY)) {
                         this.target.vectorY = 0;
                    } else {
                         this.target.vectorY += deltaVelY;
                    }
               }
          }

          class EnvironmentalGravityModifier extends PhysicsModifierType {

               onInit(properties) {
                    this.gravity = properties.gravity; // gravity in pixels/second^2
                    this.direction = properties.direction; // normalized vector representing the direction of gravity force
               }

               onUpdate(timeStamp, deltaTime) {
                    // apply gravity force to accelerate the target object
                    const gravityForceX = this.direction.x * this.gravity;
                    const gravityForceY = this.direction.y * this.gravity;
                    const deltaVelX = gravityForceX * deltaTime;
                    const deltaVelY = gravityForceY * deltaTime;

                    this.target.vectorX += deltaVelX;
                    this.target.vectorY += deltaVelY;
               }
          }

          class GravitationalAttractionModifier extends PhysicsModifierType {
               
               onInit(properties) {
                    this.gravityConstant = properties.gravityConstant;
               }

               onUpdate(timeStamp, deltaTime) {
                    var stage = $1S.Renderer.get();

                    console.log(stage);

                    var stageObjects = stage.Instance.stageProps;

                    for (var i = 0; i < stageObjects.length; i++) {
                         var stageObject = stageObjects[i].Instance;

                         if (stageObject instanceof PhysicsBoundType) {

                              var mass = stageObject.mass;
                              var x = stageObject.x;
                              var y = stageObject.y;

                              if (stageObject.id !== this.target.id) {

                                   // calculate distance between target and stage object
                                   var distX = x - this.target.x;
                                   var distY = y - this.target.y;
                                   var distance = Math.sqrt(distX * distX + distY * distY);

                                   if (distance != 0) {
                                        // calculate gravitational force on target
                                        var force = (this.gravityConstant * mass) / (distance);
                                        var forceX = force * distX / distance;
                                        var forceY = force * distY / distance;

                                        // apply force to target
                                        this.target.vectorX += forceX * deltaTime;
                                        this.target.vectorY += forceY * deltaTime;
                                   }
                              }

                         }
                    }
               }

          }

          class BounceModifier extends PhysicsModifierType {

               onInit(properties) {
                    this.width = properties.width;
                    this.height = properties.height;
                    this.bounceReduction = properties.bounceReduction;
               }

               onUpdate(timeStamp, deltaTime) {
                    // check if the target object has hit the left or right side of the canvas
                    if (this.target.x - this.target.width / 2 < 0) {
                         this.target.x = this.target.width / 2;
                         this.target.vectorX = -this.target.vectorX;
                    } else if (this.target.x + this.target.width / 2 > this.width) {
                         this.target.x = this.width - this.target.width / 2;
                         this.target.vectorX = -this.target.vectorX;
                    }

                    // check if the target object has hit the top or bottom of the canvas
                    if (this.target.y - this.target.height / 2 < 0) {
                         this.target.y = this.target.height / 2;
                         this.target.vectorY = -this.target.vectorY;
                    } else if (this.target.y + this.target.height / 2 > this.height) {
                         this.target.y = this.height - this.target.height / 2;
                         this.target.vectorY = -this.target.vectorY + this.bounceReduction;
                         if (this.target.vectorY > 0) this.target.vectorY = 0;
                    }
               }
          }

          class WrapAroundModifier extends PhysicsModifierType {

               onInit(properties) {
                    this.width = properties.width;
                    this.height = properties.height;
               }

               onUpdate(timeStamp, deltaTime) {
                    if (this.target.x < -this.target.width / 2) {
                         this.target.x = this.width + this.target.width / 2;
                    } else if (this.target.x > this.width + this.target.width / 2) {
                         this.target.x = -this.target.width / 2;
                    }

                    if (this.target.y < -this.target.height / 2) {
                         this.target.y = this.height + this.target.height / 2;
                    } else if (this.target.y > this.height + this.target.height / 2) {
                         this.target.y = -this.target.height / 2;
                    }
               }
          }

          class RotateTowardsVectorModifier extends PhysicsModifierType {

               onInit(properties) {
                    this.active = true;
                    this.rotationSpeed = properties.rotationSpeed; // default rotation speed
               }

               onUpdate(timeStamp, deltaTime) {
                    if (this.active) {
                         // calculate the angle between the current rotation and the target vector
                         const targetAngle = Math.atan2(this.target.vectorY, this.target.vectorX);
                         const currentAngle = targetAngle * 180 / Math.PI;

                         this.target.rotationSpeed = 0;
                         this.target.rotation = currentAngle;
                    }
               }
          }

          class BounceCollision extends CollisionModifierType {

               onCollision(collisionObjects) {

                    for (let i = 0; i < collisionObjects.length; i++) {
                         const collisionObject = collisionObjects[i];

                         const totalMass = this.target.mass + collisionObject.mass;

                         // calculate the new velocity components for objectVector1 after collision
                         const newVelX1 = (this.target.mass - collisionObject.mass) / totalMass * this.target.vectorX2 +
                              (2 * collisionObject.mass / totalMass) * collisionObject.vectorX;
                         const newVelY1 = (this.target.mass - collisionObject.mass) / totalMass * this.target.vectorY2 +
                              (2 * collisionObject.mass / totalMass) * collisionObject.vectorY;

                         this.target.vectorX2 = newVelX1;
                         this.target.vectorY2 = newVelY1;
                    }
               }

          }

          class Extension extends $1S.Application.ExtensionType {

               constructor() {
                    super(0);
               };

               onPostTick = (timeStamp, deltaTime) => {
                    this.detectCollisions();
               }

               detectCollisions = () => {

                    const stage = $1S.Renderer.get();

                    if (!stage) return;

                    var pendingCommits = [];

                    // Find objects that give and take collisions
                    const givesCollisions = stage.Instance.stageProps.filter(prop => prop.Instance instanceof $1S.Physics.Types.PhysicsBoundType && prop.Instance.givesCollisions);
                    const takesCollisions = stage.Instance.stageProps.filter(prop => prop.Instance instanceof $1S.Physics.Types.PhysicsBoundType && prop.Instance.takesCollisions);

                    // Check for collisions
                    for (const takes of takesCollisions) {

                         const takesBorder = this.getAbsoluteBorder(takes.Instance.x + (takes.Instance.width / 2), takes.Instance.y + (takes.Instance.height / 2), takes.Instance.collisionBorder);

                         const collisions = givesCollisions
                              .filter(gives => takes.Instance.id !== gives.Instance.id)
                              .filter(gives => this.doPolygonsIntersect(takesBorder, this.getAbsoluteBorder(gives.Instance.x + (gives.Instance.width / 2), gives.Instance.y + (gives.Instance.height / 2), gives.Instance.collisionBorder)))
                              .map(gives => gives.Instance);

                         const newCollisions = collisions.filter(collision => !takes.Instance.collisions.includes(collision.id));

                         takes.Instance.collisions = [...new Set([...takes.Instance.collisions.filter(collisionId => collisions.some(collision => collision.id === collisionId)), ...collisions.map(collision => collision.id)])];

                         if (newCollisions.length > 0) {
                              pendingCommits.push(takes);

                              var gives = newCollisions[0];

                              takes.Instance.onCollision(newCollisions);
                         }
                    }

                    for (const pending of pendingCommits) {
                         pending.Instance.onCollisionVectorCommit();
                    }

               }

               getAbsoluteBorder = (midX, midY, relBorder) => {
                    const absBorder = [];
                    for (let i = 0; i < relBorder.length; i++) {
                         const x = midX + relBorder[i].x;
                         const y = midY + relBorder[i].y;
                         absBorder.push({ x, y });
                    }
                    return absBorder;
               }

               createCollisionBorderBox = (width, height) => {
                    return [
                         { x: +(width / 2), y: -(height / 2) },
                         { x: +(width / 2), y: +(height / 2) },
                         { x: -(width / 2), y: +(height / 2) },
                         { x: -(width / 2), y: -(height / 2) }
                    ];
               }

               createCollisionBorderHexagon = (width, height) => {
                    return [
                         { x: -(width / 2 + 2), y: 0 },
                         { x: -(width / 4 + 1), y: (height / 2 + 1) },
                         { x: width / 4 + 1, y: (height / 2 + 1) },
                         { x: width / 2 + 2, y: 0 },
                         { x: width / 4 + 1, y: -(height / 2 + 1) },
                         { x: -(width / 4 + 1), y: -(height / 2 + 1) }
                    ];
               }

               doPolygonsIntersect = (pg1, pg2) => {
                    // Check if any of the edges overlap
                    for (let i = 0; i < pg1.length; i++) {
                         const p1 = pg1[i];
                         const p2 = i === pg1.length - 1 ? pg1[0] : pg1[i + 1];
                         for (let j = 0; j < pg2.length; j++) {
                              const q1 = pg2[j];
                              const q2 = j === pg2.length - 1 ? pg2[0] : pg2[j + 1];
                              if (this.doLinesIntersect(p1, p2, q1, q2)) {
                                   return true;
                              }
                         }
                    }

                    // Check if one polygon is inside the other
                    if (this.isPointInsidePolygon(pg1[0], pg2) || this.isPointInsidePolygon(pg2[0], pg1)) {
                         return true;
                    }

                    // If we made it this far, the polygons don't intersect
                    return false;
               }

               doLinesIntersect = (p1, p2, q1, q2) => {
                    // Calculate the direction of the lines
                    const dirP = { x: p2.x - p1.x, y: p2.y - p1.y };
                    const dirQ = { x: q2.x - q1.x, y: q2.y - q1.y };

                    // Calculate the determinant of the matrix formed by the direction vectors
                    const det = dirP.x * dirQ.y - dirP.y * dirQ.x;

                    // If the determinant is zero, the lines are parallel
                    if (det === 0) {
                         return false;
                    }

                    // Calculate the intersection point of the lines
                    const dx = q1.x - p1.x;
                    const dy = q1.y - p1.y;
                    const t = (dx * dirQ.y - dy * dirQ.x) / det;
                    const u = (dx * dirP.y - dy * dirP.x) / det;

                    // If the intersection point is on both lines, they intersect
                    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
               }

               isPointInsidePolygon = (point, polygon) => {
                    let inside = false;
                    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                         const pi = polygon[i];
                         const pj = polygon[j];
                         const intersect = (pi.y > point.y) !== (pj.y > point.y) &&
                              (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x);
                         if (intersect) {
                              inside = !inside;
                         }
                    }
                    return inside;
               }

          }

          const Ext = new Extension();

          return {
               PhysicsBoundType,
               ThrustModifer,
               EnvironmentalGravityModifier,
               GravitationalAttractionModifier,
               FrictionModifier,
               BounceModifier,
               WrapAroundModifier,
               RotateTowardsVectorModifier,
               BounceCollision,
               Ext
          }
     })();

     // Public API
     global.$1S.Physics = {
          Types: {
               PhysicsBoundType: OneSparkJs.Physics.PhysicsBoundType
          },
          Motion: {
               Thrust: OneSparkJs.Physics.ThrustModifer,
               Friction: OneSparkJs.Physics.FrictionModifier,
               EnvironmentalGravity: OneSparkJs.Physics.EnvironmentalGravityModifier,
               GravitationalAttraction: OneSparkJs.Physics.GravitationalAttractionModifier,
               Bounce: OneSparkJs.Physics.BounceModifier,
               WrapAround: OneSparkJs.Physics.WrapAroundModifier,
               RotateTowardsVector: OneSparkJs.Physics.RotateTowardsVectorModifier
          },
          Collisions: {
               Modifiers: {
                    Bounce: OneSparkJs.Physics.BounceCollision
               },
               createBox: OneSparkJs.Physics.Ext.createCollisionBorderBox,
               createHexagon: OneSparkJs.Physics.Ext.createCollisionBorderHexagon,
               getAbsoluteBorder: OneSparkJs.Physics.Ext.getAbsoluteBorder
          },
          Spacial: {
               doPolygonsIntersect: OneSparkJs.Physics.Ext.doPolygonsIntersect,
               doLinesIntersect: OneSparkJs.Physics.Ext.doLinesIntersect,
               isPointInsidePolygon: OneSparkJs.Physics.Ext.doPolygonsOverlap
          }
     };

})(typeof window !== 'undefined' ? window : global);
