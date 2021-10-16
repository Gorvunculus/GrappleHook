title = "Grapplehook";

description = `
Click to shoot a grappling hook. Avoid the edges!
`;

characters = [];

const G = {
    WIDTH: 400,
    HEIGHT: 400,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "shape",
    isReplayEnabled: false,
    isPlayingBgm: true,
    seed: rnd(0,9999),
    isDrawingScoreFront: true,
};

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Vector } gravity
* @property { Number } initialPropelSpeed
* @property { Number } propelAccel
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
let nodeLife = 0;
let posX
let posY
let xCoord = []
let yCoord = []

function update() {
    if (!ticks) {
        Start();
        RandomizeNodes();
    }

    PlayerInput();

    GrappleNodes();

    RenderGrapple();

    RenderPlayer();

    GameOver();
}

function Start()
{
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        gravity: vec(0, 0.07),
        initialPropelSpeed: 0.02,
        propelAccel: 0.001,
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

function GameOver(){
    let playerX = player.pos.x;
    let playerY = player.pos.y;
    if (playerY <= G.HEIGHT && playerX == 0){
        end();
    } 
    else if (playerX <= G.WIDTH && playerY == 0){
        end();
    }
    else if (playerY <= G.HEIGHT && playerX == G.WIDTH){
        end();
    }
    else if (playerX <= G.WIDTH && playerY == G.HEIGHT){
        end();
    }
}

function GrappleNodes()
{
    let nodeLifespan = 3000 / difficulty + 1;
        if (nodeLife >= nodeLifespan) {
            RandomizeNodes();
            play("coin");
        }
        else {
            for (let i = 0; i <= 11 - difficulty || (i > 0 && i < 1); i++) {
                color("black");
                rect(xCoord[i], yCoord[i], 20, 20);
                nodeLife++
            }
        }
}

function RandomizeNodes()
{
    xCoord = []
    yCoord = []
    for (let i = 0; i <= 11 - difficulty || (i > 0 && i < 1); i++){
        posX = G.WIDTH * rnd(0.1, 0.9);
        xCoord.push(posX)
        posY = G.WIDTH * rnd(0.1, 0.9);
        yCoord.push(posY)
        color("black");
        rect(posX, posY, 20, 20)
        nodeLife = 0;
    }
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
        
        if(!grapple.isStuck)
        {
            grapple.pos.add(grapple.velocity);

            if(collideNode)
            {
                PropelPlayer(grapple.direction, player.initialPropelSpeed, true);
                grapple.isStuck = true;
                score += 10;
                play("hit")
            }
        }
        else
        {
            if(!grapple.isReleased)
            {
                PropelPlayer(grapple.direction, player.propelAccel, false);
            }
            TryReleaseGrapple(grapple);
        }

        return !grapple.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
            || grapple.isReleased;
    })
}

function TryReleaseGrapple(grapple)
{
    let grappleLength = grapple.pos.distanceTo(player.pos);
    if(grappleLength < releaseLength)
    {
        grapple.isReleased = true;
    }
}

function PlayerInput()
{
    if(input.isJustPressed)
    {
        let currInput = vec(input.pos.x, input.pos.y);
        let inputVector = vec(currInput.x - player.pos.x,
        currInput.y - player.pos.y);
        let inputDirection = inputVector.normalize();
        
        ShootGrapple(inputDirection);
    }

    if(input.isJustReleased && playerGrapple != null)
    {
        playerGrapple.isReleased = true;
        playerGrapple = null;
    }
}

function ShootGrapple(inputDirection)
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
