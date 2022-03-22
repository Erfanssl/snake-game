const canvas = document.querySelector('#canvas');
const overlay = document.querySelector('.overlay');
const overlayStart = document.querySelector('.overlay .start');
const overlayEnd = document.querySelector('.overlay .end');
const startGame = document.querySelector('.overlay button');
let gameOver = true; // to handle the start game button better

const context = canvas.getContext('2d');

canvas.height = window.innerHeight - 8;
canvas.width = window.innerWidth - 8;

function draw() {
    const gr = context.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height / 2);
    gr.addColorStop(.2, '#00030c');
    gr.addColorStop(.4, '#000311');
    gr.addColorStop(.8, '#00020e');
    context.fillStyle = gr;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

class SnakePart {
    constructor(x, y, color, width, height, id = null, speed = 8) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = width;
        this.height = height;
        this.direction = {
            current: 'right',
            next: 'right'
        };
        this.breakpoints = [];
        this.speed = speed;
    }
}

function randomXGenerator() {
    return Math.ceil(Math.random() * ((canvas.width - 200) - 100)) + 100;
}

function randomYGenerator() {
    return Math.ceil(Math.random() * ((canvas.height - 200) - 100)) + 100;
}

window.onkeydown = (event) => {
    if (event.keyCode === 13 && startGame && gameOver) {
        startGame.click();
    }
};

startGame.onclick = () => {
    overlay.classList.add('hide');
    overlayStart.classList.add('hide');
    startGame.classList.add('hide');
    runGame();
};

function runGame() {
    // create snake from SnakePart
    const baseParts = 10;
    const color = '#aef67a';
    const size = 14;
    const randXStart = randomXGenerator();
    const randYStart = randomYGenerator();
    const margin = 2;
    const snakeParts = [];
    const horizontalMovement = ['left', 'right'];
    const verticalMovement = ['top', 'bottom'];
    let finish = false;
    let foods = [];
    let keyboardInterval = true;
    let score = 0;
    gameOver = false;

    for (let i = 0; i < baseParts; i++) {
        let x = randXStart;
        const id = baseParts - i;

        if (i !== 0) {
            x = snakeParts[i - 1].x + size + margin;
        }

        const snakePart = new SnakePart(x, randYStart, color, size, size, id);
        snakeParts.push(snakePart);

        context.fillStyle = snakePart.color;
        context.fillRect(snakePart.x, snakePart.y, snakePart.width, snakePart.height);
    }

    function breakpointAdder(headSnake, direction) {
        // if (
        //     headSnake.x <= 0 ||
        //     headSnake.y <= 0 ||
        //     headSnake.x >= canvas.width ||
        //     headSnake.y >= canvas.height
        // ) return;

        snakeParts.forEach(snakePart => {
            snakePart.breakpoints.push({
                x: headSnake.x,
                y: headSnake.y,
                direction
            });
        });
    }

    function collisionDetector(objOne, objTwo) {
        // each object should have x, y, width and height
        if (
            !(objOne.x + objOne.width < objTwo.x || objOne.x > objTwo.x + objTwo.width) &&
            !(objOne.y + objOne.height < objTwo.y || objOne.y > objTwo.y + objTwo.height)
        ) return true;

        return false;
    }

    function randomColorGenerator() {
        const r = Math.floor(Math.random() * 156) + 100;
        const g = Math.floor(Math.random() * 156) + 100;
        const b = Math.floor(Math.random() * 156) + 100;
        return `rgb(${ r }, ${ g }, ${ b })`;
    }


    // add food
    function addFood() {
        const x = randomXGenerator();
        const y = randomYGenerator();
        const color = randomColorGenerator();

        const food = new SnakePart(x, y, color, 10, 10);

        foods.push(food);
    }

    window.addEventListener('keydown', (event) => {
        const headSnake = snakeParts[snakeParts.length - 1];

        if (!keyboardInterval) return;

        if ([37, 38, 39, 40].includes(event.keyCode)) {
            keyboardInterval = false;

            setTimeout(() => {
                keyboardInterval = true;
            }, 30);
        }

        switch (event.keyCode) {
            case 37: // left
                if (!horizontalMovement.includes(headSnake.direction.current)) breakpointAdder(headSnake, 'left');
                break;
            case 38: // top
                if (!verticalMovement.includes(headSnake.direction.current)) breakpointAdder(headSnake, 'top');
                break;
            case 39: // right
                if (!horizontalMovement.includes(headSnake.direction.current)) breakpointAdder(headSnake, 'right');
                break;
            case 40: // bottom
                if (!verticalMovement.includes(headSnake.direction.current)) breakpointAdder(headSnake, 'bottom');
                break;
        }
    });

    function move() {
        if (finish) return;

        draw();

        // draw foods
        foods.forEach(food => {
            context.fillStyle = food.color;
            context.beginPath();
            context.arc(food.x, food.y, food.width * 1.15, 0, Math.PI * 2);
            context.fill();
            context.closePath();
        });

        // we check to see if there is any food near the head of the snake
        const headPart = snakeParts[snakeParts.length - 1];
        foods.forEach(food => {
            const distance = Math.sqrt((food.y - headPart.y) ** 2 + (food.x - headPart.x) ** 2);

            if (distance <= 80) {
                food.y += ((headPart.y - food.y) / 7);
                food.x += ((headPart.x - food.x) / 7);
            }
        });

        snakeParts.forEach(snakePart => {
            // check for any collisions
            // collision of snake to itself
            const headPart = snakeParts[snakeParts.length - 1];
            const oneBeforeHeadPart = snakeParts[snakeParts.length - 2];
            const twoBeforeHeadPart = snakeParts[snakeParts.length - 3];
            const threeBeforeHeadPart = snakeParts[snakeParts.length - 4];
            const notCheckForCollision = [headPart, oneBeforeHeadPart, twoBeforeHeadPart, threeBeforeHeadPart];

            if (!notCheckForCollision.includes(snakePart)) {
                const isCollided = collisionDetector(headPart, snakePart);
                if (isCollided) {
                    finish = true;
                    // show the overlay
                    overlay.classList.remove('hide');
                    overlayEnd.classList.remove('hide');
                    startGame.classList.remove('hide');
                    overlayEnd.innerText = `Score: ${ score }`;
                    gameOver = true;
                }
            }
        });

        snakeParts.forEach(snakePart => {
            // check for any collisions
            // collision of snake to the food
            // we only check the first 10 parts (from head) to avoid to much unnecessary calculation
            const first10Parts = snakeParts.slice(-10);
            if (!first10Parts.includes(snakePart)) return;

            foods.forEach(food => {
                const isCollided = collisionDetector(food, snakePart);

                if (isCollided) {
                    // add 10 score
                    score += 10;

                    // create new snake part
                    const snakeTail = snakeParts[0];
                    let x = snakeTail.x;
                    let y = snakeTail.y;

                    switch (snakeTail.direction.current) {
                        case "top":
                            y += (margin + size);
                            break;
                        case "right":
                            x -= (margin + size);
                            break;
                        case "bottom":
                            y -= (margin + size);
                            break;
                        case "left":
                            x += (margin + size);
                            break;
                    }

                    const newPart = JSON.parse(JSON.stringify(snakeTail));
                    newPart.x = x;
                    newPart.y = y;
                    newPart.id = snakeTail.id + 1;
                    snakeParts.unshift(newPart);

                    foods = foods.filter(f => f !== food);

                    let randFood = Math.floor(Math.random() * 3);
                    if (foods.length <= 1) randFood = 2;

                    for (let i = 0; i < randFood; i++) {
                        addFood();
                    }
                }
            });
        });

        // calculation for the next render
        snakeParts.forEach(snakePart => {
            if (snakePart.breakpoints.length) {
                const currentBreakpoint = snakePart.breakpoints[0];

                if (snakePart.x === currentBreakpoint.x && snakePart.y === currentBreakpoint.y) {
                    snakePart.direction.next = currentBreakpoint.direction;
                    snakePart.breakpoints.shift();
                }
            }

            if (snakePart.direction.next === 'top') snakePart.y -= snakePart.speed;
            else if (snakePart.direction.next === 'right') snakePart.x += snakePart.speed;
            else if (snakePart.direction.next === 'bottom') snakePart.y += snakePart.speed;
            else if (snakePart.direction.next === 'left') snakePart.x -= snakePart.speed;

            snakePart.direction.current = snakePart.direction.next;
        });

        snakeParts.forEach(snakePart => {
            // check for edges
            if (snakePart.x >= canvas.width) snakePart.x = Math.abs(canvas.width - snakePart.x) + 1;
            else if (snakePart.x <= 0) snakePart.x += canvas.width + 1;
            else if (snakePart.y >= canvas.height) snakePart.y = Math.abs(canvas.height - snakePart.y) + 1;
            else if (snakePart.y <= 0) snakePart.y += canvas.height + 1;
        });

        // render
        snakeParts.forEach(snakePart => {
            context.fillStyle = snakePart.color;
            context.beginPath();
            // context.fillRect(snakePart.x, snakePart.y, snakePart.width, snakePart.height);
            context.arc(snakePart.x, snakePart.y, snakePart.width, 0, Math.PI * 2);
            context.fill();
            context.closePath();
        });

        requestAnimationFrame(move);
    }

    function runner() {
        move();
        addFood();
        addFood();
    }

    runner();
}