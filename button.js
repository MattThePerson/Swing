function Button(x, y, w, h, t, ts){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = t;
    if (ts != undefined){
        this.textSize = ts;
    } else {
        this.textSize = 20;
    }
    this.textColor = color(50);
    this.borderColor = this.textColor;
    this.activated = true;
    this.showing = true;
    this.held = false;
    this.toggled = false;
    this.color = color(230);

    this.click = function(){
        console.log("default button function");
    }

    this.update = function(x, y){
        var defaultButtonColor = 230;
        var toggledTextColor = color(255);
        var toggledButtonColor = color(105);

        if (!this.activated){
            this.textColor = color(140);
            this.borderColor = color(140);
            this.color = color(240);

        } else { //activated
            
            this.textColor = color(50);
            this.borderColor = color(50);

            if (this.held){

                if (this.toggled){ //if held while toggled
                    this.textColor = toggledTextColor;
                    if (this.checkForHover(x,y)){
                        this.color = color(80);
                    } else {
                        this.color = toggledButtonColor;
                    }

                } else {
                    if (this.checkForHover(x,y)){
                        this.color = color(170);
                    } else {
                        this.color = color(200);
                    }
                }
            
            } else { //if not held
                if (this.toggled){
                    this.color = toggledButtonColor;
                    this.textColor = toggledTextColor;
                } else if (this.checkForHover(x,y)){
                    this.color = color(200);
                } else {
                    this.color = color(230);
                }
            }
        }
    }

    this.draw = function(){
        stroke(this.borderColor);
        strokeWeight(2);
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);

        fill(this.textColor);
        stroke(this.textColor);
        strokeWeight(this.textSize/25);
        textSize(this.textSize);
        var tw = textWidth(this.text);
        var x = this.x + this.w/2 - tw/2;
        var y = this.y + this.h*0.55;
        text(this.text, x, y);
    }

    this.show = function(){
        this.showing = true;
    }

    this.hide = function(){
        this.showing = false;
    }

    this.activate = function(){
        this.activated = true;
    }

    this.deactivate = function(){
        this.activated = false;
    }

    this.checkForHover = function(x,y){
        if (this.activated && this.showing){
            if ( (x > this.x) && (x < this.x+this.w) && (y > this.y) && (y < this.y+this.h) ){
                return true;
            }
        }
        return false;
    }


    this.checkForClick = function(x, y){
        if (this.activated && this.showing){
            if (this.checkForHover(x,y)){
                this.held = true;
            }
        }
    }

    this.checkForRelease = function(x,y){
        if (this.held){
            if (this.checkForHover(x,y)){
                this.click();
            }
        }
        this.held = false;
    }

    this.toggle = function(){
        if (this.toggled){
            this.toggled = false;
        } else {
            this.toggled = true;
        }
    }
}


//buttonGroup Class
function buttonGroup(){
    this.buttons = [];
    this.showing = true;

    this.draw = function(){
        if (this.showing){
            for (let b of this.buttons){
                if (b.showing){
                    b.draw();
                }
            }
        }
    }

    this.update = function(x,y){
        for (let b of this.buttons){
            b.update(x,y);
        }
    }

    this.show = function(){
        this.showing = true;
    }

    this.hide = function(){
        this.showing = false;
    }

    this.checkForClick = function(x,y){
        if (this.showing){
            for (let b of this.buttons){
                b.checkForClick(x,y);
            }
        }
    }

    this.checkForRelease = function(x,y){
        for (let b of this.buttons){
            b.checkForRelease(x,y);
        }
    }

    this.add = function(b){
        this.buttons.push(b);
    }

    this.toggleOff = function(){
        for (let b of this.buttons){
            if (b.toggled){
                b.toggled = false;
            }
        }
    }

    this.toggleButton = function(n){
        this.buttons[n].toggle();
    }
}


