
export class MockCanvasElement {
    style = {};
    width = 100;
    height = 100;
    getContext(){
        return {
            moveTo(){},
            lineTo(){},
            stroke(){},
            clearRect(){},
            beginPath(){},
            canvas: this
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