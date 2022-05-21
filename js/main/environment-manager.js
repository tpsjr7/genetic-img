export class EnvironmentManager {
  canvases = [];
  nCanvases;
  window;

  DRAW_WIDTH = 200; // when drawing, how many pixels vs how big it looks on screen
  DRAW_HEIGHT = 200;

  constructor(window, nCanvases) {
    this.window = window;
    this.nCanvases = nCanvases;
  }

  calcPositionForCanvas(index) {
    let cols = Math.ceil(Math.sqrt(this.nCanvases));
    let width = this.window.innerWidth / cols;
    let height = this.window.innerHeight / cols;
    let col = index % cols;
    let row = Math.floor(index / cols);
    return {
      width: width, // how wide it looks on screen
      height: height,
      x: col * width,
      y: row * height
    };
  }

  getCanvasElem(i) {
    let c = this.canvases[i];
    if (!c) throw new Error("invalid canvas number");
    return c;
  }

  createCanvases() {
    if (this.canvases.length > 0) {
      throw new Error('already created');
    }

    for (let i = 0 ; i < this.nCanvases; i++) {
      let canvas = this.window.document.createElement('canvas');
      this.canvases.push(canvas);
      this.window.document.body.appendChild(canvas);
    }
    this.positionCanvases();
  }

  positionCanvases() {
    for (let i = 0 ; i < this.canvases.length; i++) {
      let pos = this.calcPositionForCanvas(i);
      let canvas = this.canvases[i];
      canvas.width = this.DRAW_WIDTH;
      canvas.height = this.DRAW_HEIGHT;
      canvas.style.border = 'solid 1px black';
      canvas.style.position = 'absolute';
      canvas.style.left = pos.x + 'px';
      canvas.style.top = pos.y + 'px';
      canvas.style.width = pos.width + 'px';
      canvas.style.height = pos.height + 'px';
    }
  }
}
