var VERTEX_RADIUS = 15;
var INTERVAL = 10; //update interval of the animation
var ARROW_COLOR = "#f00000";

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

var connectedComponent = 1;
var speedFactor = 1;
var isPause = false;
var isStarted = false;
var isAddingVertices = false;
var isAddingEdges = false;
var answer = []; //visited vertices
var vertices = [];
var edges = [];
var arrowDFS = [];//edges DFS graph
var actions = [], actionsInd = -1; // events

//Creating vertices
function Vertex(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = "#F0FFF0"; //original color
}

Vertex.prototype.display = function () {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000"; //original graph color
    ctx.arc(this.x, this.y, VERTEX_RADIUS, 0, 2 * Math.PI, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke(); //draw it
    displayText(this.name, this.x, this.y);
}

//Creating edges
function Edge(begin, end) {
    this.begin = begin;
    this.end = end;
}

Edge.prototype.display = function () {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000"; //original graph color
    ctx.moveTo(this.begin.x, this.begin.y);//move to position
    ctx.lineTo(this.end.x, this.end.y);//create a line to position
    ctx.stroke();
}

//Visual appearance of oriented edges while searching
function Arrow() {
    Edge.apply(this, arguments);
    this.length = VERTEX_RADIUS;
}

Arrow.prototype.display = function () {
   //  15 is a length of arrow
   // Math.PI / 8 angle of arrow
   answer[this.begin.name]=used[this.begin.name];//filling the start vertex in graph
   var aLeft, aRight, aBegin;
   var angle = Math.atan2(this.begin.x - this.end.x, this.begin.y - this.end.y); //direction of arrow
   aBegin = {
       x: this.begin.x - this.length * Math.sin(angle),
       y: this.begin.y - this.length * Math.cos(angle)
   };
   aLeft = {
       x: aBegin.x + 15 * Math.sin(angle + Math.PI / 8),
       y: aBegin.y + 15 * Math.cos(angle + Math.PI / 8)
   };
   aRight = {
       x: aBegin.x + 15 * Math.sin(angle - Math.PI / 8),
       y: aBegin.y + 15 * Math.cos(angle - Math.PI / 8)
   };
   //drawing
   ctx.beginPath();
   ctx.lineWidth = 3;
   ctx.strokeStyle = ARROW_COLOR;
   ctx.moveTo(this.begin.x, this.begin.y);
   ctx.lineTo(aBegin.x, aBegin.y);
   ctx.moveTo(aLeft.x, aLeft.y);
   ctx.lineTo(aBegin.x, aBegin.y);
   ctx.lineTo(aRight.x, aRight.y);
   ctx.fillStyle = ARROW_COLOR;
   ctx.fill();
   ctx.stroke();
}

//needed in MovingArrow
Arrow.prototype.getArrow = function () {
    var angle = Math.atan2(this.begin.x - this.end.x, this.begin.y - this.end.y);
    return {x: this.begin.x - this.length * Math.sin(angle), y: this.begin.y - this.length * Math.cos(angle)};
}

//display text in point (x;y)
function displayText(text, x, y) {
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = "#000000"; //color of text
    ctx.fillText(text, x, y);
}

//calculate  distance
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

//check if the point in vertex
function isPointInVertex(x, y, v) {
    return distance(x, y, v.x, v.y) <= VERTEX_RADIUS;
}

//display all elements
function displayElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);//clear rectangle within a given
    ctx.fillStyle = "#DAF7A6"; //background color
    ctx.font = '15px sans-serif';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    [edges, arrowDFS, vertices].forEach(function (w) {
        w.forEach(function display(q) {
            q.display();
        })
    });
    displayAns();
}

//display answer array and numbers above it
function displayAns() {
    var ANS_BOLD = 30;// size of array's cells
    answer.forEach(function (a, j) {
        var y = canvas.height - ANS_BOLD;
        var x = 150 + ANS_BOLD * j;//100 - indention
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, ANS_BOLD, ANS_BOLD);//draw rectangle
        displayText(j, x + 0.5 * ANS_BOLD, y - 0.5 * ANS_BOLD);
        var mes = answer[j] === Infinity ? '✕' : answer[j];
        displayText(mes, x + 0.5 * ANS_BOLD, y + 0.5 * ANS_BOLD);
    })
}

//color changing while searching
// blue color - during vertex; red - visited (blue -> red)
function ColorChange(vertex) {
    this.vertex = vertex;
}

ColorChange.prototype.doIt = function () {
    var r = 0, b = 240;
    var v = this.vertex;
    answer[v.name]=used[v.name];//needs for lonely vertices
    var animation = setInterval(function () {
        if (!isStarted) {
            clearInterval(animation);
            return;
        } // stop -> reset
        if (r >= 240) {
            clearInterval(animation);
            actions[++actionsInd].doIt();
            return;
        }
        r += speedFactor * 0.4 * INTERVAL; // 0.4 rate of color changing
        b = 240 - r;
        v.color = "rgb(" + r + ",0," + b + ")";
        displayElements();
    }, INTERVAL)
}

//arrow moving between vertices
//arrow is Arrow
function MovingArrow(arrow) {
    this.arrow = arrow
}

MovingArrow.prototype.doIt = function () {
    var a = this.arrow;
    arrowDFS.push(a);
    var animation = setInterval(function () {
        if (!isStarted) {
            clearInterval(animation);
            return;
        } // the same as before
        if (isPointInVertex(a.getArrow().x, a.getArrow().y, a.end)) {
            clearInterval(animation);
            actions[++actionsInd].doIt();
            //a.end.color = ARROW_COLOR;
            answer[a.end.name] = used[a.end.name];//needs for vertices without children
            displayElements();
            return;
        }
        a.length += speedFactor * 0.1 * INTERVAL; // 0.1 arrow speed
        var tt = distance(a.begin.x,a.begin.y, a.end.x, a.end.y)-VERTEX_RADIUS;
        if (tt < a.length){
            a.length = tt + 0.1; // 0.1 helps to reach the vertex
            }
        displayElements();
    }, INTERVAL)
}

// example graph
function example() {
    vertices = [new Vertex(100, 100, 0), new Vertex(50, 200, 1), new Vertex(100, 300, 2),
                new Vertex(300, 300, 3), new Vertex(350, 200, 4), new Vertex(300, 100, 5)];
    edges = [new Edge(vertices[0], vertices[1]),new Edge(vertices[0], vertices[2]), new Edge(vertices[0], vertices[3]),
             new Edge(vertices[1], vertices[4]), new Edge(vertices[1], vertices[5]), new Edge(vertices[2], vertices[4]),
             new Edge(vertices[1], vertices[2]), new Edge(vertices[4], vertices[5])];
    answer = new Array(vertices.length);
    answer.fill(Infinity);
    displayElements();
}

function example2() {
    vertices = [new Vertex(100, 100, 0), new Vertex(50, 200, 1), new Vertex(100, 300, 2),
                new Vertex(300, 300, 3), new Vertex(350, 200, 4), new Vertex(300, 100, 5)];
    edges = [];
    for(i in vertices){
        var r1 = Math.floor(Math.random()*6);
        //var r2 = Math.floor(Math.random()*6);
        edges.push(new Edge(vertices[i],vertices[r1]));
        //edges.push(new Edge(vertices[i],vertices[r2]));
    }
    answer = new Array(vertices.length);
    answer.fill(Infinity);
    displayElements();
}

//automatically loaded
example();

var s = [];
var used = [];
var checking = [];//check if vertex was put in stack again

//DFS algorithm
function dfs() {
    setDisabled(true);
    isStarted = true;
    isAddingVertices = false;
    isAddingEdges = false;
    s = [];
    used = (new Array(vertices.length)).fill(0);
    checking = (new Array(vertices.length)).fill(false);
    vertices[0].color = "FF00FF";//вершина сразу горит синим
    for(var i in used){
    if(used[i] === 0){
        s.push(vertices[i]); // add start
        used[i] = connectedComponent;
        displayElements();
        dfs2();
        connectedComponent++;
        }
    }
    actions[++actionsInd].doIt();
}

function dfs2(){
    while (s.length > 0) {
        var v = s.pop(), u;
        checking[v.name]=false;
        for (var i in edges) {
            if (edges[i].end === v || edges[i].begin === v) {
                u = vertices[edges[i].end.name ^ edges[i].begin.name ^ v.name];
                if (used[u.name] === 0) {
                    s.push(vertices[v.name]);
                    checking[v.name]=true;
                    s.push(vertices[u.name]);
                    actions.push(new ColorChange(v));//go ahead
                    actions.push(new MovingArrow(new Arrow(v, u)));
                    used[u.name] = connectedComponent;
                    break;
                }
            }
        }
        if (!checking[v.name])
        actions.push(new ColorChange(v));//move backwards
    }
}


