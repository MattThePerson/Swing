//PARTICLE
function Particle(pos, vel, col, alph, radius, disappearRate) {
    this.pos = createVector(pos.x, pos.y);
    this.vel = vel;
    this.r = radius;
    this.a = alph;
    this.R = red(col);
    this.G = green(col);
    this.B = blue(col);
    this.gone = false;
    this.dr = disappearRate;


    this.updateAsParticle = function (blocks) {
        drag = calculateDragLinear(this.vel, 0.4);
        this.vel = p5.Vector.add(this.vel, drag);
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.a += -this.dr;
        if (this.a <= 0) {
            this.gone = true;
        }
        //collision detection
        for (let b of blocks) {
            let collision = b.checkCollision(this);
            if ((collision == -1) || (collision == 1)) {
                this.gone = true;
                break;
            }
        }


    }

    this.updateAsCircle = function () {
        this.r += this.vel;
        this.a += -this.dr;
        if (this.a <= 0) {
            this.gone = true;
        }
    }

    this.show = function () {
        noStroke();
        fill(this.R, this.G, this.B, this.a);
        ellipse(this.pos.x, this.pos.y, 2 * this.r);
    }
}