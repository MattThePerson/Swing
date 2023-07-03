//////INHERITANCE///////////
//parent constructor for all blocks
function blockClass() {

}

//assigning inheritance
inherits(Block, blockClass);

//inhereted show method
blockClass.prototype.show = function () {
    fill(this.color);
    stroke(this.color);
    rect(this.x, this.y, this.w, this.h);
}

//inhereted check collision method
blockClass.prototype.checkCollision = function (thing) {

    //overlap
    var rightOver = (this.x + this.w) - (thing.pos.x - buffer * thing.r);
    var leftOver = thing.pos.x + buffer * thing.r - this.x;
    var topOver = thing.pos.y + thing.r - this.y;
    var bottomOver = (this.y + this.h) - (thing.pos.y - buffer * thing.r);
    var contact = false;

    //check for vertical and horizontal overlap
    if ((leftOver > 0) && (rightOver > 0) && (bottomOver > 0) && (topOver > 0)) {

        //determine which side has been colided with
        var minimum = min(rightOver, leftOver, topOver, bottomOver);

        if (minimum == topOver) { //collision with top
            if (thing.vel.y > 0) { //moving down.
                contact = true;

                if (thing == player){
                    below = this.checkForSlipping(thing, rightOver, leftOver);
                }
                this.topCollision(thing, below);

            } else { //moving up. Prevents appearance of going through block
                if (rightOver > leftOver) {
                    this.leftCollision(thing);
                    contact = true;
                } else {
                    this.rightCollision(thing);
                    contact = true;
                }
            }

        } else if (minimum == bottomOver) { //collision with bottom
            if (thing.vel.y < 0) { //moving in wrong direction, collision ignored
                this.bottomCollision(thing);
                contact = true;

            } else {
                if ((rightOver > leftOver)) {
                    this.leftCollision(thing);
                    contact = true;
                } else {
                    this.rightCollision(thing);
                    contact = true;
                }
            }

        } else if ((minimum == rightOver) && (thing.vel.x < 0)) { //collision with right side
            if (thing.slipping){
                below = this.checkForSlipping(thing, rightOver, leftOver);
                this.topCollision(thing, below);
            } else {
                this.rightCollision(thing);
                contact = true;
            }


        } else if ((minimum == leftOver) && (thing.vel.x > 0)) { //collision with left side
            this.leftCollision(thing);
            contact = true;
        }

    }

    if (contact){
        if (this.type == 1){ //touching red block
            if ( (!thing.dead) && (noTouch) && (dyingEnabled) ){
                return -1;
            } else {
                return 1;
            }
        } else {
            return 1;
        }
    }
    return 0;
}

//inhereted check for slipping method
blockClass.prototype.checkForSlipping = function (thing, rightOver, leftOver) {
    var below = 0;
    var sf = 0.5;
    var sideBuffer = thing.r*0.7;
    var maxVel = 5;

    if ( (rightOver < sideBuffer) && (thing.vel.x < maxVel) ){
        thing.slipping = true;
        thing.slippingForce.x = sf;
        below = thing.r - sqrt( 2*thing.r*rightOver - rightOver*rightOver );

    } else if ( (leftOver < sideBuffer) && (thing.vel.x > -maxVel) ){
        thing.slipping = true;
        thing.slippingForce.x = -sf;
        below = thing.r - sqrt( 2*thing.r*leftOver - leftOver*leftOver );
    }
    return below;
}