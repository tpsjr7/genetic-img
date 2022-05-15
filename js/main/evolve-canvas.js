class CanvasManager {
  canvases = [];
  nCanvases;
  window;
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
      x: col * width,
      y: row * height
    };
  }
}
