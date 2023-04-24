//classes can be imported from ANY web address, allowing you to distribute components.
const StartScreen = await $1S.import("Demo", "./screen/demo.js");

class MainApp {

     constructor() {
          //notice we do not make local references so the engine can create/destroy objects as needed across components.  
          this.startScreen = new StartScreen("startScreen");

          //we start on the start screen
          $1S.Renderer.switchTo("startScreen");
     }

     onStart() {
     }

     onTick(timeStamp, deltaTime) {

     }

}

$1S.registerType(MainApp, "MainApp");




