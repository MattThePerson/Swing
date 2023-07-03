function Checkpoint(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.reached = false;
    this.fadeAmount = -20;
    this.ALPHA = 80;
    this.order;

    this.spawnX = this.x + this.w/2;
    this.spawnY = this.y + this.h/2;

    //check method
    this.check = function(thing){

        //overlap
        var rightOver = (this.x + this.w) - (thing.pos.x - buffer * thing.r);
        var leftOver = thing.pos.x + buffer * thing.r - this.x;
        var topOver = thing.pos.y + thing.r - this.y;
        var bottomOver = (this.y + this.h) - (thing.pos.y - buffer * thing.r);

        //check for vertical and horizontal overlap
        if ((leftOver > 0) && (rightOver > 0) && (bottomOver > 0) && (topOver > 0)) {
            this.reached = true;
            this.ALPHA += 50;
            currentCheckpoint = this;
            displayText("CHECKPOINT!", 1.5, "black");
        }
    }

    this.update = function(){
        if (this.reached && (this.ALPHA > 0)){
            this.ALPHA += this.fadeAmount;
            if (this.ALPHA < 0){
                this.ALPHA = 0;
            }
        }
    }

    this.show = function(){
        if (this.ALPHA > 0){
            stroke(150,this.ALPHA*3);
            strokeWeight(0.8);
            if (this.reached){
                stroke(255, 214, 48, this.ALPHA*3)
                strokeWeight(1.6);
            }
            fill(255, 214, 48, this.ALPHA);            
            rect(this.x, this.y, this.w, this.h);
            
        }
    }

    this.reset = function(){
        this.ALPHA = 80;
        this.reached = false;
    }
}