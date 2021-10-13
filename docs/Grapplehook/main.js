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
* @property { Number } initialPropelSpeed
* @property { Number } propelSpeed
* @property { Number } grappleSlowdown
*/

/**
* @typedef { object } Grapple
* @property { Color } color
* @property { Vector } pos
* @property { Vector } direction
* @property { Vector } velocity
* @property { Number } speed
* @property { Number } releaseLength
* @property { Boolean } isStuck
* @property { Boolean } isReleased
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Grapple[] }
*/
let grappleList;

/**
* @type  { Grapple }
*/
let playerGrapple;

const grappleSpeed = 20;
const releaseLength = 50;

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
        velocity: vec(0, 0),
        gravity: vec(0, 0.1),
        initialPropelSpeed: 0.01,
        propelSpeed: 0.001,
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
        grapple.direction = vec(grapple.pos.x - player.pos.x,
            grapple.pos.y - player.pos.y);

        color(grapple.color);
        line(player.pos.x, player.pos.y, grapple.pos.x, grapple.pos.y);
        let collideNode = box(grapple.pos.x, grapple.pos.y, 5)
            .isColliding.rect.black;

        if(grapple.isStuck && !grapple.isReleased)
        {
            PropelPlayer(grapple.direction, player.propelSpeed, false);
        }

        if(!grapple.isStuck)
        {
            grapple.pos.add(grapple.velocity);

            if(collideNode)
            {
                PropelPlayer(grapple.direction, player.initialPropelSpeed, true);
                grapple.isStuck = true;
            } 
        }
        else
        {
            let grappleLength = grapple.pos.distanceTo(player.pos);
            if(grappleLength < releaseLength)
            {
                grapple.isReleased = true;
            }
        }

        

        return !grapple.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
            || grapple.isReleased;
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

    if(input.isJustReleased && playerGrapple != null)
    {
        playerGrapple.isReleased = true;
        playerGrapple = null;
    }
}

function ShootGrapple(inputDirection, inputLength)
{
    let grappleVelocity = RescaleVector(inputDirection, grappleSpeed);
    let newGrapple = grappleList.push({
        color: "light_green",
        pos: vec(player.pos.x, player.pos.y),
        velocity: grappleVelocity,
        direction: inputDirection,
        speed: grappleSpeed,
        releaseLength: releaseLength,
        isReleased: false,
        isStuck: false,
    });

    playerGrapple = grappleList[newGrapple - 1];
}

function PropelPlayer(direction, speed, isInitial)
{
    let velocity = RescaleVector(direction, speed);

    if(isInitial)
    {
        player.velocity = RescaleVector(player.velocity, player.grappleSlowdown)
    }

    player.velocity.add(velocity);
}

function RescaleVector(toScale, multiplier)
{
    return vec(toScale.x * multiplier, toScale.y * multiplier);
}
