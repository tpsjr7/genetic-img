import {addTests, assertEquals} from "./asserts.js";
import {EnvironmentManager} from "../main/environment-manager.js";

addTests({
  testCanvasDraw() {
    let window = {
      innerHeight: 1600,
      innerWidth: 1600
    };
    let cm = new EnvironmentManager(window, 15);
    cm.headSpace = 0;
    assertEquals({x: 0, y: 0, width:400, height:400}, cm.calcPositionForCanvas(0));
    assertEquals({x: 400, y: 0, width:400, height:400}, cm.calcPositionForCanvas(1));
    assertEquals({x: 800, y: 0, width:400, height:400}, cm.calcPositionForCanvas(2));
    assertEquals({x: 1200, y: 0, width:400, height:400}, cm.calcPositionForCanvas(3));
    assertEquals({x: 0, y: 400, width:400, height:400}, cm.calcPositionForCanvas(4));
    assertEquals({x: 400, y: 400, width:400, height:400}, cm.calcPositionForCanvas(5));
    assertEquals({x: 800, y: 1200, width:400, height:400}, cm.calcPositionForCanvas(14));
  }
});
