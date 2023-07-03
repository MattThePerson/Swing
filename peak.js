
var showPeakText = true;
var peakText;
var peaked = false;
var peakTextMoving = false;
var peakTime;
var peakTextY;
var peakTextShowTime;
var lastPeakText;
var lastLastPeakText;

function peakLoop(){
    //peak text stuff
    if (showPeakText){
        //console.log("peak text");
        if (peakTextMoving){
            if (peaked){
                peakTextY -= 2;
                if (peakTextY < -30){
                    peakTextMoving = false;
                    peakTime = null;
                }
            } else { //hasn't yet peaked
                peakTextY += 2;
                if (peakTextY >= 20){
                    peakTextMoving = false;
                    peaked = true;
                    peakTime = millis();
                }
            }
        } else if (peakTime){
            if ( (millis()-peakTime) > peakTextShowTime ){
                peakTextMoving = true;
            }
        }

        var cl = color(218, 24, 83);
        fill(cl);
        stroke(cl);
        strokeWeight(1);
        textSize(16);
        text(peakText, width-150-textWidth(peakText), peakTextY );
    }
}

function activatePeakText(Y){
    peakTextMoving = true;
    peaked = false;
    if (Y){
        peakTextY = Y;
    } else {
        peakTextY = -60;
    }

    if (!lastPeakText){
        peakText = random(peakPhrases);
    } else {
        peakText = random(peakPhrases);
        while ( (peakText == lastPeakText) || (peakText == lastLastPeakText) ) {
            peakText = random(peakPhrases);
        }
    }
    lastLastPeakText = lastPeakText;
    lastPeakText = peakText;

    peakTextShowTime = 600 + textWidth(peakText)*3.5;
}

var peakPhrases = 
["Hey there!", 
"Peekaboo!", 
"Why are we here? Just to suffer?", 
"I hope you like playing me!", 
"Have you met Terrence yet?", 
"Minecraft splash? What's that?", 
"Rossiya - svyashchennaya nasha derzhava!", 
"*Laughs in Scandinavian*", 
"Perkele!", 
"Spider ball, spider ball. Does whatever a spider ball does.", 
"Death by snu snu sounds fine by me!", 
"Antman, more like ... buttman", 
"Daaaa daaaa da da daaaa daaaa da da ...", 
"Submit your own phrase in the comments! (seriously this is hard)",
"Article 13? More like... article.. sucky! AMIRIGHT!!",
"Was the summer before the summer of 1970 (family friendly version)",
"Made by Notch!",
"Are you talking to me?",
"Click me baby one more time!",
"1 BTC? Pfft, how much can that really be?"];