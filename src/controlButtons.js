//control buttons
var buttonPause = document.getElementById("pause");
var buttonStart = document.getElementById("start");
var buttonStop = document.getElementById("stop");
var inputSpeed = document.getElementById("speed_factor");
var buttonAddVertices = document.getElementById("add_vertices");
var buttonAddEdges = document.getElementById("add_edges");
var buttonDeleteEdge = document.getElementById("delete_edge");
var buttonDeleteVertex = document.getElementById("delete_vertex");
var buttonClearVertices = document.getElementById("clear_vertices");
var buttonClearEdges = document.getElementById("clear_edges");
var buttonRandom = document.getElementById("random");

//making buttons disabled when one is on active
function setDisabled(flag) {
    ["add_vertices", "delete_vertex", "clear_vertices", "add_edges", "delete_edge", "clear_edges", "random"]
        .forEach(function (id) {
            document.getElementById(id).disabled = flag;
        });
    newEdgeBegin = undefined;
}

inputSpeed.oninput = setSpeed; //change speed during DFS (occurs when value is changed)

function setSpeed() {
    if (isPause) {
        speedFactor = 0;
        return;
    }
    var val = inputSpeed.value;
    speedFactor = Math.pow(2, val);
}

buttonRandom.onclick = function() {
    vertices.pop();
        answer.pop();
        edges = edges.filter(function (e) {
            return e.begin.name !== vertices.length && e.end.name !== vertices.length;
        });
        displayElements();
    example2();
}

buttonPause.onclick = function () {
    buttonStart.disabled = false;
    isPause = true;
    setSpeed();
}

buttonStart.onclick = function () {
    buttonPause.disabled = false;
    buttonStart.disabled = true;
    if (isPause)
        isPause = !isPause;
    else
        dfs();
    setSpeed();
}

buttonStop.onclick = function () {
    isStarted = false;
    setDisabled(false);
    answer.fill(Infinity);
    buttonStart.disabled = false;
    buttonPause.disabled = true;
    isPause = false;
    arrowDFS = [];
    vertices.forEach(function (v) {
        v.color = "#F0FFF0"; //original vertices color
    });
    displayElements();
    actions = [];
    actionsInd = -1;
    connectedComponent = 1;
}

//vertices builder
buttonAddVertices.onclick = function () {
    if (isAddingVertices)
        buttonAddVertices.value = "add vertex";
    else
        buttonAddVertices.value = "enough";
    isAddingVertices = !isAddingVertices;
}

buttonDeleteVertex.onclick = function () {
    vertices.pop();
    answer.pop();
    edges = edges.filter(function (e) {
        return e.begin.name !== vertices.length && e.end.name !== vertices.length;
    });
    displayElements();
}

buttonClearVertices.onclick = function () {
    vertices = [];
    answer = [];
    edges = [];
    displayElements();
}

//edges builder
buttonAddEdges.onclick = function () {
    if (isAddingEdges)
        buttonAddEdges.value = "add edge";
    else
        buttonAddEdges.value = "enough";
    isAddingEdges = !isAddingEdges;
    newEdgeBegin = undefined;
}

buttonDeleteEdge.onclick = function () {
    edges.pop();
    displayElements();
}

buttonClearEdges.onclick = function () {
    edges = [];
    displayElements();
}

//calculating mouse button position
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();//returns size of element and its position relative to the viewport
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getVertex(a) {
    for (var i in vertices) {
        if (distance(a.x, a.y, vertices[i].x, vertices[i].y) <= VERTEX_RADIUS)
            return vertices[i];
    }
    return null;
}

function isEdge(begin, end) {
    for (var i in edges) {
        if (begin === edges[i].begin && end === edges[i].end ||
            begin === edges[i].end && end === edges[i].begin)
            return true;
    }
    return false;
}

//creating new edge (max number - 16)
var newEdgeBegin;
//method to attach an event handler to a specified element
canvas.addEventListener("click", function (evt) {
    var a = getMousePos(evt);
    if (isAddingEdges && !isAddingVertices) {
        a = getVertex(a);
        if (a !== null) {
            if (newEdgeBegin === undefined)
                newEdgeBegin = a;
            else {
                if (a === newEdgeBegin) {
                    alert(" ERROR! Loop : edge isn't created");
                } else if (isEdge(newEdgeBegin, a)) {
                    alert("ERROR! Multiple edges : edge isn't created");
                } else {
                    edges.push(new Edge(newEdgeBegin, a));
                    displayElements();
                }
                newEdgeBegin = undefined;
            }
        }
        return;
    }
    if (isAddingVertices && !isAddingEdges) {
        if (vertices.length >= 16) { //16 is the maximum vertices number
            alert("ERROR! The limit has been reached");
            return;
        }
        vertices.push(new Vertex(a.x, a.y, vertices.length));
        answer.push(Infinity);
        displayElements();
        return;
    }
})
