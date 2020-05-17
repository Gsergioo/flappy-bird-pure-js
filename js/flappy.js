function createTag(tagName, className){
    const element = document.createElement(tagName);
    element.className = className;
    return element;
}   

function Barrier(reverse = false, position = "Top"){
    position = position === "Top" ? "topsquares" : "bottomsquares";
    this.element = createTag("div", position);

    const border = createTag("div", "small_square");
    const body = createTag("div", "big_square");

    this.element.appendChild(reverse ? body : border);
    this.element.appendChild(reverse ? border : body);
    this.setHeight = height => body.style.height = `${height}px`;
}


function Obstacle(height, opening, x){
    this.element = createTag("div", "obstacle");
    
    this.top = new Barrier(true, "Top");
    this.bottom = new Barrier(false, "Bottom");

    this.element.appendChild(this.top.element);
    this.element.appendChild(this.bottom.element);

    this.sortOpening = () => {
        const topHeight = Math.random() * (height - opening);
        const bottomHeight = height - topHeight - opening;
        this.top.setHeight(topHeight);
        this.bottom.setHeight(bottomHeight);
    }

    this.getX = () => parseInt(this.element.style.left.split("px")[0]);
    this.setX = x => this.element.style.left = `${x}px`;
    this.getWidth = () => this.element.clientWidth;

    this.sortOpening();
    this.setX(x);
}

function Obstacles(height, width, opening, space, notifyPoint){
    this.pairs = [
        new Obstacle(height, opening, width),
        new Obstacle(height, opening, width + space),
        new Obstacle(height, opening, width + space * 2),
        new Obstacle(height, opening, width + space * 3)
    ]

    const displacement = 3;
    this.animate = () => {
        this.pairs.forEach(element => {
            element.setX(element.getX() - displacement);
            
            if(element.getX() < -element.getWidth()){
                element.setX(element.getX() + space * this.pairs.length);
                element.sortOpening();
            }

            const mid = width / 2;
            const crossedMid = element.getX() + displacement >= mid 
                && element.getX() < mid;
            if(crossedMid) notifyPoint();
        });
    }

}

function Bird(gameHeight){
    let flying = false;

    this.element = createTag("img", "bird");
    this.element.src = "img/passaro.png";

    this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
    this.setY = (y) => this.element.style.bottom = `${y}px`;

    window.onkeyup = e => flying = false;
    window.onkeydown = e => flying = true;

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5);
        const maxHeight = gameHeight - this.element.clientHeight;

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2);
}

function Progress(){
    this.element = createTag("span", "points");
    this.atualizePoints = (points) => {
        this.element.innerHTML = points;
    }
    this.atualizePoints(0);
}

function Gameover() {
    this.element = createTag("div", "gameover");
    self = this;
    function setMessage() {
        self.element.innerHTML = "Gameover, press any button to retry";
    }
    setMessage();
}

function overlapping(elementA, elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()
    
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
} 

function colision(bird, obstacle) {
    let colided = false
    obstacle.pairs.forEach(pairOfObstacle => {
        if (!colided) {
            const top = pairOfObstacle.top.element;
            const bottom = pairOfObstacle.bottom.element;
            colided = overlapping(bird.element, top)
                || overlapping(bird.element, bottom);
        }
    })
    return colided;
}

function FlappyBird() {
    let points = 0;

    const gameArea = document.querySelector("[wm-flappy]");
    const height = gameArea.clientHeight;
    const width = gameArea.clientWidth;

    const progress = new Progress();
    const gameover = new Gameover();
    const obstacles = new Obstacles(height, width, 200, 400, 
        () => progress.atualizePoints(++points));
    const bird = new Bird(height);


    gameArea.appendChild(progress.element);
    gameArea.appendChild(bird.element);
    obstacles.pairs.forEach(pair => gameArea.appendChild(pair.element));

    this.start = () => {
        const timer = setInterval(()=> {
            obstacles.animate();
            bird.animate();
            console.log("MERDA");
            if(colision(bird, obstacles)){
                gameArea.appendChild(gameover.element);
                clearInterval(timer);
                window.onkeypress = e => {
                    window.location.reload();
                }
            }
        }, 20);
    }
}


new FlappyBird().start();