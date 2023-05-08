//classes can be imported from ANY web address, allowing you to distribute components.
const StartScreen = await $1S.import("Start", "./screen/start.js");
const GameScreen = await $1S.import("Game", "./screen/game.js");

class MainApp {

     constructor() {
          //notice we do not make local references so the engine can create/destroy objects as needed across components.  
          this.startScreen = new StartScreen("startScreen");
          this.gameScreen = new GameScreen("gameScreen");

          //we start on the start screen
          $1S.Renderer.switchTo("startScreen");
     }

     onStart() {
     }

     stageEventHandler(eventName, sender) {


          if (eventName == "start") {
               this.gameScreen.newGame();
               $1S.Renderer.switchTo("gameScreen");
          }

          if (eventName == "exit")
               $1S.Renderer.switchTo("startScreen");

     }

     onTick(timeStamp, deltaTime) {

     }

}

$1S.registerType(MainApp, "MainApp");




