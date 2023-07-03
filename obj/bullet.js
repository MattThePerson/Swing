function Bullet(pos, vel, parent, color){
    this.pos = pos;
    this.vel = vel;
    this.parent = parent;
    this.color = color;
    this.destroyed = false;
    this.explodingBullet = false; 
    this.bouncy = false;
    this.bouncesLeft = 4;
    


    this.update = function(){
        this.pos = p5.Vector.add( this.vel, this.pos );

        var x = this.pos.x;
        var y = this.pos.y;

        //collision with blocks
        for (let b of gameObjects){
            var topOver = y - b.y;
            var bottomOver = (b.y+b.h) - y;
            var leftOver = x - b.x;
            var rightOver = (b.x + b.w) - x;

            if ((leftOver > 0) && (rightOver > 0) && (bottomOver > 0) && (topOver > 0)) {

                if (this.bouncy){
                    if (this.bouncesLeft > 0){
                        var minOver = min(rightOver, leftOver, topOver, bottomOver);
                        if (minOver == topOver){
                            b.topCollision(this);
                        } else if (minOver == leftOver){
                            b.leftCollision(this);
                        } else if (minOver == rightOver){
                            b.rightCollision(this);
                        } else if (minOver == bottomOver){
                            b.bottomCollision(this);
                        }
                        this.bouncesLeft--;
                    
                    } else { //bounces finished
                        this.destroyed = true;
                    }
                    
                } else if (this.explodingBullet){
                    this.explode();
                } else {
                    this.destroyed = true;
                }
                return 0;
            }
        }

        //collision with player
        if ( (x > player.pos.x-player.r) && (x < player.pos.x+player.r) && 
        (y > player.pos.y-player.r) && (y < player.pos.y+player.r) ){

            if (this.explodingBullet){
                this.explode();
            } else {
                this.destroyed = true;
                killPlayer();
            }
            return 0;
        }

        //repeate with tail of bullet
        x += - this.vel.x;
        y += - this.vel.y;
        if ( (x > player.pos.x-player.r) && (x < player.pos.x+player.r) && 
        (y > player.pos.y-player.r) && (y < player.pos.y+player.r) ){
            
            if (this.explodingBullet){
                this.explode();
            } else {
                this.destroyed = true;
                killPlayer();
            }
            return 0;
        }

        //cuts through hook rop
        if (player.hook){
            
            var thisPoint = new Point(this.pos.x, this.pos.y);
            var prevPoint = new Point(this.pos.x-this.vel.x, this.pos.y-this.vel.y);
            var thisLine = new Vertex(thisPoint, prevPoint);

            var intersect = player.hook.checkForIntersect(thisLine);

            if (intersect){
                player.hook.snapping = true;
            }
        }

        //exploding bullets collide in air
        if (this.explodingBullet){
            var thisPoint = new Point(this.pos.x, this.pos.y);
            var prevPoint = new Point(this.pos.x-this.vel.x, this.pos.y-this.vel.y);
            var thisLine = new Vertex(thisPoint, prevPoint);

            for (let b of bullets){
                let tp = new Point(b.pos.x, b.pos.y);
                let pp = new Point(b.pos.x-b.vel.x, b.pos.y-b.vel.y);
                let otherLine = new Vertex(tp, pp);

                if (linesIntersecting(thisLine, otherLine)){
                    this.explode();
                } else if (b != this){
                    if ( (abs(this.pos.x-b.pos.x) < 10) && (abs(this.pos.y-b.pos.y) < 10 ) ){
                        //console.log(this.pos.x, b.pos.x, this.pos.y, b.pos.y);
                        this.explode();
                    }
                }

            }
        }
    }

    this.show = function(){
        stroke(this.color);
        strokeWeight(4);
        var x, y;
        if (dist(this.pos.x, this.pos.y, this.parent.x, this.parent.y) > this.parent.bulletSpeed ){
            x = this.pos.x - this.vel.x;
            y = this.pos.y - this.vel.y;
        } else {
            x = this.pos.x;
            y = this.pos.y;
        }
        line(this.pos.x, this.pos.y, x, y);
    }

    this.explode = function(){
        this.destroyed = true;
        let x = this.pos.x - this.vel.x;
        let y = this.pos.y - this.vel.y;
        explode(x, y, 50);
    }

    this.fetchCollisionPoint = function(block){
        var iP;
        var P1 = new Point(this.pos.x, this.pos.y);
        var x2 = this.pos.x - this.vel.x;
        var y2 = this.pos.y - this.vel.y;
        var P2 = new Point(x2, y2);
        var bulletVertex = new Vertex(P1, P2);
        

        for (let vertex of block.vertices){
            iP = linesIntersecting(bulletVertex, vertex);
            if (iP){
                if (iP == block.upperVertex){
                    console.log("upperVertex");
                }

                return createVector(iP.x, iP.y);
            }
        }

        console.log("error: no vertex intersect found for bullet");
        return false;

    }
}