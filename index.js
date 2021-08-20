let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);

let startButton = document.querySelector(".start");
let restartButton = document.querySelector(".restart");
let box = document.querySelector(".box");
let canvas = document.querySelector(".board");
let scoreElem = document.querySelector(".score span");
let score = 0;
let powerLevelElem = document.querySelector(".meter span");
let fullPower = 100;
let endScore = document.querySelector(".box span");
let hint = document.querySelector("h3");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let tool = canvas.getContext("2d");

let spaceImage = new Image();
spaceImage.src = "./space.jfif";

let earthImage = new Image();
earthImage.src = "./earth.png";

let coronaImage = new Image();
coronaImage.src = "./corona.png";

let eWidth = 60;
let eHeight = 60;
let ePosX = canvas.width / 2 - 30;
let ePosY = canvas.height / 2 - 30;

class Planet {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  draw() {
    tool.drawImage(earthImage, this.x, this.y, this.width, this.height);
  }
}
class Bullet {
  constructor(x, y, width, height, velocity) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;
  }
  draw() {
    tool.fillStyle = "#fff";
    tool.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
class Corona {
  constructor(x, y, width, height, velocity) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = velocity;
  }
  draw() {
    tool.drawImage(coronaImage, this.x, this.y, this.width, this.height);
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    tool.save();
    tool.globalAlpha = this.alpha;
    tool.beginPath();
    tool.fillStyle = "#fff";
    tool.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    tool.fill();
    tool.restore();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

let bullets = [];
let coronas = [];
let particles = [];
let animId;

function animate() {
  tool.clearRect(0, 0, canvas.width, canvas.height);
  tool.drawImage(spaceImage, 0, 0, canvas.width, canvas.height);

  let earth = new Planet(ePosX, ePosY, eWidth, eHeight);
  earth.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        try {
          particles.splice(index, 1);
        } catch (e) {}
      }, 0);
    } else {
      particle.update();
    }
  });

  let bLength = bullets.length;
  for (let i = 0; i < bLength; i++) {
    bullets[i].update();

    if (
      bullets[i].x < 0 ||
      bullets[i].y < 0 ||
      bullets[i].x > canvas.width ||
      bullets[i].height > canvas.height
    ) {
      setTimeout(() => {
        try {
          bullets.splice(i, 1);
        } catch (e) {}
      }, 0);
    }
  }

  let cLength = coronas.length;
  coronas.forEach(function (corona, i) {
    corona.update();

    enemy = corona;
    if (colRect(earth, enemy)) {
      fullPower -= 20;
      powerLevelElem.style.width = fullPower + "%";

      if (fullPower <= 40) {
        powerLevelElem.style.backgroundImage =
          " linear-gradient(#f0a3a3, #f42323)";
      }

      setTimeout(() => {
        try {
          coronas.splice(i, 1);
        } catch (e) {}
      }, 0);

      if (fullPower <= 0) {
        cancelAnimationFrame(animId);
        // alert("Game Over");
        restart();
      }
    }
    bullets.forEach(function (bullet, index) {
      if (colRect(coronas[i], bullet)) {
        for (let i = 0; i < enemy.width * 4; i++) {
          particles.push(
            new Particle(bullet.x, bullet.y, Math.random() * 2, {
              x: (Math.random() - 0.5) * (Math.random() * 5),
              y: (Math.random() - 0.5) * (Math.random() * 5),
            })
          );
        }

        setTimeout(() => {
          try {
            coronas.splice(i, 1);
          } catch (e) {}
          try {
            bullets.splice(index, 1);
          } catch (e) {}
          score += 100;
          scoreElem.innerText = score;
        }, 0);
      }
    });
  });
  animId = requestAnimationFrame(animate);
}

function createCorona() {
  setInterval(() => {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;

    let delta = Math.random();
    if (delta < 0.5) {
      x = Math.random() < 0.5 ? 0 : canvas.width;
    } else {
      y = Math.random() < 0.5 ? 0 : canvas.height;
    }
    let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    let speed = 1;
    if (score < 500) {
      speed = 1;
    } else if (speed < 1000) {
      speed = 2;
    } else if (speed < 2000) {
      speed = 3;
    } else if (speed < 3000) {
      speed = 4;
    } else if (speed < 5000) {
      speed = 5;
    } else {
      speed = 6;
    }

    let velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    let corona = new Corona(x, y, 40, 40, velocity);
    coronas.push(corona);
  }, 1000);
}

startButton.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  box.style.display = "none";
  powerLevelElem.parentElement.style.display = "block";

  animate();
  createCorona();
  window.addEventListener("click", function (e) {
    let angle = Math.atan2(
      e.clientY - canvas.height / 2,
      e.clientX - canvas.width / 2
    );

    let velocity = {
      x: Math.cos(angle) * 4,
      y: Math.sin(angle) * 4,
    };

    let bullet = new Bullet(
      canvas.width / 2,
      canvas.height / 2,
      7,
      7,
      velocity
    );
    bullet.draw();
    bullets.push(bullet);
  });
});

function colRect(entity1, entity2) {
  let l1 = entity1.x;
  let l2 = entity2.x;
  let b1 = entity1.y;
  let b2 = entity2.y;
  let r1 = entity1.x + entity1.width;
  let r2 = entity2.x + entity2.width;
  let t1 = entity1.y + entity1.height;
  let t2 = entity2.y + entity2.height;

  if (l1 < r2 && l2 < r1 && t1 > b2 && t2 > b1) {
    return true;
  }
  return false;
}

window.addEventListener("resize", function (e) {
  this.window.location.reload();
});

function restart() {
  restartButton.style.display = "block";
  startButton.style.display = "none";
  box.style.display = "flex";
  powerLevelElem.parentElement.style.display = "none";
  endScore.innerText = score;
  hint.style.display='none'
  endScore.parentElement.style.display = "block";
  canvas.height = 0;
  restartButton.addEventListener("click", function () {
    window.location.reload();
  });
}
