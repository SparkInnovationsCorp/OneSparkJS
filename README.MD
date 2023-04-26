# OneSparkJS

<p>OneSparkJS is a lightweight JavaScript game engine that was designed with a minimalistic approach, requiring only HTML5 and canvas as dependencies. The engine was created to be highly extensible, and allows developers to create custom extensions which can be easily integrated into their games. The engine's modular design and extensible architecture make it an ideal choice for developers who want to create their own game engines or extend existing ones. Additionally, the engine has no third-party dependencies, which reduces the overhead of external libraries and streamlines the development process.</p><p>The engine's Physics extension is a great example of its extensibility. It allows developers to add physics simulations to their games without having to implement complex physics calculations from scratch. The Physics extension includes a range of motion modifiers such as Thrust, EnvironmentalGravity, GravitationalAttraction, Friction, Bounce, WrapAround, and RotateTowardsVector. The Collision modifiers provide functionalities such as detecting collisions between objects, and creating collision borders for objects of different shapes. The Spatial module provides geometrical functions such as detecting intersection points, determining if a point is inside a polygon, and detecting if two lines intersect.</p><p>OneSparkJS is easy to set up and use, making it a great choice for both experienced and novice game developers. Its simple yet powerful design allows for rapid development and deployment of games, while its extensibility makes it a flexible and versatile choice for a wide range of game development projects.</p>

<p>The OneSparkJs engine follows a theatrical metaphor, with the StageType representing a virtual stage where StageObjects are placed.  The StageObjects in the engine are hierarchical, which means that a single StageObject can be composed of a combination of other StageObjects. Further, these StageObjects can be extended with additional properties and behaviors, and can interact with each other in various ways.</p><p>In addition to the basic properties of StageObjects, they can also be extended by other libraries. For example, the Physics library extends StageObjects to respond to physical properties such as gravity and collisions, while the UI library extends StageObjects to become UI elements such as textboxes and buttons.</p><p>Assets in the engine are referenced in a JSON asset sheet, which can contain information about various types of assets including audio and images. This allows for easy management and loading of assets within the engine.</p><p>One unique feature of the engine is the ability to switch out the entire stage with another stage, similar to changing screens in a game. This can allow for different game modes or levels to be seamlessly transitioned between.</p>

<h1>Physics Engine Demo</h1> 

<p><a href="http://www.onstaging.com/onesparkjs/sample3.html">Click here to view.</a></p>

<h1>Sprite Manager, Layout Container, &amp; Asset Manager Demo </h1> 

<p><a href="http://www.onstaging.com/onesparkjs/sample2.html">Click here to view.</a></p>

<h1>Game Example: Retro Style Asteroid Blaster</h1> 

<p><a href="http://www.onstaging.com/onesparkjs/sample.html">Click here to view.  PS I made this in less than a day and its still a WIP.</a></p>

<p>Asteroid Blaster is a fast-paced, arcade-style game where players take control of a spaceship and must navigate through an asteroid field while shooting down incoming asteroids to survive. The game features simple yet challenging gameplay, with players having to dodge and weave through incoming asteroids while aiming their shots carefully to take out as many as possible. As players progress through the game, the asteroids become faster and more difficult to avoid, requiring quick reflexes and precise aiming skills to survive.</p>

<p><b>Note, this requires a keyboard. I will make a mobile version in the future.</b></p>

<h1>$1S API (1sparkjs.js)</h1> 
<p>The $1S API is a JavaScript library for building interactive web applications. It provides a set of modules that can be used to add functionality to your application, including graphics rendering, audio playback, data loading, and more.</p>

<p>The base functionality provides methods to manage and import external modules.</p>
<ul><li><p><code>importType(path: string): Object|null</code><br>This method imports a module with the given path and returns its default export, or <code>null</code> if the module doesn't exist.</p></li><li><p><code>include(path: string): void</code><br>This method includes a JavaScript file with the given path.</p></li><li><p><code>registerType(name: string, type: Object): void</code><br>This method registers a new type with the given name and constructor function.</p></li><li><p><code>getType(name: string): Object|null</code><br>This method returns the registered type with the given name, or <code>null</code> if it doesn't exist.</p></li><li><p><code>getTypeAsync(name: string): Promise&lt;Object|null&gt;</code><br>This method returns a <code>Promise</code> that resolves with the registered type with the given name, or <code>null</code> if it doesn't exist.</p></li></ul>

<h3>Application Module</h3><p>The Application module provides a set of functions for managing the application's lifecycle, loading extensions, and accessing the application's state.</p>
<h4>ExtensionType</h4>
<ul><li><code>OneSparkJs.Application.ExtensionType</code>: An enum that defines the different types of extensions that can be loaded into the application.</li></ul>
<h4>Functions</h4>
<ul><li><code>load(path: string)</code>: Load assets and extensions from a JSON file at the specified path.</li><li><code>start()</code>: Start the application.</li><li><code>startClock()</code>: Start the game loop.</li><li><code>stopClock()</code>: Stop the game loop.</li><li><code>get(key: string)</code>: Get the value of a key in the application state.</li><li><code>registerExtension(extension: object, type: ExtensionType)</code>: Register an extension of the specified type with the application.</li></ul>
<h3>Renderer Module</h3><p>The Renderer module provides a set of functions for rendering graphics on a canvas element.</p>

<h4>Type</h4>
<ul>
     <li><code>$1S.Renderer.StageType</code>: A type that defines the different types of rendering stages that can be created.</li>
</ul>

<p>The StageType in OneSparkJS can be thought of as a specific screen or level within a game. It is designed to encapsulate all the logic necessary for that particular part of the game. Once the stage has been completed, the game can transition to the next stage in the workflow.</p>
<p>The StageType is a fundamental part of the game engine, and it can contain a wide variety of elements, including sprites, UI elements, hidden barriers, and more. In essence, the StageType is responsible for managing all the components that make up a particular section of the game. It is a versatile tool that can be used to create complex and engaging games, and it forms the backbone of the game engine.</p>

<ul>
     <li><code>$1S.Renderer.StagePropType</code>: A type that defines the different types of props or objects that can be set on a rendering stage.</li>
</ul>
<p>The StagePropType is a fundamental component of the OneSparkJS game engine. It represents any object that can be rendered on the game stage, such as sprites, user interface elements, or hidden barriers. Each StagePropType object contains properties that define its position, size, and appearance, as well as methods for updating and rendering its state on the game stage.</p>
<p>One key feature of the StagePropType is its ability to interact with the game physics engine. By inheriting from the PhysicsBoundType class, a StagePropType can be given properties that define its mass, velocity, and collision behavior, enabling it to interact with other PhysicsBoundType objects on the game stage. Additionally, StagePropType objects can be extended through the use of custom modifiers, allowing for the creation of unique behaviors and interactions within the game world.</p>

<h4>Graphics Functions</h4>
<ul><li><code>setState(savedState: string)</code>: Restore a previously saved state of the canvas.</li><li><code>getState(): string</code>: Get the current state of the canvas as a data URL.</li><li><code>getContext(): CanvasRenderingContext2D</code>: Get the rendering context of the canvas.</li><li><code>getSize(): { width: number, height: number }</code>: Get the size of the canvas.</li><li><code>getStyle(): CSSStyleDeclaration</code>: Get the style object of the canvas.</li><li><code>publish()</code>: Publish the current state of the canvas to the screen.</li><li><code>attachEvent(eventType: string, eventHandler: Function)</code>: Attach an event listener to the canvas element.</li></ul>
<h4>Renderer Extension Functions</h4>
<ul><li><code>register(name: string, extension: object)</code>: Register a new rendering extension with the specified name and properties.</li><li><code>render(stageName: string, element: HTMLElement)</code>: Render the specified stage to the specified HTML element.</li><li><code>destroy(stageName: string)</code>: Destroy the specified rendering stage.</li><li><code>get(stageName: string): object</code>: Get the properties of the specified rendering stage.</li><li><code>getActiveName(): string</code>: Get the name of the currently active rendering stage.</li><li><code>switchTo(stageName: string)</code>: Switch the currently active rendering stage to the specified stage.</li></ul>
<h3>Audio Module</h3><p>The Audio module provides a set of functions for playing and stopping audio files.</p>
<h4>Functions</h4>
<ul><li><code>get(name: string): object</code>: Get the metadata for an audio file by name.</li><li><code>play(name: string, loop: boolean, volume: number)</code>: Play an audio file with the specified name, loop, and volume.</li><li><code>stop(name: string)</code>: Stop playing the audio file with the specified name.</li><li><code>stopAll()</code>: Stop playing all audio files.</li></ul>
<h3>IO Module</h3><p>The IO module provides a function for loading JSON data from a file.</p>
<h4>Functions</h4>
<ul><li><code>loadJSON(path: string): Promise&lt;any&gt;</code>: Load JSON data from a file at the specified path.</li></ul>
<h3>Helper Module</h3><p>The Helper module provides a function for generating unique IDs.</p>
<h4>Functions</h4>
<ul><li><code>newId(): string</code>: Generate a new unique ID.</li></ul>

<hr>

<h1>UI Extension API (1sparkjs.ui.js)</h1>
<p>The OneSparkJs.UI extension provides the following API:</p>
<h3><code>Ui.UiType</code></h3><p>The base class for all UI controls. Controls should extend this class and override the <code>onDraw</code> method to draw their appearance.</p>
<h4>Properties</h4>
<ul><li><code>backColor</code> (string, optional): The background color of the control. Defaults to 'transparent'.</li><li><code>textColor</code> (string, optional): The color of the control's text. Defaults to 'black'.</li><li><code>fontSize</code> (number, optional): The font size of the control's text. Defaults to 16.</li><li><code>fontFamily</code> (string, optional): The font family of the control's text. Defaults to 'Arial'.</li><li><code>textAlign</code> (string, optional): The horizontal text alignment of the control. Can be 'left', 'center', or 'right'. Defaults to 'left'.</li><li><code>isFocused</code> (boolean): Whether the control is currently in focus.</li></ul>
<h4>Methods</h4>
<ul><li><code>registerProp(instance, properties, priority)</code>: Registers the control instance with the application's renderer.</li></ul>
<h3><code>Ui.Controls.TextBox</code></h3><p>A text box control that allows the user to input and edit text.</p>
<h4>Properties</h4>
<ul><li><code>text</code> (string, optional): The initial text in the text box.</li><li><code>isEditable</code> (boolean, optional): Whether the text box is editable. Defaults to true.</li></ul>
<h4>Methods</h4>
<ul><li><code>registerEventHandlers()</code>: Registers event handlers for mouse and keyboard input.</li></ul>
<h3><code>Ui.Controls.Button</code></h3><p>A button control that triggers an action when clicked.</p>
<h4>Properties</h4>
<ul><li><code>text</code> (string, optional): The text displayed on the button.</li><li><code>onClickHandler</code> (function, optional): The function to call when the button is clicked.</li></ul>
<h4>Methods</h4>
<ul><li><code>registerEventHandlers()</code>: Registers event handlers for mouse input.</li></ul>
<h3><code>Ui.Controls.LabelControl</code></h3><p>A label control that displays text.</p>
<h4>Properties</h4>
<ul><li><code>text</code> (string, optional): The text displayed on the label.</li></ul>
<h3><code>Ui.Animate.moveTo</code></h3><p>A modifier that animates a control's movement to a new position.</p>
<h4>Methods</h4>
<ul><li><code>moveToPosition(x, y, ms, callback)</code>: Moves the control to the specified position over the specified duration.</li></ul>
<h3><code>Ui.Animate.fade</code></h3><p>A modifier that animates a control's opacity.</p>
<h4>Methods</h4>
<ul><li><code>fadeIn(ms, callback)</code>: Fades the control in over</li></ul>

<hr>
<h2>OneSpark Physics Extension API (1sparkjs.physics.js)</h2>
<p>OneSpark Physics is a lightweight and flexible physics engine that enables advanced 2D physics simulations for your applications. This extension API allows you to extend the core functionality of the engine and customize its behavior to meet your specific needs.</p>

<h3>Types</h3>
<h4><code>PhysicsBoundType</code></h4>

<p>The PhysicsBoundType is a type of object in the OneSparkJS Physics extension API that defines a physics-bound entity within the game. This entity has the physical properties of mass, velocity, acceleration, and rotation, which are used to simulate the behavior of the entity in the game's physics system.</p>
<p>The PhysicsBoundType object is designed to be used as a base class for other types of physics-bound entities in the game. When creating an object that has physics properties, it is recommended to extend the PhysicsBoundType object to take advantage of the functionality it provides.</p>
<p>The PhysicsBoundType object has a number of properties and methods that allow for the manipulation of the entity's physical properties. These include the mass, vectorX, vectorY, vectorX2, vectorY2, rotation, rotationSpeed, maxSpeed, and maxAcceleration properties. Additionally, there are methods such as addForce, setVelocity, setAcceleration, applyFriction, and applyGravity that can be used to modify the entity's physical properties.</p>
<p>One of the key features of the PhysicsBoundType object is its ability to interact with other physics-bound entities through the use of collision detection and handling. By defining the givesCollisions and takesCollisions properties on the PhysicsBoundType object, collision detection and handling can be implemented between different objects in the game.</p>

<h3>Motion Modifiers</h3>
<h4><code>ThrustModifier</code></h4><p>A modifier that applies a thrust force to an object.</p>
<h4><code>FrictionModifier</code></h4><p>A modifier that applies friction force to an object.</p>
<h4><code>EnvironmentalGravityModifier</code></h4><p>A modifier that applies a gravitational force to an object, simulating environmental gravity.</p>
<h4><code>GravitationalAttractionModifier</code></h4><p>A modifier that applies a gravitational force to an object, simulating attraction to another object.</p>
<h4><code>BounceModifier</code></h4><p>A modifier that applies a bounce effect to an object.</p>
<h4><code>WrapAroundModifier</code></h4><p>A modifier that wraps an object around the screen.</p>
<h4><code>RotateTowardsVectorModifier</code></h4><p>A modifier that rotates an object towards a target vector.</p>
<h3>Collision Modifiers</h3>
<h4><code>BounceCollision</code></h4><p>A collision modifier that applies a bounce effect to objects colliding with each other.</p>
<h3>Collision Border Utility</h3>
<h4><code>createCollisionBorderBox(width: number, height: number): Array&lt;{ x: number, y: number }&gt;</code></h4><p>A utility function that creates a collision border polygon for a rectangular object.</p>
<h4><code>createCollisionBorderHexagon(width: number, height: number): Array&lt;{ x: number, y: number }&gt;</code></h4><p>A utility function that creates a collision border polygon for a hexagonal object.</p>
<h4><code>getAbsoluteBorder(midX: number, midY: number, relBorder: Array&lt;{ x: number, y: number }&gt;): Array&lt;{ x: number, y: number }&gt;</code></h4><p>A utility function that calculates the absolute coordinates of a relative collision border polygon.</p>
<h3>Spacial Utility</h3>
<h4><code>doPolygonsIntersect(pg1: Array&lt;{ x: number, y: number }&gt;, pg2: Array&lt;{ x: number, y: number }&gt;): boolean</code></h4><p>A utility function that checks if two polygons intersect.</p>
<h4><code>doLinesIntersect(p1: { x: number, y: number }, p2: { x: number, y: number }, q1: { x: number, y: number }, q2: { x: number, y: number }): boolean</code></h4><p>A utility function that checks if two lines intersect.</p>
<h4><code>isPointInsidePolygon(point: { x: number, y: number }, polygon: Array&lt;{ x: number, y: number }&gt;): boolean</code></h4><p>A utility function that checks if a point is inside a polygon.</p>
<h2>License</h2><p>This extension API is released under the MIT License. See <a href="LICENSE" target="_new">LICENSE</a> for details.</p>
