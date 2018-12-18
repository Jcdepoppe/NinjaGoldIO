var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("ninja", "assets/128x128/Front - Walking/Front - Walking_000.png");
  this.load.image("otherPlayer", "assets//128x128/Front - Walking/Front - Walking_000.png");
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on("newPlayer", function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on("disconnect", function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();
  this.socket.on('playerMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function(otherPlayer) {
          if(playerInfo.playerId === otherPlayer.playerId) {
              otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
      });
  });
}

function update() {
  if (this.ninja) {
    if (this.cursors.left.isDown) {
      this.ninja.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.ninja.setVelocityX(150);
    } else if (this.cursors.up.isDown) {
      this.ninja.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.ninja.setVelocityY(150);
    } else {
      this.ninja.setVelocityY(0);
    }
    // this.physics.world.wrap(this.ninja, 5);

    var x = this.ninja.x;
    var y = this.ninja.y;
    //   var r = this.ship.rotation;
    if (
      this.ninja.oldPosition &&
      (x !== this.ninja.oldPosition.x || y !== this.ninja.oldPosition.y)
    ) {
        this.socket.emit('playerMovement', {x: this.ninja.x, y: this.ninja.y})
    }
    //save old position data
    this.ninja.oldPosition = {
      x: this.ninja.x,
      y: this.ninja.y
    };
  }
}

function addPlayer(self, playerInfo) {
  self.ninja = self.physics.add
    .image(playerInfo.x, playerInfo.y, "ninja")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(100, 80);
  self.ninja.setDrag(100);
  self.ninja.setAngularDrag(100);
  self.ninja.setMaxVelocity(200);
  self.ninja.setTint(0xFFD700);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, "otherPlayer")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(100, 80);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
