//for general functions that can be reused in other projects

//sees if two finite lines intersect. If one of the lines end point
//is right on the other line, they do not intersect. Nor do they
//intersect if they are lying on top of each other in the same line.
function linesIntersecting(L1, L2) {
  
  var A1 = new Point(L1.p1.x, L1.p1.y);
  var A2 = new Point(L1.p2.x, L1.p2.y);
  
  var B1 = new Point(L2.p1.x, L2.p1.y);
  var B2 = new Point(L2.p2.x, L2.p2.y);
  
  var endPoints = [A1, A2, B1, B2];
  
  var Am = (A2.y - A1.y) / (A2.x - A1.x);
  var Bm = (B2.y - B1.y) / (B2.x - B1.x);
      
  var i;
  var xI, yI;
  
  var Ac = A2.y - Am * A2.x;
  var Bc = B2.y - Bm * B2.x;

  if ((abs(Am) == Infinity) && (abs(Bm) != Infinity)) {
    //line A is vertical and B is not
    xI = A2.x;
    yI = Bm * xI + Bc;
    i = new Point(xI, yI);

  } else if ((abs(Am) != Infinity) && (abs(Bm) == Infinity)) {
    //line B is vertical and A is not
    xI = B1.x;
    yI = Am * xI + Ac;
    i = new Point(xI, yI);
    i.x = round(i.x);

  } else if ((abs(Am) == Infinity) && (abs(Bm) == Infinity)) {
    return false; //maybe this could be dealt with better in the future

  } else {
    //lines aren't bloody vertical
    xI = (Bc - Ac) / (Am - Bm);
    yI = Am * xI + Ac;
    i = new Point(xI, yI); //interscting point
  }
  
  //dealing with flat lines
  if (Bm == 0){
    i.y = round(i.y);
  }


  //get upper and lower coordinates for both lines
  var AupperX;
  var AupperY;
  var AlowerX;
  var AlowerY;

  var BupperX;
  var BupperY;
  var BlowerX;
  var BlowerY;

  // B line
  if (B1.x > B2.x) {
    BupperX = B1.x;
    BlowerX = B2.x;
  } else {
    BupperX = B2.x;
    BlowerX = B1.x;
  }
  if (B1.y > B2.y) {
    BupperY = B1.y;
    BlowerY = B2.y;
  } else {
    BupperY = B2.y;
    BlowerY = B1.y;
  }

  // A line
  if (A1.x > A2.x) {
    AupperX = A1.x;
    AlowerX = A2.x;
  } else {
    AupperX = A2.x;
    AlowerX = A1.x;
  }
  if (A1.y > A2.y) {
    AupperY = A1.y;
    AlowerY = A2.y;
  } else {
    AupperY = A2.y;
    AlowerY = A1.y;
  }


  if ((i.x >= AlowerX) && (i.x <= AupperX)) { //within x bounds of A
    //console.log("within x bounds of A");
    if ((i.y >= AlowerY) && (i.y <= AupperY)) { //within y bounds of A
      //console.log("within y bouds of A");
      if ((i.x >= BlowerX) && (i.x <= BupperX)) { //within x bounds of B
        //console.log("within x bounds of B");
        if ((i.y >= BlowerY) && (i.y <= BupperY)) { //within y bounds of B
          //console.log("within y bounds of B");
          
          //check that point is not end point of either line
          var notAnEndPoint = true;
          var k = 100;
          
          for (let p of endPoints){
            var x1 = round(p.x*k)/k;
            var x2 = round(i.x*k)/k;
            var y1 = round(p.y*k)/k;
            var y2 = round(i.y*k)/k;
            
            if ( (x1 == x2) && (y1 == y2) ){
              notAnEndPoint = false;
              break;
            }
          }
          
          if (notAnEndPoint){
            return i;
          } else {
            //console.log("end point");
            return false;
          }
        }
      }
    }
  }

  return false;
}



// returns angle needed to intersept a moving object
function predictLinear( iPos, iVel, bPos, bSpeed ){
  // requires p5.js Vectors
  // iPos == position vector of intersept object
  // iVel == velocity vector of intersepct object 
  // bPos == position vector of bullet
  // bSpeed == speed (scalar) of bullet
  
  var iSpeed = iVel.mag();
  var angP = iVel.heading();
  var initialDistanceVector = p5.Vector.sub(iPos, bPos);
  var angT = initialDistanceVector.heading();
  
  var ang = angT - asin( (iSpeed / bSpeed) * sin( PI + angP - angT ) );
  return ang;
}



//hookpoint constructor
function Point(x, y) {
    this.x = x;
    this.y = y;
}

//Vertex constructor
function Vertex(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    this.show = function () {
        strokeWeight(2.5);
        stroke(220, 100, 100);
        line(p1.x, p1.y, p2.x, p2.y);
    }

    this.length = function(){
        return dist(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }
}