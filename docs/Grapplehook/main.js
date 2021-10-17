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
    // isPlayingBgm: true,
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
* @typedef { object } GrappleNode
* @property { Color } color
* @property { Vector } pos
* @property { Vector } velocity
* @property { Number } size
*/

/**
 * @type { GrappleNode []}
 */
let GrappleNodeArray = []

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

let nodeSpeedMult = 0;

function update() {
    if (!ticks) {
        Start();
        RandomizeNodes();
    }

    RenderBackground();

    PlayerInput();
    RenderPlayer();

    GrappleNodes();

    RenderGrapple();

    GameOver();
}

function Start()
{
    startNodes();
    player = {
        color: "cyan",
        pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
        velocity: vec(0, 0),
        gravity: vec(0, 0.09),
        size: 10,
        initialPropelSpeed: 0.03,
        propelAccel: 0.0001,
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

    player.pos.clamp(10, G.WIDTH - 10, 10, G.HEIGHT + 1000);

    player.pos.add(player.velocity);
    color(player.color);
    box(player.pos.x, player.pos.y, player.size);

    let percentHeight = player.pos.y/G.HEIGHT;
    percentHeight = Math.min(0, percentHeight);

    player.gravity = vec(0, 0.1)

    if(player.velocity.y < 0)
    {
        player.gravity.y += -player.velocity.y/100;
    }
    let percentToTop = 1-(player.pos.y/G.HEIGHT) + 0.5;
    player.gravity.mul(percentToTop);

    if(playerGrapple != null)
    {
        color("purple");
        box(playerGrapple.pos.x, playerGrapple.pos.y, 10, 10);
    }
}

function GrappleNodes()
{
    if (GrappleNodeArray.length <= 10) {
        RandomizeNodes();
    }
    remove(GrappleNodeArray, element => {
        if (player.velocity.y < 0){
            element.velocity.y -= player.velocity.y;
            if (element.velocity.y > 3){
                element.velocity.y = 3
            }
        }
        element.pos.add(element.velocity);

        color(element.color);
        let collidingGrapple = box(element.pos.x, element.pos.y, element.size).
            isColliding.rect.purple;

        if(collidingGrapple)
        {
            playerGrapple.pos = element.pos;
        }

        if (element.pos.y >= G.HEIGHT + G.EXTRABOUND){
            return true;
        }
        else{
            return false;
        }
    })
}

function RandomizeNodes()
{
    GrappleNodeArray.push({
        color: "black",
        pos: vec(G.WIDTH * rnd(0.1, 0.9), -G.EXTRABOUND),
        velocity: vec(0, ((player.velocity.y) + player.gravity.y * difficulty)),
        size: 20
    });
}

function startNodes()
{
    times(10, () => {
        GrappleNodeArray.push({
            color: "black",
            pos: vec(G.WIDTH * rnd(0.1, 0.9), G.HEIGHT * rnd(0.1, 0.9)),
            velocity: vec(0, 0),
            size: 20
        });
    });
    
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
            // TryReleaseGrapple(grapple);
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
        radius: 4,
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