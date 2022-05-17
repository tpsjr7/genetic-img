class MockCanvas {
    moveTo(){}
    forward(){}
    turn(){}

};

class MockCanvasElement {
    style = {};
    getContext(){
        return {
            moveTo(){},
            lineTo(){},
            stroke(){}
        };
    }
}

class MockWindow {
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

class MockCanvasFactory {
    create(){
        return new MockCanvasElement();
    }
}