function Hook(m, pos, vel) {
    this.pos = createVector(pos.x, pos.y);
    this.vel = createVector(vel.x, vel.y);
    this.master = m;

    this.r = 7;
    this.name = "hook";
    this.ropeVector;
    this.length;

    this.ropeRoot = new ropeSection(this.pos, this.master.pos, this, 1, maxRopeLen);

    this.shelf = null;
    this.snagBlock;
    this.grounded = false;
    this.stuck = false;
    this.color;

    this.aimPoint;
    this.aimPointDistance;
    this.startPoint;

    this.snapping = false;
    this.snapCounter = 0;



    //UPDATE METHOD
    this.update = function(pos){

        
        
        if (!this.stuck){ //if hook is still flying in the air
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            
            this.ropeVector = p5.Vector.sub(this.pos, this.startPoint);
            var travelDist = this.ropeVector.mag();
            //console.log("travel dist: "+travelDist);

            

            if (!this.aimPoint && (travelDist > maxRopeLen)){
                this.master.release();

            } else if (travelDist > this.aimPointDistance){
                this.stick(this.aimPoint);
            }
        }

        if (!this.stuck){
            this.ropeRoot.hp.x = this.pos.x;
            this.ropeRoot.hp.y = this.pos.y;
        }

        this.ropeRoot.update(this.master.pos.x, this.master.pos.y, gameObjects);

        if (this.snapping){ //animation for bullet snapping rope
            this.snapCounter++;
            if (this.snapCounter > 2){
                this.snapping = 0;
                this.snapCounter = 0;
                player.release();
            }
        }
    }


    //SHOW METHOD
    this.show = function(){
        
        if (this.master.dead){
            this.color = color( 131, 131, 131 );
        } else if (this.intersecting){
            this.color = color(50, 180, 50);
        } else if (this.snapping){
            this.color = color(244, 59, 14);
        } else if (this.master.reeling) {
            this.color = color(230, 126, 34);
        } else {
            this.color = color(255, 195, 0)
        }
        
        this.ropeRoot.show(this.color, this.master.pos.x ,this.master.pos.y);

        strokeWeight(2);
        stroke(this.color);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.r);
    }

    //stick method
    this.stick = function(p) {
        
        this.pos.x = p.x;
        this.pos.y = p.y;

        this.ropeRoot.hp.x = p.x;
        this.ropeRoot.hp.y = p.y;

        this.vel.x = 0;
        this.vel.y = 0;

        this.master.hooked = true;
        this.stuck = true;
        
        //this.length = dist(this.pos.x, this.pos.y, this.master.pos.x, this.master.pos.y);
        
        this.ropeRoot.setLength();
    }

    //find aim point
    this.findAimPoint = function(){
        
        var p1 = new Point(this.pos.x, this.pos.y);

        var ang = this.vel.heading();
        this.ropeVector = createVector(0,0);
        this.ropeVector.x = maxRopeLen * cos(ang);
        this.ropeVector.y = maxRopeLen * sin(ang);
        
        var x2 = p1.x + this.ropeVector.x;
        var y2 = p1.y + this.ropeVector.y;
        var p2 = new Point(x2, y2);

        var hookLine = new Vertex(p1, p2);

        //fidn intersect point between hookline and all block vertices
        aimPoints = [];
        aimPointBlocks = [];
        for (let block of gameObjects){
            for (let vertex of block.vertices){
                let inter = linesIntersecting(hookLine, vertex);
                if (inter){
                    aimPoints.push(inter);
                    aimPointBlocks.push(block);
                }
            }
        }

        //find closest point
        var closestDistance = maxRopeLen;
        var closestPoint;
        var closestPointBlock;

        for (let i = 0; i < aimPoints.length; i++){
            let p = aimPoints[i];
            let block = aimPointBlocks[i];
            let distance = dist(this.pos.x, this.pos.y, p.x, p.y);
            if (!closestPoint){
                closestPoint = p;
                closestDistance = distance;
                closestPointBlock = block;
            } else {
                if (distance < closestDistance){
                    closestDistance = distance;
                    closestPoint = p;
                    closestPointBlock = block;
                }
            }
        }
        this.aimPoint = closestPoint;
        this.aimPointDistance = closestDistance;
        this.snagBlock = closestPointBlock;
        this.startPoint = createVector(this.pos.x, this.pos.y);

        if (this.aimPointDistance < minRopeLen){
            this.master.release();
        }
    }

    //CHANGE LENGTH METHOD
    this.changeLength = function(amount){
        this.ropeRoot.changeLength(amount);
    }

    //CHECK FOR INTERSECT METHOD
    this.checkForIntersect = function(vertex){
        return this.ropeRoot.checkForIntersect(vertex);
    }

    //RETURN SWING POINT METHOD
    this.returnSwingPoint = function(){
        return this.ropeRoot.returnSwingPoint();
    }

    //RETURN REEL VECTOR METHOD
    this.returnReelVector = function(){
        return this.ropeRoot.returnReelVector();
    }

    //RETURN END POINT METHOD
    this.returnEndPoint = function(){
        return this.ropeRoot.returnEndPoint();
    }

    //RETURN LAST LENGTH METHOD
    this.returnLastLength = function(){
        return this.ropeRoot.returnLastLength();
    }


    //UPDATE method
    this.update1 = function () {

        if (!this.stuck) {
            this.pos = p5.Vector.add(this.vel, this.pos);
            var ropeVector = p5.Vector.sub( this.pos, this.startPoint );
            var travelDist = ropeVector.mag(); //distance traveled by the hook
            
            if ( (!this.aimPoint) && (travelDist > maxRopeLen)){
                zeroVector(this.vel);
                this.pos.x = this.master.pos.x;
                this.pos.y = this.master.pos.y;
                this.master.hookOut = false;

            } else if (travelDist > this.aimPointDistance){
                this.stick(this.aimPoint);
            }
        }

        this.ropeVector = p5.Vector.sub(this.pos, this.master.pos);
        

        var p1 = new Point(this.master.pos.x, this.master.pos.y);
        //var p2 = new Point(this.head2.x, this.head2.y);
        var p2 = new Point(this.pos.x, this.pos.y);
        var vertex = new Vertex(p1, p2);

        var noIntersect = true;
        var intersectBlocks = [];
        for (let b of gameObjects){
            for (let v of b.vertices){
                if (linesIntersecting(vertex, v)){
                    noIntersect = false;
                    intersectBlocks.push(b);
                    break;
                }
            }
        }
        if (noIntersect){
            this.intersecting = false;
        } else {
            this.intersecting = true;
            this.bendRope(intersectBlocks);
        }

        
    }
}
