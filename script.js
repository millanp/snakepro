// Practice problem 'Snake' starter code
// LATEST: added Math.randBetween function
window.onload = function() {
  var canvasElem = document.getElementById("sample-canvas");
  var canvas = document.getElementById("sample-canvas").getContext("2d");
  var canvasHeight = canvasElem.height;
  var canvasWidth = canvasElem.width;
  var isLocked = false;
  var isDead = false;
  var itemPosition = [0, 0];
  var interval;
  var coordString;
  var listener;


  function clearCanvas(justNumbers) {
    justNumbers ?
      canvas.clearRect(0, 0, 300, 20) :
      canvas.clearRect(0, 0, canvasElem.width, canvasElem.height);
  }
  canvas.sf = function() {
    canvas.stroke();
    canvas.fill();
  }
  canvas.f = function() {
    canvas.fill();
  }
  canvas.s = function() {
    canvas.stroke();
  }
  canvas.circle = function(centerX, centerY, radius) {
    canvas.beginPath();
    canvas.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    canvas.closePath();
  }

  Math.randBetween = function(x, y) {
    return Math.random() * (y - x) + x;
  }
  Math.randIntBetween = function(x, y) {
      return Math.floor(Math.randBetween(x, y));
    }
    // Helper function to display coordinates of mouse pointer.
    // When mouse clicked, coordinates lock in until another click.
  function hookPoints() {
    function getCanvasCoords(evt) {
      var rect = canvasElem.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    }
    listener = function(evt) {
      var coords = getCanvasCoords(evt);
      coordString = "x: " + coords.x + ", y: " + coords.y;
      render(true);
    }
    canvasElem.addEventListener('mousemove', listener);
    canvasElem.onclick = function() {
      console.log("click");
      if (isLocked) {
        hookPoints();
        isLocked = false;
      } else {
        canvasElem.removeEventListener('mousemove', listener);
        isLocked = true;
      }
    }
  }

  function printPoints() {
    canvas.beginPath();
    canvas.font = "10px Arial";
    canvas.fillStyle = "black";
    canvas.fillText(coordString, rx(10), ry(10));
  }
  // Don't forget line caps!



  // Draw frame of snake
  // Positions of bricks will be stored as a manual "linked list";
  // each block will have a nextBlock and prevBlock property.
  var snakeColor = "red";
  var snakeLength = 1;
  var maxSnakeLength = 6;
  var blockWidth = 15;
  var outlineWidth = 2;
  var score = 0;
  var occupiedSpaces = new Set([
    [0, 0]
  ]);
  var dir = 1;
  var dirQueue = [dir];

  function setDir() {
    var oldDir = dir;
    if (!(dir = dirQueue.pop()))
      dir = oldDir;
  }

  function Food(pos, color) {
    if (typeof(pos) !== "undefined") {
      this.pos = pos;
    } else {
      var blocksFromTop = Math.randIntBetween(0, canvasHeight / blockWidth);
      var blocksFromLeft = Math.randIntBetween(0, canvasWidth / blockWidth);
      this.pos = [blocksFromLeft * blockWidth, blocksFromTop * blockWidth];
    }

    this.color = color;
    this.width = blockWidth;
    this.height = blockWidth;
    this.outlineWidth = outlineWidth;


    this.sf = function() {
      canvas.fillStyle = this.color;
      canvas.lineWidth = this.outlineWidth;
      canvas.beginPath()
        // All of these outlineWidth/2 things are to make blocks never overlap
      canvas.rect(this.pos[0], this.pos[1], this.width - this.outlineWidth / 2, this.height - this.outlineWidth / 2);
      canvas.sf();
    }
  }

  function Brick(pos, nextBrick, prevBrick) {
    this.pos = pos;
    this.color = snakeColor;
    this.width = blockWidth;
    this.height = blockWidth;
    this.nextBrick = nextBrick;
    this.prevBrick = prevBrick;
    this.outlineWidth = outlineWidth;

    this.sf = function() {
      canvas.fillStyle = this.color;
      canvas.lineWidth = this.outlineWidth;
      canvas.beginPath()
        // All of these outlineWidth/2 things are to make blocks never overlap
      canvas.rect(this.pos[0], this.pos[1], this.width - this.outlineWidth / 2, this.height - this.outlineWidth / 2);
      canvas.sf();
    }

    // This function:
    // 1. Scoots all following bricks along by one "place", by editing their pos properties
    // 2. Calls sf on all following bricks
    this.isAtDeath = function() {
      if (occupiedSpaces.has(JSON.stringify(this.pos))) {
        occupiedSpaces.forEach(function(a, b, c) {
          console.log(a);
        });
        console.log("has");
        return true;
      }
      if (this.pos[0] < 0 || this.pos[1] < 0) {
        return true;
      }
      if (this.pos[0] >= canvasWidth || this.pos[1] >= canvasHeight) {
        return true;
      }
      return false;
    }

    this.sfsnake = function() {
      // IF snake is at required length, begin shifting at this.
      // OTHERWISE, begin shifting at nextBrick
      var currBrick;
      if (snakeLength < maxSnakeLength) {
        currBrick = this.nextBrick;
        snakeLength++;
      } else {
        currBrick = this;
        // Delete it from occupiedSpaces
        occupiedSpaces.delete(JSON.stringify(currBrick.pos));
      }

      // Push all following bricks along
      while (currBrick != null) {
        if (currBrick.nextBrick != null) {
          currBrick.pos = currBrick.nextBrick.pos.slice(0);
        } else {
          // Push current block forward
          setDir();
          switch (dir) {
            case 1:
              currBrick.pos[0] += blockWidth;
              break;
            case 2:
              currBrick.pos[1] += blockWidth;
              break;
            case 3:
              currBrick.pos[0] -= blockWidth;
              break;
            case 4:
              currBrick.pos[1] -= blockWidth;
              break;
          }
          if (currBrick.isAtDeath()) {
            isDead = true;
            console.log("dead at " + currBrick.pos);
            break;
          }
          occupiedSpaces.add(JSON.stringify(currBrick.pos));
          // Check if the snake is eating food
          if (currBrick.pos[0] == food.pos[0] && currBrick.pos[1] == food.pos[1]) {
            maxSnakeLength += 2;
            score += 10;
            food = new Food();
          }
        }
        currBrick = currBrick.nextBrick;
      }
      currBrick = this;
      //     if (!isDead) {
      // Stroke and fill all bricks
      while (currBrick != null) {
        currBrick.sf();
        currBrick = currBrick.nextBrick;
      }
      if (isDead) {
        die();
      }
      //     } else {
      //       die();
      //       return true;

      //     }

      return false;
    }
  }
  window.addEventListener('keydown', function(e) {
    var oldDir = dirQueue[0];
    if (!oldDir) {
      oldDir = dir;
    }
    switch (String.fromCharCode(e.keyCode)) {
      case 'W':
        if (oldDir != 2 && oldDir != 4) {

          dirQueue.unshift(4);
        }
        break;
      case 'D':
        if (oldDir != 3 && oldDir != 1) {
          dirQueue.unshift(1);
        }
        break;
      case 'S':
        if (oldDir != 4 && oldDir != 2) {
          dirQueue.unshift(2);
        }
        break;
      case 'A':
        if (oldDir != 1 && oldDir != 3) {
          dirQueue.unshift(3);

        }
        break;
    }
  });
  // window.addEventListener('click', function(e) {
  //   die();
  // });

  var lastBrick = new Brick([0, 0]);
  var food = new Food();
  // 1 = right, 2 = down, 3 = left, 4 = up, 0 = not moving
  function die() {
    console.log("dying");
    canvas.beginPath();
    canvas.fillStyle = "black";
    canvas.font = "18px Arial";
    canvas.fillText("You lose! Reload to play again.", 300, 30);
    canvas.closePath();
    window.clearInterval(interval);
    //   render();
  }

  function drawFigure() {
    var blockWidth = 30;
    var blockHeight = blockWidth;
    var outlineWidth = 4;

    if (snakeLength < maxSnakeLength) {
      var brick = new Brick(lastBrick.pos);
      var prevLastBrick = lastBrick;
      prevLastBrick.prevBrick = brick;
      brick.nextBrick = prevLastBrick;
      lastBrick = brick;
    }
    var isDead = lastBrick.sfsnake();

    food.sf();
  }

  function signName(text) {
    canvas.beginPath();
    canvas.fillStyle = "black";
    canvas.font = "18px Arial";
    typeof(text) == "string" ?
    canvas.fillText(text, rx(10), ry(20)):
      canvas.fillText("Person by Millan", rx(25), ry(254));
  }

  function render(numbersOnly, todo) {
    if (!numbersOnly) {
      clearCanvas();
      drawFigure();
    } else {
      clearCanvas(true);
    }
    //   printPoints();
    signName(String(score));
    if (todo) {
      todo();
    }
  }



  function init() {
    //   hookPoints();
    render();
    interval = window.setInterval(render, 70);
  }
  init();

  function rx(x) {
    return x - itemPosition[0];
  }

  function ry(y) {
    return y - itemPosition[1];
  }
}