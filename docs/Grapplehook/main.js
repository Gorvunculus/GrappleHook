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
* @property { Grapple } grapple
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
let player;

/**
* @type  { Grapple[] }
*/
let grappleList;

const grappleSpeed = 10;

function update() {
    if (!ticks) {
        Start();
    }

    PlayerInput();

    RenderPlayer();

    TempRenderNode();

    RenderGrapple();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        grapple: null,
        velocity: vec(0, 0),
        gravity: vec(0, 0.1),
        launchSpeed: 0.5,
        grappleSlowdown: 0.5,
    };

    grappleList = []
}

function RenderPlayer()
{
    player.velocity.add(player.gravity);

    player.pos.add(player.velocity);
    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    color(player.color);
    box(player.pos.x, player.pos.y, 10);
}

function TempRenderNode()
{
    color("black");
    rect(G.WIDTH * 0.4, 0, 10, G.HEIGHT);
}

function RenderGrapple()
{
    remove(grappleList, grapple => {
        grapple.pos.add(grapple.velocity);

        color(grapple.color);
        line(player.pos.x, player.pos.y, grapple.pos.x, grapple.pos.y);
        let collideNode = box(grapple.pos.x, grapple.pos.y, 5)
            .isColliding.rect.black;
        
        if(collideNode)
        {
            LaunchPlayer(grapple.velocity);
        }

        return !grapple.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
            || collideNode;
    })
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
    let grappleVelocity = RescaleVector(inputDirection, grappleSpeed);
    
    let newGrapple = grappleList.push({
        color: "light_green",
        pos: vec(player.pos.x, player.pos.y),
        velocity: grappleVelocity,
        speed: grappleSpeed,
    });

    player.grapple = grappleList[newGrapple];
}

function LaunchPlayer(launchDirection)
{
    let launchVelocity = RescaleVector(launchDirection, 
        player.launchSpeed);

    player.velocity = RescaleVector(player.velocity, player.grappleSlowdown)

    player.velocity.add(launchVelocity);
}

function RescaleVector(toScale, multiplier)
{
    return vec(toScale.x * multiplier, toScale.y * multiplier);
}
