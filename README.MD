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

<h1>Project Environment</h1> 

<p>Make sure you install bundle to compile this project correctly.</p>

<pre>
npm install --global rollup
</pre>

<p>To compile:</p>

<pre>
rollup --config rollup.config.mjs --watch --silent
</pre>

<h2>OneSparkJS License Agreement</h2>
<p>This code library, OneSparkJS, is provided under the following terms and conditions:</p><p>Non-Commercial Use:</p><p>This code may be used in any non-commercial project without the need for permission, as long as credit is given to "OneSparkJS by Spark Innovations Corp", in any accompanying documentation or README file.</p><p>Commercial Use:</p><p>If you wish to use this code in any commercial or revenue-generating project, you must obtain permission from Spark Innovations Corp. To request permission, please contact us at <a href="mailto:support@sparkinnovationscorp.com" target="_new">support@sparkinnovationscorp.com</a>.</p><p>Modification and Redistribution:</p><p>You are free to modify and redistribute this code, provided that you include this license agreement and any applicable copyright notices in any redistributed or modified code.</p><p>Disclaimer:</p><p>This code is provided "as is" and without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the code or the use or other dealings in the code.</p><p>By using this code library, you agree to these terms and conditions.</p>
