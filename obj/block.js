
//still block constructor
function Block(x, y, w, h, type) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.color = color(100, 100, 220);
    this.surface = null;
    this.wallBlock = false; //reserved for arenas ground, ceiling, etc.

    //setup block vertices
    var UL = new Point(this.x, this.y); //uper left corner
    var UR = new Point(this.x+this.w, this.y);
    var LL = new Point(this.x, this.y+this.h);
    var LR = new Point(this.x+this.w, this.y+this.h);

    this.corners = [UL, UR, LL, LR];

    this.upperVertex = new Vertex(UL, UR);
    this.lowerVertex = new Vertex(LL, LR);
    this.leftVertex = new Vertex(UL, LL);
    this.rightVertex = new Vertex(UR, LR);

    this.vertices = [this.upperVertex, this.lowerVertex, this.leftVertex, this.rightVertex];

    this.update = function () {
        //
    }

    this.topCollision = function (thing, below) {
        if (below == undefined){
            below = 0;
        }
        if (thing.bouncy){
            thing.pos.y = this.y;
            thing.vel.y = -thing.vel.y;
        } else { 
            thing.pos.y = this.y - thing.r + below;
            thing.grounded = true;

            if (thing.pe > 0) {
                thing.jumping = true;
            }
            if (thing.dead){
                thing.vel.y = -bounceFactor * thing.vel.y;
            } else {
                thing.vel.y = 0;
            }
            thing.shelf = this;
            thing.contactObject = this;
        }
    }

    this.bottomCollision = function (thing) {
        if (thing.bouncy){
            thing.pos.y = this.y + this.h;
            thing.vel.y = -thing.vel.y;
        } else {
            thing.pos.y = this.y + this.h + buffer * thing.r;
            thing.vel.y = -bounceFactor * thing.vel.y;
            thing.contactObject = this;
        }
    }

    this.leftCollision = function (thing) {
        if (thing.bouncy){
            thing.pos.x = this.x;
            thing.vel.x = -thing.vel.x;
        } else {
            thing.pos.x = this.x - buffer * thing.r;
            thing.vel.x = -bounceFactor * thing.vel.x;
            thing.contactObject = this;
        }
    }

    this.rightCollision = function (thing) {
        if (thing.bouncy){
            thing.pos.x = this.x + this.w;
            thing.vel.x = -thing.vel.x;
        } else {
            thing.pos.x = this.x + this.w + buffer * thing.r;
            thing.vel.x = -bounceFactor * thing.vel.x;
            thing.contactObject = this;
        }
    }

}