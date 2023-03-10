/**
 * selects the HTML canvas element and stores it in the canvas constant.
 */
const canvas = document.querySelector("canvas");
/**
 * creates a 2D drawing context for the canvas and stores it in the c constant.
 */
const c = canvas.getContext("2d");
/**
 * selects the HTML element with an ID of scoreEL and stores it in the scoreEl constant.
 */
const scoreEl = document.querySelector("#scoreEL");

// sets the canvas width to the inner width of the browser window.
canvas.width = innerWidth;
// sets the canvas height to the inner height of the browser window.
canvas.height = innerHeight;

/**
 * defines the properties and behavior of the static objects in the game that act as barriers for the player character. The class includes a width and height property that is shared by all objects, and a draw() method that draws the object on the canvas using its image and position.
 */
class Boundary {
  static width = 40;
  static height = 40;
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }

  /**
   * defines a method for the Boundary class that draws the boundary object on the canvas using the 2D drawing context. This method uses the drawImage() method of the context to draw the boundary's image at the boundary's position coordinates.
   */
  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

/**
 * defines the behavior of the game's player character, including its appearance, movement, and animation.
 */
class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75;
    this.openRate = 0.12;
    this.rotation = 0;
  }

  /**
   * defines a method for the Player class that draws the player character on the canvas using the 2D drawing context. This method also saves the current context state, translates the context to the player's position, rotates it by the player's rotation, draws the player character using a filled arc and a line segment, restores the context state, and fills the arc with the color yellow.
   */
  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);
    c.beginPath();
    c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians
    );
    c.lineTo(this.position.x, this.position.y);
    c.fillStyle = "yellow";
    c.fill();
    c.closePath();
    c.restore();
  }

  /**
   * defines a method for the Player class that updates the player character's position and animation. This method first calls the draw() method to redraw the player character on the canvas, then updates the player's position by adding its velocity to it, and finally updates the player's radians and openRate properties to animate the player's mouth opening and closing. If the player's radians value goes beyond a certain range, the openRate value is negated to reverse the animation direction.
   */
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate;

    this.radians += this.openRate;
  }
}

/**
 * defines the properties and behavior of the enemy characters in the game. The class includes a speed property that is shared by all ghosts, and a draw() method that draws the ghost on the canvas with its color or "blue" if it is scared. The update() method updates the ghost's position on the canvas and redraws it with its new position.
 */
class Ghost {
  static speed = 2;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 2;
    this.scared = false;
  }

  /**
   * defines a method for the Ghost class that draws the ghost on the canvas using the 2D drawing context. This method uses the arc() method of the context to draw a circle with the ghost's radius at the ghost's position coordinates, fills the circle with the ghost's color, or "blue" if the ghost is scared, and closes the path.
   */
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.scared ? "blue" : this.color;
    c.fill();
    c.closePath();
  }

  /**
   * defines a method for the Ghost class that updates the ghost's position on the canvas by adding its velocity to its position. This method also calls the draw() method to redraw the ghost on the canvas with its updated position.
   */
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

/**
 * class represents a small white dot in the game
 */
class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }

  /**
   * method is responsible for drawing the pellet on the canvas
   */
  draw() {
    c.beginPath();
    // arc() method to draw a circle with the center at the specified position and the given radius.
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath(); // the path is closed using closePath()
  }
}

/**
 * class represents a larger white dot in the game that gives the player a temporary power boost
 */
class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 8;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "white";
    c.fill();
    c.closePath();
  }
}

// Arrays to store the game objects
const pellets = []; // Array of pellets that the player will collect
const boundaries = []; // Array of walls that the player and ghosts cannot pass through
const powerUps = []; // Array of power-ups that the player can collect

// Array of Ghost objects that the player must avoid
const ghosts = [
  // Create a Ghost with position and velocity, moving right by default
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
  }),
  // Create another Ghost with position, velocity, and a different color
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 3 + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
    color: "pink",
  }),
];

// Create a Player object with starting position and no initial velocity
const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

// Object to track which keys are currently being pressed
const keys = {
  w: {
    pressed: false, // Whether the 'w' key is currently pressed
  },
  a: {
    pressed: false, // Whether the 'a' key is currently pressed
  },
  s: {
    pressed: false, // Whether the 's' key is currently pressed
  },
  d: {
    pressed: false, // Whether the 'd' key is currently pressed
  },
};

let lastKey = ""; // Variable to store the last key pressed
let score = 0; // Variable to store the player's score

const map = [
  // 2D array representing the game map
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

function createImage(src) {
  // Function to create an image object
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  // Loop through each row of the map
  row.forEach((symbol, j) => {
    // Loop through each symbol of the row
    switch (
      symbol // Check the symbol
    ) {
      case "-": // If it's a horizontal pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|": // If it's a vertical pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
      case "1": // If it's a top-left corner pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner1.png"),
          })
        );
        break;
      case "2": // If it's a top-right corner pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner2.png"),
          })
        );
        break;
      case "3": // If it's a bottom-right corner pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4": // If it's a bottom-left corner pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b": // If it's only a block pipe
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[": // if the pipe only has a right opening
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]": // if the pipe only has a left opening
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_": // if the pipe only has a top opening
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^": // if the pipe only has a bottom opening
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        // if the pipe is a cross
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "5":
        // if the pipe doesn't have an opening only at the bottom
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        // if the pipe doesn't have an opening only at the left
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        // if the pipe doesn't have an opening only at the top
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        // if the pipe doesn't have an opening only at the right
        boundaries.push(
          // Add a new Boundary object to the boundaries array
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;
      case ".":
        // put pellets on the map
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;

      case "p":
        // put powerUps on the map
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
          })
        );
        break;
    }
  });
});

/**
 * Checks if a circle collides with a rectangle.
 */
function circleCollidesWithRectangle({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1;
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

let animationId;
/**
 * Animates the Pacman game.
 */
function animate() {
  /**
   * Request for animation frame and update the screen.
   * @type {number} Unique identifier of the animation frame.
   */
  animationId = requestAnimationFrame(animate);
  // Clear the canvas for redrawing the screen
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Check if the key is pressed and handle player's movement for the specific key
  if (keys.w.pressed && lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 5;
      }
    }
    player.velocity.y = 5;
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 5;
      }
    }
  }

  // detect collision
  for (let i = ghosts.length - 1; 0 <= i; i--) {
    const ghost = ghosts[i];
    // ghost catches the player
    if (
      Math.hypot(
        ghost.position.x - player.position.x,
        ghost.position.y - player.position.y
      ) <
      ghost.radius + player.radius
    ) {
      if (ghost.scared) {
        ghosts.splice(i, 1);
      } else {
        cancelAnimationFrame(animationId);
        console.log("You've lost!");
      }
    }
  }

  // when you win
  if (pellets.length === 0) {
    console.log("You won!");
    cancelAnimationFrame(animationId);
  }

  // power
  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    // where you get the power
    if (
      Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y
      ) <
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1);

      // ghosts scare each other
      ghosts.forEach((ghost) => {
        ghost.scared = true;

        setTimeout(() => {
          ghost.scared = false;
        }, 5000);
      });
    }
  }

  // touching the pellets
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i];
    pellet.draw();
    if (
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
      pellet.radius + player.radius
    ) {
      pellets.splice(i, 1);
      score += 10;
      scoreEl.innerHTML = score;
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw();
    if (
      circleCollidesWithRectangle({
        circle: player,
        rectangle: boundary,
      })
    ) {
      console.log("collision");
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });
  player.update();

  ghosts.forEach((ghost) => {
    ghost.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("right");
      }

      if (
        !collisions.includes("left") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }

      if (
        !collisions.includes("up") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }

      if (
        !collisions.includes("down") &&
        circleCollidesWithRectangle({
          circle: {
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });
    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      if (ghost.velocity.x > 0) ghost.prevCollisions.push("right");
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push("left");
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push("up");
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push("down");

      console.log(collisions);
      console.log(ghost.prevCollisions);

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });
      console.log({ pathways });
      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      console.log({ direction });

      switch (direction) {
        case "down":
          ghost.velocity.y = ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "up":
          ghost.velocity.y = -ghost.speed;
          ghost.velocity.x = 0;
          break;
        case "right":
          ghost.velocity.y = 0;
          ghost.velocity.x = ghost.speed;
          break;
        case "left":
          ghost.velocity.y = 0;
          ghost.velocity.x = -ghost.speed;
          break;
      }
      ghost.prevCollisions = [];
    }
  });

  if (player.velocity.x > 0) player.rotation = 0;
  else if (player.velocity.x < 0) player.rotation = Math.PI;
  else if (player.velocity.y > 0) player.rotation = Math.PI / 2;
  else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5;
} // end of animation

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
  console.log(keys.d.pressed);
  console.log(keys.s.pressed);
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
  console.log(keys.d.pressed);
  console.log(keys.s.pressed);
});
