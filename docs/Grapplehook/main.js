title = "";

description = `
`;

characters = [];

const G = {
    WIDTH: 400,
    HEIGHT: 400,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "shape",
    isReplayEnabled: true,
    isPlayingBgm: false,
    seed: 0,
    isDrawingScoreFront: true,
};

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Number } speed
*/

/**
* @type  { Player }
*/
let player

function update() {
    if (!ticks) {
        Start();
    }

    RenderPlayer();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        speed: 5,
    };
}

function RenderPlayer()
{
    color(player.color);
    box(player.pos.x, player.pos.y, 10);
}