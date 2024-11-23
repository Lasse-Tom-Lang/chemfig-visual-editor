const canvas = document.getElementById("canvas");
const sidebar = document.getElementById("sidebar");
const autodrawCheckbox = document.getElementById("autodraw");

const width = window.innerWidth - 300;
const height = window.innerHeight;

canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
const dpi = window.devicePixelRatio;

let outputString = ""

const distance = 50;
const xLineOffset = 8;
const yLineOffset = -7;

let autoDraw = true;

const ctx = canvas.getContext("2d");
ctx.scale(dpi, dpi);

ctx.font = "20px sans-serif";
ctx.lineWidth = 2;

ctx.fillText("C", width/2, height/2);

// ctx.beginPath();
// ctx.moveTo(width/2+20, height/2-8);
// ctx.lineTo(width/2+30, height/2-8);
// ctx.closePath();
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(width/2-5, height/2-8);
// ctx.lineTo(width/2-15, height/2-8);
// ctx.closePath();
// ctx.stroke();

let firstNode = document.getElementsByClassName("node")[0];
firstNode.setAttribute("nodeID", "0");
firstNode.firstElementChild.onchange = updateType;
addAddButton(firstNode);
nodeIDs = 1

autodrawCheckbox.addEventListener("change", () => {
  autoDraw = autodrawCheckbox.checked;
})

function addNode(event) {
  let node = document.createElement("div");
  node.classList.add("node");
  addTypeInput(node);
  addBondTypeSelect(node);
  addAngleInput(node);
  addRemoveButton(node);
  addAddButton(node);
  node.setAttribute("nodeID", nodeIDs);
  newNode = new chemNode(nodeIDs, "C", "Single", 0, []);
  nodes[event.target.parentNode.getAttribute("nodeID")].children.push(newNode);
  event.target.parentNode.insertBefore(node, event.target);
  nodes[nodeIDs] = newNode;
  nodeIDs += 1;
  if (autoDraw) {
    draw()
  }
}

function removeNode(event) {
  id = event.target.parentNode.getAttribute("nodeID");
  parentID = event.target.parentNode.parentNode.getAttribute("nodeID");
  event.target.parentNode.remove()
  removeChildren(nodes[id].children)
  nodes[id].children = []
  delete nodes[id]
  for (let i = 0; i<nodes[parentID].children.length; i++) {
    if (nodes[parentID].children[i].id == id) {
      nodes[parentID].children.splice(i, 1);
      break;
    }
  }
  if (autoDraw) {
    draw()
  }
}

function removeChildren(children) {
  children.forEach(child => {
    removeChildren(child.children);
    delete nodes[child.id]
    child.children = [];
  })
}

function addAddButton(parent) {
  let button = document.createElement("button");
  button.innerText = "Add";
  button.classList.add("addButton");
  button.onclick = addNode;
  parent.appendChild(button);
}

function addRemoveButton(parent) {
  let button = document.createElement("button");
  button.innerText = "Remove";
  button.classList.add("addButton");
  button.onclick = removeNode;
  parent.appendChild(button);
}

function addTypeInput(parent) {
  let typeInput = document.createElement("input");
  typeInput.type = "text";
  typeInput.placeholder = "Type";
  typeInput.value = "C";
  typeInput.onchange = updateType;
  parent.appendChild(typeInput);
}

function addAngleInput(parent) {
  let angleInput = document.createElement("input");
  angleInput.type = "number";
  angleInput.placeholder = "Angle";
  angleInput.value = 0;
  angleInput.onchange = updateAngle;
  parent.appendChild(angleInput);
}

function addBondTypeSelect(parent) {
  let select = document.createElement("select");
  option = document.createElement("option");
  option.selected = true;
  option.value = "Single";
  option.innerText = "Single";
  select.appendChild(option);
  option = document.createElement("option");
  option.value = "Double";
  option.innerText = "Double";
  select.appendChild(option);
  option = document.createElement("option");
  option.value = "Trible";
  option.innerText = "Trible";
  select.appendChild(option);
  select.onchange = updateBond;
  parent.appendChild(select);
}

function create() {
  generateCode();
  draw();
}

function generateCode() {
  outputString = "\\chemfig{";

  outputString += rootNode.type;

  codeChildren(rootNode.children);

  outputString += "}";
  console.log(outputString)
  navigator.clipboard.writeText(outputString);
  // alert("Copied to clipboard: " + outputString);
}

function codeChildren(children) {
  children.forEach(child => {
    outputString += "("
    switch (child.bond) {
      case "Single":
        outputString += "-";
        break;
      case "Double":
        outputString += "=";
        break;
      case "Trible": 
        outputString += "~";
        break;
    }
    outputString += `[:${child.angle}]${child.type}`
    codeChildren(child.children)
    outputString += ")";
  })
}

function draw() {
  let xPosition = width/2;
  let yPosition = height/2;
  ctx.clearRect(0, 0, width, height);
  ctx.fillText(rootNode.type, xPosition, yPosition);
  drawRecursive(rootNode.children, rootNode, xPosition, yPosition);
}

function drawRecursive(nodes, oldNode, xPosition, yPosition) {
  nodes.forEach(node => {
    newY = Math.round(-Math.sin(node.angle * (Math.PI / 180))*distance, 1);
    newX = Math.round(Math.cos(node.angle * (Math.PI / 180))*distance, 1);
    ctx.fillText(node.type, xPosition+newX, yPosition+newY);

    ctx.beginPath();
    if (node.type != "" && oldNode.type != "") {
      ctx.moveTo(xPosition+xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1), yPosition+yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4), 1));
      ctx.lineTo(xPosition+newX+xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1), yPosition+newY+yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4)));
    }
    else if (node.type == "" && oldNode.type != "") {
      ctx.moveTo(xPosition+xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1), yPosition+yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4), 1));
      ctx.lineTo(xPosition+newX+xLineOffset, yPosition+newY+yLineOffset);
    }
    else if (node.type != "" && oldNode.type == "") {
      ctx.moveTo(xPosition+xLineOffset, yPosition+yLineOffset);
      ctx.lineTo(xPosition+newX+xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1), yPosition+newY+yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4)));
    }
    else if (node.type == "" && oldNode.type == "") {
      ctx.moveTo(xPosition+xLineOffset, yPosition+yLineOffset);
      ctx.lineTo(xPosition+newX+xLineOffset, yPosition+newY+yLineOffset);
    }
    ctx.closePath();
    ctx.stroke();

    drawRecursive(node.children, node, xPosition+newX, yPosition+newY);
  })
}

function updateType(event) {
  nodes[event.target.parentNode.getAttribute("nodeID")].type = event.target.value;
  if (autoDraw) {
    draw()
  }
}

function updateBond(event) {
  nodes[event.target.parentNode.getAttribute("nodeID")].bond = event.target.value;
  if (autoDraw) {
    draw()
  }
}

function updateAngle(event) {
  nodes[event.target.parentNode.getAttribute("nodeID")].angle = event.target.value;
  if (autoDraw) {
    draw()
  }
}

class chemNode {
  constructor(id, type, bond, angle, children) {
    this.id = id;
    this.type = type;
    this.bond = bond;
    this.angle = angle;
    this.children = children;
  }
}

let rootNode = new chemNode(0, "C", "", 0, [])

nodes = {"0": rootNode}