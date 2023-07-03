//EXPLOSION
function Explosion(x, y, strength) {
    this.pos = createVector(x, y);
    this.particles = [];
    this.circles = [];
    this.over = false;
    this.a = 150;
    this.d = 0;
    this.size = 250;
    this.change = this.size * 0.3;
    this.proximityBlocks = [];
    this.minAng;
    this.maxAng;

    //find proximity blocks
    for (let b of gameObjects) {
        for (let c of b.corners) {
            let distance = dist(this.pos.x, this.pos.y, c.x, c.y);
            if (distance < this.size / 2) {
                this.proximityBlocks.push(b);
                break;
            }
        }
    }

    //min and max Ang
    this.minAng = 0;
    this.maxAng = TWO_PI;

    //create particles
    var N = 600;
    for (let n = 0; n < N; n++) {
        let maxSpeed = this.size * 0.4;
        let speed = random(0, maxSpeed);
        let ang = random(360);
        ang = ang / 180 * PI;
        let particleVel = p5.Vector.fromAngle(ang, speed);
        let alph = random(175, 255);
        let alphD = random(16, 40);
        let pSize = random(10, 35) / 10;
        let col;
        if (speed < maxSpeed * 0.2) {
            col = color(255, 190, 96);
        } else if (speed < maxSpeed * 0.4) {
            col = color(255, 104, 33);
        } else if (speed < maxSpeed * 0.6) {
            col = color(131, 46, 0);
        } else if (speed < maxSpeed * 0.8) {
            col = color(100);
        } else {
            col = color(150);
        }

        let np = new Particle(this.pos, particleVel, col, alph, pSize, alphD);
        this.particles.push(np);
    }

    //create circles (pos, vel, col, alph, radius, disappearRate)
    var Cn = 10;
    for (let n = 0; n < Cn; n++) {
        let nc = new Particle(this.pos, (this.size * (n / Cn) * 0.2), color(100), 80, 5, 10 + 15 * (n / Cn));
        this.circles.push(nc);
    }


    //UPDATE METHOD/////////////
    this.update = function () {

        //update blast diameter
        this.d += this.change;
        if (this.d > this.size) {
            this.d = this.size;
            this.change = -this.change;
        } else if (this.d <= 0) {
            this.d = 0;
            this.change = 0;
        }

        //overlap with player
        if (true){
            distance = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
            var overlap = distance - (this.d/2 + player.r);
            if (overlap < 0) {

                var playerPoint = new Point(player.pos.x, player.pos.y);
                var thisPoint = new Point(this.pos.x, this.pos.y);
                var playerLine = new Vertex(playerPoint, thisPoint); //vertex from this to player

                var intersectFound = false;
                for (let b of gameObjects) {
                    for (let v of b.vertices) {
                        intersect = linesIntersecting(v, playerLine);
                        if (intersect) {
                            intersectFound = true;
                            break;
                        }
                    }
                }
                if (!intersectFound) { //kill player and apply recoil
                    killPlayer();

                    if ( explosionRecoilEnabled && (this.d > 0) ){
                        if (player.recoilSource == null){
                            player.recoilSource = this;
                        }
                        if (player.recoilsLeft > 0){
                            player.recoiling = true;
                            recoilK = 20;
                            var vect = p5.Vector.sub(player.pos, this.pos);
                            var force = 20 - distance*(20/250);
                            vect.normalize().mult(force);
                            //console.log(round(distance), this.d, round(overlap), recoilK, round(force) );
                            player.explosionRecoil = vect;
                            player.recoilsLeft--;
                        }
                    }
                }
            }
        }

        //overlap with hookpoint
        if (player.hook){
            var hookDist = dist(this.pos.x, this.pos.y, player.hook.pos.x, player.hook.pos.y);
            if (hookDist < this.d / 2) {
                player.release();
            }
        }

        //overlap with exploding bullets
        for (let b of bullets) {
            if (!b.destroyed){
                let distance = dist(this.pos.x, this.pos.y, b.pos.x, b.pos.y);

                if (distance < (this.d / 2)) { 
                    if (b.explodingBullet) {
                        b.explode();
                    } else {
                        b.destroyed = true;
                    }
                }
            }
        }

        //overlap with missiles
        for (let m of missiles){
            if (!m.destroyed){
                var distances = [];
                distances.push(dist(this.pos.x, this.pos.y, m.head.x, m.head.y));
                distances.push(dist(this.pos.x, this.pos.y, m.bottomL.x, m.bottomL.y));
                distances.push(dist(this.pos.x, this.pos.y, m.bottomR.x, m.bottomR.y));
                for (let d of distances){
                    if (d < (this.d/2)){
                        m.explode();
                        break;
                    }
                }
            }
        }

        //update particles and circles
        for (let p of this.particles) {
            p.updateAsParticle(this.proximityBlocks); //pass in blocks for collision detection
        }
        for (let c of this.circles) {
            c.updateAsCircle();
        }

        //remove gone particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].gone) {
                this.particles.splice(i, 1);
            }
        }
        //remove circles
        for (let i = this.circles.length - 1; i >= 0; i--) {
            if (this.circles[i].gone) {
                this.circles.splice(i, 1);
            }
        }
        if ((this.particles.length == 0) && (this.circles.length == 0) && (this.d == 0)) {
            this.over = true;
        }
    }

    this.show = function () {
        noStroke();
        fill(200, 100, 200, 20);
        //arc(this.pos.x, this.pos.y, this.d, this.d, this.minAng, this.maxAng);

        for (let p of this.particles) {
            p.show();
        }
        for (let c of this.circles) {
            c.show();
        }
    }
}



//explosion function
function explode(x, y, strength, minA, maxA) {
    if (strength == undefined) {
        strength = 100;
    }
    var ne = new Explosion(x, y, strength, minA, maxA);
    explosions.push(ne);
}