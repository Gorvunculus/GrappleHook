title = "Grapplehook";

description = `
Click and hold to shoot a grappling hook. Don't fall!
`;

characters = [];

const G = {
    WIDTH: 400,
    HEIGHT: 400,
    EXTRABOUND: 50,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "shape",
    isReplayEnabled: false,
    isPlayingBgm: true,
    seed: 7,
    isDrawingScoreFront: true,
    isDrawingParticleFront: true,
};

/**
* @typedef { object } Player
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Vector } gravity
* @property { Number } size
* @property { Number } initialPropelSpeed
* @property { Number } propelAccel
* @property { Number } grappleSlowdown
*/

/**
* @typedef { object } Grapple
* @property { Color } color
* @property { Color } lineColor
* @property { Vector } pos
* @property { Vector } direction
* @property { Vector } velocity
* @property { Number } size
* @property { Number } radius
* @property { Number } speed
* @property { Number } releaseLength
* @property { Boolean } isStuck
* @property { Boolean } isReleased
*/

/**
* @typedef { object } BackgroundObject
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
*/

/**
* @type  { Player }
*/
let player;

/**
* @type  { Grapple[] }
*/
let grappleList = [];

/**
* @type  { Grapple }
*/
let playerGrapple;

/**
* @type  { BackgroundObject[] }
*/
let rockArray = [];

const grappleSpeed = 12;
const releaseLength = 0;
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

    RenderBackground();

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
        size: 10,
        initialPropelSpeed: 0.02,
        propelAccel: 0.001,
        grappleSlowdown: 0.5,
    };

    SpawnRocks();
}

function RenderBackground()
{
    color("light_green");
    rect(0, 0, G.WIDTH, G.HEIGHT);

    RenderBackgroundObject(rockArray);
}

function RenderBackgroundObject(array)
{
    array.forEach(item => {
        item.pos.add(item.velocity);
        item.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        color(item.color);
        box(item.pos.x, item.pos.y, item.size);
    });
}

function SpawnRocks() {
    times(20, () => {
        rockArray.push({
            color: "light_black",
            pos: vec(rnd(0, G.WIDTH),
                rnd(0, G.HEIGHT)),
            velocity: vec(0, 0),
            size: 5,
        });
    });
}

function RenderPlayer()
{
    player.velocity.add(player.gravity);

    player.pos.add(player.velocity);
    color(player.color);
    box(player.pos.x, player.pos.y, player.size);
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

        color(grapple.lineColor);
        line(player.pos.x, player.pos.y, grapple.pos.x, grapple.pos.y, 3);
        
        let grappleAngle = atan2(grapple.velocity.y, grapple.velocity.x);
        color(grapple.color);
        let collideNode = arc(grapple.pos.x, grapple.pos.y, grapple.radius, grapple.size,
            grappleAngle - PI/3, grappleAngle + PI/3).isColliding.rect.black;
        
        if(!grapple.isStuck)
        {
            grapple.pos.add(grapple.velocity);

            if(collideNode)
            {
                PropelPlayer(grapple.direction, player.initialPropelSpeed, true);
                grapple.isStuck = true;
                score += 10;
                play("laser")

                color("yellow");
                particle(grapple.pos.x, grapple.pos.y,
                    20, 1, 0, 2*PI);
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

        //  !grapple.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
        return grapple.isReleased;
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

        play("hit");
    }

    if(input.isJustReleased && playerGrapple != null)
    {
        playerGrapple.isReleased = true;
        playerGrapple = null;
    }
}

function ShootGrapple(inputDirection)
{
    let grappleVelocity = inputDirection.mul(grappleSpeed);
    let newGrapple = grappleList.push({
        color: "purple",
        lineColor: "light_yellow",
        pos: vec(player.pos.x, player.pos.y),
        velocity: grappleVelocity,
        direction: inputDirection,
        size: 5,
        radius: 6,
        speed: grappleSpeed,
        releaseLength: releaseLength,
        isReleased: false,
        isStuck: false,
    });

    playerGrapple = grappleList[newGrapple - 1];
}

function PropelPlayer(direction, speed, isInitial)
{
    let velocity = direction.mul(speed);

    if(isInitial)
    {
        player.velocity = player.velocity.mul(player.grappleSlowdown);
    }

    let randX = rndi(-player.size/4, player.size/4);
    let randY = rndi(-player.size/4, player.size/4);
    let particleAngle = atan2(player.velocity.y, player.velocity.x) + PI;
    color(player.color);
    particle(player.pos.x + randX, player.pos.y + randY,
        1, player.velocity.length, particleAngle, PI/6);

    player.velocity.add(velocity);
}

function GameOver(){
    // if(!player.pos.isInRect(-extra, -extra,
    //     G.WIDTH + extra, G.HEIGHT + extra))
    if(player.pos.y > G.HEIGHT + G.EXTRABOUND)
    {
        play("lucky");
        end();
    }
}