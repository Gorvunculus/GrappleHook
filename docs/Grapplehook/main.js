title = "Grapplehook";

description = `
Click to shoot a grapplehook
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
* @property { Vector } velocity
* @property { Vector } gravity
* @property { Number } launchSpeed
* @property { Number } grappleSlowdown
*/

/**
* @typedef { object } Grapple
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } speed

*/

/**
* @type  { Player }
*/
let player

/**
* @type  { Grapple }
*/
let grapple

function update() {
    if (!ticks) {
        Start();
    }

    PlayerInput();

    RenderPlayer();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        gravity: vec(0, 0.1),
        launchSpeed: 5,
        grappleSlowdown: 0.5,
    };

    grapple = {
        color: "green",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        speed: 5,
    };
}

function RenderPlayer()
{
    
    player.velocity.add(player.gravity);

    player.pos.add(player.velocity);
    player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    color(player.color);
    box(player.pos.x, player.pos.y, 10);
}

function PlayerInput()
{
    if(input.isJustPressed)
    {
        let currInput = vec(input.pos.x, input.pos.y);
        let inputVector = vec(currInput.x - player.pos.x,
        currInput.y - player.pos.y);
        let inputDirection = inputVector.normalize();
        
        ShootGrapple(inputDirection, inputVector.length);
    }
}

function ShootGrapple(inputDirection, inputLength)
{
    LaunchPlayer(inputDirection, inputLength);
}

function LaunchPlayer(launchDirection, launchLength)
{
    let launchVelocity = RescaleVector(launchDirection, 
        launchLength * player.launchSpeed);

    player.velocity = RescaleVector(player.velocity, player.grappleSlowdown)

    player.velocity.add(launchVelocity);
}

function RescaleVector(toScale, multiplier)
{
    return vec(toScale.x * multiplier, toScale.y * multiplier);
}