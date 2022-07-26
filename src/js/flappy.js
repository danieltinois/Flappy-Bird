function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function barrier(reverse = false) {
  this.element = newElement("div", "barrier");

  const edge = newElement("div", "edge");
  const body = newElement("div", "body");
  this.element.appendChild(reverse ? body : edge);
  this.element.appendChild(reverse ? edge : body);

  this.setHeight = (height) => (body.style.height = `${height}px`);
}

// const b = new barrier(true);
// b.setHeight(300);
// document.querySelector("[wm-flappy]").appendChild(b.element);

function PairOfBarriers(height, opening, x) {
  this.element = newElement("div", "pair-of-barriers");

  this.higher = new barrier(true);
  this.bottom = new barrier(false);

  this.element.appendChild(this.higher.element);
  this.element.appendChild(this.bottom.element);

  this.drawOpening = () => {
    const topHeight = Math.random() * (height, opening);
    const lowerHeight = height - opening - topHeight;
    this.higher.setHeight(topHeight);
    this.bottom.setHeight(lowerHeight);
  };

  this.getX = () => parseInt(this.element.style.left.split("px")[0]);
  this.setX = (x) => (this.element.style.left = `${x}px`);
  this.getWidth = () => this.element.clientWidth;

  this.drawOpening();
  this.setX(x);
}

// const b = new PairOfBarriers(700, 200, 800);
// document.querySelector("[wm-flappy]").appendChild(b.element);

function Barriers(height, width, opening, space, pointNotification) {
  this.pairs = [
    new PairOfBarriers(height, opening, width),
    new PairOfBarriers(height, opening, width + space),
    new PairOfBarriers(height, opening, width + space * 2),
    new PairOfBarriers(height, opening, width + space * 3),
  ];

  const displacement = 5;
  this.animation = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - displacement);

      // quando o elemento sair da área do jogo
      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length);
        pair.drawOpening();
      }

      const middle = width / 2;
      const crossedTheMiddle =
        pair.getX() + displacement >= middle && pair.getX() < middle;

      if (crossedTheMiddle) pointNotification();
    });
  };
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement("img", "bird");
  this.element.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (flying = true);
  window.onkeyup = (e) => (flying = false);

  this.animation = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maximumHeight = gameHeight - this.element.clientHeight;

    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maximumHeight) {
      this.setY(gameHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(gameHeight / 2);
}

function Progress() {
  this.element = newElement("span", "progress");
  this.upadatePoints = (points) => {
    this.element.innerHTML = points;
  };
  this.upadatePoints(0);
}

// const barriers = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const gameArea = document.querySelector("[wm-flappy]");

// gameArea.appendChild(bird.element);
// gameArea.appendChild(new Progress().element);
// barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));
// setInterval(() => {
//   barriers.animation();
//   bird.animation();
// }, 20);

function areSuperimposed(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function collided(bird, barriers) {
  let collided = false;
  barriers.pairs.forEach((pairOfBarriers) => {
    if (!collided) {
      const higher = pairOfBarriers.higher.element;
      const bottom = pairOfBarriers.bottom.element;
      collided =
        areSuperimposed(bird.element, higher) ||
        areSuperimposed(bird.element, bottom);
    }
  });
  return collided;
}

function FlappyBird() {
  let points = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(height, width, 200, 400, () =>
    progress.upadatePoints(++points)
  );

  const bird = new Bird(height);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    // loop do jogo
    const timer = setInterval(() => {
      barriers.animation();
      bird.animation();

      if (collided(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

new FlappyBird().start();
