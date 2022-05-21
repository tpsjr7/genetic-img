export function Canvas(canvasElem){
    let _canvas = canvasElem;
    let ctx = _canvas.getContext('2d');
    let currentX, currentY, theta = 0;
    let newX, newY;

    let _transform = function(x, y) {
        newX = x + _canvas.width / 2;
        newY = y + _canvas.height / 2;
    }

    let _checkBounds = function() {
        return newY < _canvas.height
            && newY > 0
            && newX < _canvas.width
            && newX > 0;
    }

    this.lastDrawDistance = 0;
    this.moveTo = function(x, y) {
        _transform(x, y);
        if (_checkBounds()) {
            currentX = newX;
            currentY = newY;
            ctx.moveTo(currentX, currentY);
            return true;
        }
        return false;
    }

    this.forward = function(dist) {
        let rads = Math.PI / 180 * theta;
        newX = currentX + dist * Math.cos(rads);
        newY = currentY + dist * Math.sin(rads);
        if (_checkBounds()) {
            currentX = newX;
            currentY = newY;
            this.lastDrawDistance = dist;
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            return true;
        }
        return false;
    }

    this.turn = function(degrees) {
        theta += degrees;
    }
}

