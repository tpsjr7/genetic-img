export class MockCanvas {
    moveTo(){}
    forward(){}
    turn(){}

};

export class MockCanvasElement {
    style = {};
    getContext(){
        return {
            moveTo(){},
            lineTo(){},
            stroke(){}
        };
    }
}

export class MockWindow {
    innerWidth = 1000;
    innerHeight = 1000;
    document = {
        createElement(){
            return new MockCanvasElement();
        },
        body: {
            appendChild(){}
        }
    }
}

export class MockCanvasFactory {
    create(){
        return new MockCanvasElement();
    }
}