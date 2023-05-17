//classes can be imported from ANY web address, allowing you to distribute components.
const GameScreen = await $1S.import("Game", "./screen/game.js");

class MainApp {

     constructor() {
          //notice we do not make local references so the engine can create/destroy objects as needed across components.
          this.startScreen = new GameScreen("game");

          setTimeout(function () {
               //we start on the start screen
               $1S.Renderer.switchTo("game");
          }, 1000);

     }

     onStart() {
     }

     onTick(timeStamp, deltaTime) {

     }

}

$1S.registerType(MainApp, "MainApp");




