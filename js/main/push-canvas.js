export function Canvas(canvasElem){
    let _canvas = canvasElem;
    let WIDTH = _canvas.width;
    let HEIGHT = _canvas.height;
    let ctx = _canvas.getContext('2d');
    let currentX, currentY, theta = 0;
    let _moveTo = function(x, y) {
        currentY = y + HEIGHT / 2;
        currentX = x + WIDTH / 2;
    }
    _moveTo(0,0);
    this.moveTo = function(x, y) {
        _moveTo(x, y);
        ctx.moveTo(currentX, currentY);
    }
    this.forward = function(dist) {
        let rads = Math.PI / 180 * theta;
        let xNew = currentX + dist * Math.cos(rads);
        let yNew = currentY + dist * Math.sin(rads);
        currentX = xNew;
        currentY = yNew;
        ctx.lineTo(xNew, yNew);
        ctx.stroke();
    }
    this.turn = function(degrees) {
        theta += degrees;
    }
}

