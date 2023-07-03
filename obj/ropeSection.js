function ropeSection(p1, p2, parent, gen, len) {
    this.hp = createVector(p1.x, p1.y);
    this.end = p2;
    this.parent = parent;
    this.gen = gen;

    if (len == undefined){
        this.length = dist(p1.x, p1.y, p2.x, p2.y);
    } else {
        this.length = len;
        //if len is null, then rope infinite length.
    }

    this.intersecting = false;
    this.snagPoint;
    this.snagLength;
    this.snagBlock;

    this.frontierPusher = false;
    this.snaggedClockwise = null;
    this.snagAng;

    this.baseAng;
    this.onLeft = false;
    this.baseClockwise;

    this.root;

    this.color = color( 236, 171, 34 );



    //UPDATE METHOD
    this.update = function (x, y, blocks) {

        if (this.root) {
            this.root.update(x, y, blocks);
        }

        this.setEnd(x,y);

        //if this is eligible for check line intersects
        if ((this.root == undefined) || (this.root.intersecting == false)) {

            if (this.frontierPusher){

                var baseAng = atan2( ( this.end.y-this.hp.y ), ( this.end.x-this.hp.x ) );
                var clockwise = false;

                if ( this.snagPoint.x < this.hp.x ){
                    this.onLeft = true;
                    if (baseAng < 0){
                        baseAng += TWO_PI;
                    }
                } 

                this.baseAng = baseAng;
                

                if (baseAng > this.snagAng){
                    clockwise = true;
                }

                this.baseClockwise = clockwise;
            }
            
            // (not a frontier pusher) or (if is a FP but baseAng is fine)
            if ( (!this.frontierPusher) || ( clockwise != this.snaggedClockwise ) ){
            
                //check for intersect with block vertices
                var rs = new Vertex(this.hp, this.end);
                var snagBlockFound;
                var intersectFound = false;

                for (let block of blocks){
                    for (let v of block.vertices) {
                        if (linesIntersecting(v, rs)) {
                            intersectFound = true;

                            if ( (!this.snagBlock) || (this.snagBlock == block) ){
                                this.snagBlock = block;
                                snagBlockFound = true
                                break;
                            }
                        }
                    }
                    if (snagBlockFound){
                        break;
                    }
                }

                if (intersectFound) {
                    if (!this.intersecting) {
                        this.intersecting = true;
                    }

                    if (this.root == null) { //if intersect found but this doesn't have a root
                        this.bendRope(x, y, this.snagBlock);
                    }

                } else {
                    if (this.intersecting) {
                        this.intersecting = false;
                        this.length = this.snagLength + this.root.length;
                    }
                    this.root = null;
                    this.snagPoint = null;
                    this.snagLength = null;
                    this.snagBlock = null;
                    this.snagAng = null;
                    this.frontierPusher = false;
                }
            } 
        }

        //color for rope section
        if (this.intersecting){
            //this.colorthis.color = color( 236, 171, 34 );
        } else {
            //this.color = color(100, 100, 220);
        }
    }


    //SHOW METHOD
    this.show = function (c, x, y) {

        this.color = c;
        
        if (this.intersecting) { //if there is a root, show root
            this.root.show(c, x, y);
            stroke(this.color);
            strokeWeight(2);
            line(this.hp.x, this.hp.y, this.snagPoint.x, this.snagPoint.y);

        } else { //else show this
            stroke(this.color);
            strokeWeight(2);
            line(this.hp.x, this.hp.y, x, y); //draw last section with player position as end
            
        }
    }



    //BEND ROPE METHOD
    //finds suitable snag point on block and makes a new rope section
    this.bendRope = function (x, y, b) {

        //determine wether this is a new block
        newSnagBlock = false;
        if (b != this.parent.snagBlock){
            newSnagBlock = true;
            this.frontierPusher = true;
        }
        
        var snagPoints = [];
        for (let c of b.corners) {
            var rs = new Vertex(this.hp, c);

            //check if rope section intersects block
            var noIntersect = true;
            for (let v of b.vertices) {
                if (linesIntersecting(v, rs)) {
                    noIntersect = false;
                    break;
                }
            }

            if (noIntersect) { //if corner is a valid snag point
                
                if (newSnagBlock){
                    snagPoints.push(c);
                
                } else { //if snagged onto same block
                    //if not the same corner
                    if ( ( round(this.hp.x) != round(c.x) ) || ( round(this.hp.y) != round(c.y) ) ){

                        //if horizontally or vertically aligned
                        if ( (round(this.hp.x) == round(c.x)) || (round(this.hp.y) == round(c.y)) ){
                            snagPoints.push(c);
                        }
                    }
                }
            }
        }

        

        //find closest point from snagPoints
        let Y = this.end.y - this.hp.y;
        let X = this.end.x - this.hp.x;
        var ropeAng = atan2(Y, X);
        //console.log("rope ang: "+round(ropeAng*180/PI) );

        var closestPoint;
        var smallestAng = TWO_PI;

        for (let sp of snagPoints) {
            let y = sp.y - this.hp.y;
            let x = sp.x - this.hp.x;
            let ang = atan2(y, x);

            if (this.end.x < this.hp.x){
                if (ang < 0){
                    ang += TWO_PI;
                }
                if (ropeAng < 0){
                    ropeAng += TWO_PI;
                }
            }

            let angDiff = abs(ropeAng - ang);
            if (angDiff < smallestAng) {
                smallestAng = angDiff;
                closestPoint = sp;
            }
        }
        if ( closestPoint.x && b.x){
            var debugMessage = "no("+debugN+") "+closestPoint.x+" "+closestPoint.y+" "+smallestAng+" "+snagPoints.length+" "+b.x+" "+b.y+" "+this.frontierPusher;
            debugMessages.push(debugMessage);
            debugN++;
        }

        this.snagPoint = closestPoint;
        this.snagLength = dist(this.snagPoint.x, this.snagPoint.y, this.hp.x, this.hp.y);


        //after snag point has been found//////

        //adding snaggedClockwise
        if (newSnagBlock){ //if snagged onto new block

            //determine snagged clockwise boolean
            for (let c of b.corners){
                //if this is the diagonally opposite corner
                if ( ( round(c.x) != round(closestPoint.x) ) && ( round(c.y) != round(closestPoint.y) ) ){
                    //
                    this.snagAng = atan2( (closestPoint.y-this.hp.y), (closestPoint.x-this.hp.x) );
                    let noGoAng = atan2( (c.y-this.hp.y), (c.x-this.hp.x) );

                    if (closestPoint.x < this.hp.x){
                        if (this.snagAng < 0){
                            this.snagAng += TWO_PI;
                        }
                        if (noGoAng < 0){
                            noGoAng += TWO_PI;
                        }
                    }

                    if (noGoAng > this.snagAng){
                        this.snaggedClockwise = true;
                    } else {
                        this.snaggedClockwise = false;
                    }
                    break;
                }
            }
        }

        var p2 = createVector(this.end.x, this.end.y);

        var newRopeSection = new ropeSection(this.snagPoint, p2, this, this.gen+1);

        newRopeSection.length = this.length - this.snagLength;
        newRopeSection.setEnd(x,y);

        this.root = newRopeSection;
    }


    //CHANGE LENGTH METHOD
    this.changeLength = function(amount){
        if (!this.intersecting){ //last section
            this.length += amount;
            var minAmount = minRopeLen;
            if (this.length < minAmount){
                this.length = minAmount;
            }
            if (this.parent){
                this.parent.length = this.length + this.parent.snagLength;
            }
            if ( (amount > 0) && (player.ropeTaut)){
                var sectVect = p5.Vector.sub(this.end, this.hp);
                sectVect.normalize().mult(this.length);
                this.end.x = this.hp.x + sectVect.x;
                this.end.y = this.hp.y + sectVect.y;
                player.pos.x = this.end.x;
                player.pos.y = this.end.y;
            }
        } else {
            this.root.changeLength(amount);
        }
    }

    //CHECK FOR INTERSECT METHOD
    this.checkForIntersect = function(vertex){

        var sectionVertex = new Vertex(this.hp, this.end);

        if (linesIntersecting(sectionVertex, vertex)){
            return true;
        }

        if (this.intersecting){
            return this.root.checkForIntersect(vertex);
        } else {
            return false;
        }
    }


    //RETURN SWING POINT METHOD
    this.returnSwingPoint = function(){
        
        if (!this.intersecting){
            return this.hp;
        } else {
            return this.root.returnSwingPoint();
        }
    }

    //RETURN REEL DIRECTION
    this.returnReelVector = function(){
        
        if (!this.intersecting){
            var vect = createVector( (this.hp.x-this.end.x), (this.hp.y-this.end.y) );
            return vect.normalize();
        } else {
            return this.root.returnReelVector();
        }
    }


    //RETURN LAST LENGTH METHOD
    this.returnLastLength = function(){

        if (!this.intersecting){
            return this.length;
        } else {
            return this.root.returnLastLength();
        }
    }

    //SET ROPE LENGTH - sets the length of the rope to the current length
    this.setLength = function(){
        if (!this.intersecting){ //no roots
            this.length = dist(this.end.x, this.end.y, this.hp.x, this.hp.y);
        } else {
            //must reset snag length for gen 1.
            if (this.gen == 1){ 
                this.snagLength = dist(this.snagPoint.x, this.snagPoint.y, this.hp.x, this.hp.y);
            }
            this.length = this.snagLength + this.root.setLength();
        }
        return this.length;
    }


    //SET END METHOD
    this.setEnd = function(x, y){
        if (dist(this.hp.x, this.hp.y, x, y) > this.length) {

            var ropeVect = createVector((this.hp.x - x), (this.hp.y - y));
            ropeVect.normalize().mult(this.length);

            this.end.x = this.hp.x - ropeVect.x;
            this.end.y = this.hp.y - ropeVect.y;

        } else {
            this.end.x = x;
            this.end.y = y;
        }
    }

    //RETURN END POINT METHOD
    this.returnEndPoint = function(){

        if (!this.intersecting){
            return this.end;
        } else {
            return this.root.returnEndPoint();
        }
    }

    this.give2ndLastSection = function(){

        if (!this.root.intersecting){
            return this;
        } else {
            return this.root.give2ndLastSection();
        }
    }
}




