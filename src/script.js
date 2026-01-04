const canvas = document.getElementById("canvas");
const sidebar = document.getElementById("sidebar");
const autodrawCheckbox = document.getElementById("autodraw");
const settingsDiv = document.getElementById("settings");
const settingsHide = document.getElementById("settingsHide");
const copyClipboard = document.getElementById("copyClipboard");
const output = document.getElementById("output");
const html = document.querySelector("html");
const drawButton = document.getElementById("drawButton");
const settingsButton = document.getElementById("settingsButton");
const settingsLabels = document.querySelectorAll(".settingsLabel");
const languageChanger = document.getElementById("language");
const captionInput = document.querySelector(".captionInput");

// Setting up selected language
var language = localStorage.getItem("language");
if (language == null) {
  language = "en";
}
languageChanger.value = language;

// Setting up canvas
const width = window.innerWidth - 300;
const height = window.innerHeight;
const dpi = window.devicePixelRatio;
const ctx = canvas.getContext("2d");
canvas.width = width*2;
canvas.height = height*2;
canvas.style.width = width+"px";
canvas.style.height = height+"px";
ctx.scale(dpi, dpi);
ctx.font = "20px sans-serif";
ctx.lineWidth = 2;

// Setting constants for drawing
const distance = 50; // Distance between nodes on the canvas
const xLineOffset = 8; // X-Offset for connection line
const yLineOffset = -7; // Y-Offset for connection line
const offset = 4; // Offset for double or trible connection lines

let autoDraw = true; // If canvas should refresh after each change

let outputString = ""; // The finished chemfig output
let nodeIDs = 1; // Increments for each new node created

ctx.fillText("C", width/2, height/2);


let firstNode = document.getElementsByClassName("node")[0];
firstNode.setAttribute("nodeID", "0");
firstNode.firstElementChild.oninput = updateType;
addAddButton(firstNode);

setLanguage();

class chemNode {
  constructor(id, type, bond, angle, children, valenceElectrons) {
    this.id = id;
    this.type = type;
    this.bond = bond;
    this.angle = angle;
    this.children = children;
    this.valenceElectrons = valenceElectrons;
  }
}

let rootNode = new chemNode(0, "C", "", 0, [], [,,,])

let nodes = {"0": rootNode}

function updateLanguage() {
  language = languageChanger.value;
  localStorage.setItem("language", language);
  setLanguage();
}

function setLanguage() { 
  // This function sets all text in HTML Elements to the currently selected language
  drawButton.innerText = languages[language][0];
  output.placeholder = languages[language][1];
  settingsButton.innerText = languages[language][2];
  document.querySelectorAll(".typeInput").forEach(node => node.placeholder = languages[language][3]);
  captionInput.placeholder = languages[language][12];
  document.querySelectorAll(".bondTypeInput").forEach((node) => {
    node.childNodes[0].innerText = languages[language][4];
    node.childNodes[1].innerText = languages[language][5];
    node.childNodes[2].innerText = languages[language][6];
  });
  document.querySelectorAll(".angleInput").forEach(node => node.placeholder = languages[language][7]);
  document.querySelectorAll(".addButton").forEach(node => node.innerText = languages[language][8]);
  settingsLabels[0].firstElementChild.innerText = languages[language][9];
  settingsLabels[1].firstElementChild.innerText = languages[language][10];
  settingsLabels[2].firstElementChild.innerText = languages[language][11];
  settings.firstElementChild.innerText = languages[language][2];
}

function addNode(event) {
  let node = Object.assign(
    document.createElement("div"), 
    {
      classList: "node"
    }
  )
  addTypeInput(node);
  addBondTypeSelect(node);
  addAngleInput(node);
  addValenceElectronInput(node);
  addRemoveButton(node);
  addAddButton(node);
  node.setAttribute("nodeID", nodeIDs);
  newNode = new chemNode(nodeIDs, "C", "Single", 0, [], [,,,]);
  nodes[event.target.parentNode.getAttribute("nodeID")].children.push(newNode);
  event.target.parentNode.insertBefore(node, event.target);
  nodes[nodeIDs] = newNode;
  nodeIDs += 1;
  if (autoDraw) {
    draw()
  }
}

function removeNode(event) {
  let id = event.target.parentNode.getAttribute("nodeID");
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
  let button = Object.assign(
    document.createElement("button"), 
    {
      innerText: languages[language][8],
      classList: "addButton",
      onclick: addNode
    }
  )
  parent.appendChild(button);
}

function addRemoveButton(parent) {
  let button = Object.assign(
    document.createElement("button"), 
    {
      innerText: "X",
      classList: "removeButton",
      onclick: removeNode
    }
  )
  parent.appendChild(button);
}

function addTypeInput(parent) {
  let typeInput = Object.assign(
    document.createElement("input"), 
    {
      type: "text",
      placeholder: languages[language][3],
      value: "C",
      classList: "typeInput",
      oninput: updateType
    }
  )
  parent.appendChild(typeInput);
}

function addAngleInput(parent) {
  let angleInput = Object.assign(
    document.createElement("input"), 
    {
      type: "number",
      placeholder: languages[language][7],
      value: 0,
      classList: "angleInput",
      oninput: updateAngle
    }
  )
  parent.appendChild(angleInput);
}

function addBondTypeSelect(parent) {
  let select = document.createElement("select");
  option = document.createElement("option");
  select.classList.add("bondTypeInput");
  option.selected = true;
  option.value = "Single";
  option.innerText = languages[language][4];
  select.appendChild(option);
  option = document.createElement("option");
  option.value = "Double";
  option.innerText = languages[language][5];
  select.appendChild(option);
  option = document.createElement("option");
  option.value = "Trible";
  option.innerText = languages[language][6];
  select.appendChild(option);
  select.oninput = updateBond;
  parent.appendChild(select);
}

function addValenceElectronInput(parent) {
  let div = document.createElement("div");
  div.classList.add("valenceElectronsContainer");
  for (i = 0; i<4; i++) {
    input = document.createElement("input");
    input.type = "number";
    input.classList.add("valenceElectronsInput");
    input.oninput = updateValenceElectron;
    input.setAttribute("index", i);
    div.appendChild(input);
  }
  parent.appendChild(div);
}

function create() {
  generateCode();
  draw();
}

function generateCode() {
  outputString = "";

  if (rootNode.caption != "" && rootNode.caption) { // If fig has a name
    outputString += "\\chemname{";
  }

  outputString += "\\chemfig{";
  
  firstElectronCharge = true;
  rootNode.valenceElectrons.forEach(valenceElectron => {
    if (valenceElectron == "" || valenceElectron == undefined) { // If charge is not defined
      return;
    }
    if (firstElectronCharge) {
      outputString += "\\charge{"
      firstElectronCharge = false
    }
    else {
      outputString += ","
    }
    outputString += `${valenceElectron}=\\|`;
  })
  if (firstElectronCharge) {
    outputString += rootNode.type;
  }
  else {
    outputString += `}{${rootNode.type}}`;
  }

  codeChildren(rootNode.children);

  if (rootNode.caption != "" && rootNode.caption) {
    outputString += `}{${rootNode.caption}}`;
  }

  outputString += "}";
  if (copyClipboard.checked) {
    navigator.clipboard.writeText(outputString);
  }
  output.value = outputString;
}

function codeChildren(children) {
  children.forEach(child => {
    if (children.length > 1) {
      outputString += "("
    }
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
    if (child.angle != 0) {
      outputString += `[:${child.angle}]`
    }
    firstElectronCharge = true;
    rootNode.valenceElectrons.forEach(valenceElectron => {
      if (valenceElectron == "" || valenceElectron == undefined) { // If charge is not defined
        return;
      }
      if (firstElectronCharge) {
        outputString += "\\charge{"
        firstElectronCharge = false
      }
      else {
        outputString += ","
      }
      outputString += `${valenceElectron}=\\|`;
    })
    if (firstElectronCharge) {
      outputString += rootNode.type;
    }
    else {
      outputString += `}{${child.type}}`;
    }
    codeChildren(child.children)
    if (children.length > 1) {
      outputString += ")";
    }
  })
}

function draw() {
  let xPosition = width/2;
  let yPosition = height/2;
  let boundingBox = [xPosition, yPosition, xPosition, yPosition]
  ctx.clearRect(0, 0, width, height);
  ctx.fillText(rootNode.type, xPosition, yPosition);

  rootNode.valenceElectrons.forEach(valenceElectron => {
    if (valenceElectron != "") {
      degree = (valenceElectron-40)
      degree2 = (parseInt(valenceElectron)+40)
      ctx.beginPath();
      ctx.moveTo(
        xPosition+xLineOffset + Math.round(Math.cos(degree * (Math.PI / 180))*(xLineOffset+6), 1),
        yPosition+yLineOffset - Math.round(-Math.sin(degree * (Math.PI / 180))*(yLineOffset-6), 1)
      );
      ctx.lineTo(
        xPosition+xLineOffset + Math.round(Math.cos(degree2 * (Math.PI / 180))*(xLineOffset+6), 1),
        yPosition+yLineOffset - Math.round(-Math.sin(degree2 * (Math.PI / 180))*(yLineOffset-6), 1)
      );
      ctx.closePath();
      ctx.stroke();
    }
  })

  drawRecursive(rootNode.children, rootNode.type, xPosition, yPosition, boundingBox);
  boundingBoxPadding = 30
  boundingBoxCorrection = [10, 10]
  boundingBox[0] -= boundingBoxPadding - boundingBoxCorrection[0]
  boundingBox[1] -= boundingBoxPadding + boundingBoxCorrection[1]
  boundingBox[2] += boundingBoxPadding + boundingBoxCorrection[0]
  boundingBox[3] += boundingBoxPadding - boundingBoxCorrection[1]
  // ctx.beginPath();
  // ctx.moveTo(boundingBox[0], boundingBox[1]);
  // ctx.lineTo(boundingBox[2], boundingBox[1]);
  // ctx.lineTo(boundingBox[2], boundingBox[3]);
  // ctx.lineTo(boundingBox[0], boundingBox[3]);
  // ctx.closePath();
  // ctx.stroke();
  if (rootNode.caption) {
    ctx.fillText(rootNode.caption, boundingBox[0], boundingBox[3]);
  }
}

function drawRecursive(nodes, oldNodeType, xPosition, yPosition, boundingBox) {
  nodes.forEach(node => {
    newY = Math.round(-Math.sin(node.angle * (Math.PI / 180))*distance, 1);
    newX = Math.round(Math.cos(node.angle * (Math.PI / 180))*distance, 1);
    ctx.fillText(node.type, xPosition+newX, yPosition+newY);
    boundingBox[0] = Math.min(boundingBox[0], xPosition+newX);
    boundingBox[2] = Math.max(boundingBox[2], xPosition+newX);
    boundingBox[1] = Math.min(boundingBox[1], yPosition+newY);
    boundingBox[3] = Math.max(boundingBox[3], yPosition+newY);

    node.valenceElectrons.forEach(valenceElectron => {
      if (valenceElectron != "") {
        degree = (valenceElectron-40)
        degree2 = (parseInt(valenceElectron)+40)
        ctx.beginPath();
        ctx.moveTo(
          xPosition+xLineOffset+newX + Math.round(Math.cos(degree * (Math.PI / 180))*(xLineOffset+6), 1),
          yPosition+yLineOffset+newY - Math.round(-Math.sin(degree * (Math.PI / 180))*(yLineOffset-6), 1)
        );
        ctx.lineTo(
          xPosition+xLineOffset+newX + Math.round(Math.cos(degree2 * (Math.PI / 180))*(xLineOffset+6), 1),
          yPosition+yLineOffset+newY - Math.round(-Math.sin(degree2 * (Math.PI / 180))*(yLineOffset-6), 1)
        );
        ctx.closePath();
        ctx.stroke();
      }
    });

    if (node.bond == "Single") {
      ctx.beginPath();
      if (oldNodeType != "") {
        ctx.moveTo(
          xPosition+xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1),
          yPosition+yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4), 1)
        );
      }
      else {
        ctx.moveTo(
          xPosition+xLineOffset, 
          yPosition+yLineOffset
        );
      }
      if (node.type != "") {
        ctx.lineTo(
          xPosition+newX+xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1),
          yPosition+newY+yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4), 1)
        );
      }
      else {
        ctx.lineTo(
          xPosition+newX+xLineOffset, 
          yPosition+newY+yLineOffset
        );
      }
      ctx.closePath();
      ctx.stroke();
    }
    else if (node.bond == "Double") {
      perpendicularOffsetX = Math.round(-Math.sin(node.angle * (Math.PI / 180)) * offset, 1);
      perpendicularOffsetY = Math.round(Math.cos(node.angle * (Math.PI / 180)) * offset, 1);

      ctx.beginPath();
      ctx.moveTo(
          xPosition + xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) + perpendicularOffsetX,
          yPosition + yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) + perpendicularOffsetY
      );
      ctx.lineTo(
          xPosition + newX + xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) + perpendicularOffsetX,
          yPosition + newY + yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) + perpendicularOffsetY
      );
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
          xPosition + xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) - perpendicularOffsetX,
          yPosition + yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) - perpendicularOffsetY
      );
      ctx.lineTo(
          xPosition + newX + xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) - perpendicularOffsetX,
          yPosition + newY + yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) - perpendicularOffsetY
      );
      ctx.closePath();
      ctx.stroke();
    }
    else if (node.bond == "Trible") {
      perpendicularOffsetX = Math.round(-Math.sin(node.angle * (Math.PI / 180)) * offset, 1);
      perpendicularOffsetY = Math.round(Math.cos(node.angle * (Math.PI / 180)) * offset, 1);

      ctx.beginPath();
      ctx.moveTo(
          xPosition + xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) + perpendicularOffsetX,
          yPosition + yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) + perpendicularOffsetY
      );
      ctx.lineTo(
          xPosition + newX + xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) + perpendicularOffsetX,
          yPosition + newY + yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) + perpendicularOffsetY
      );
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(
          xPosition + xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) - perpendicularOffsetX,
          yPosition + yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) - perpendicularOffsetY
      );
      ctx.lineTo(
          xPosition + newX + xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180)) * (xLineOffset + 4), 1) - perpendicularOffsetX,
          yPosition + newY + yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180)) * (yLineOffset - 4), 1) - perpendicularOffsetY
      );
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        xPosition+xLineOffset + Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1),
        yPosition+yLineOffset - Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4), 1)
      );
      ctx.lineTo(
        xPosition+newX+xLineOffset - Math.round(Math.cos(node.angle * (Math.PI / 180))*(xLineOffset+4), 1),
        yPosition+newY+yLineOffset + Math.round(-Math.sin(node.angle * (Math.PI / 180))*(yLineOffset-4))
      );
      ctx.closePath();
      ctx.stroke();

    }

    drawRecursive(node.children, node.type, xPosition+newX, yPosition+newY, boundingBox);
  })
}

function updateType(event) {
  nodes[event.target.parentNode.getAttribute("nodeID")].type = event.target.value;
  if (autoDraw) {
    draw()
  }
}

function updateCaption(event) {
  rootNode.caption = event.target.value;
  if (autoDraw) {
    draw()
  }
}

captionInput.addEventListener("input", updateCaption);

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

function updateValenceElectron(event) {
  nodes[event.target.parentNode.parentNode.getAttribute("nodeID")].valenceElectrons[event.target.getAttribute("index")] = event.target.value;
  if (autoDraw) {
    draw()
  }
}

function openSettings() {
  settingsDiv.style.display = "flex";
  settingsHide.style.display = "block";
}

settingsHide.addEventListener("click", () => {
  settingsDiv.style.display = "none";
  settingsHide.style.display = "none";
})

output.addEventListener("focus", () => output.select());
output.addEventListener("click", () => output.select());

autodrawCheckbox.addEventListener("change", () => {
  autoDraw = autodrawCheckbox.checked;
})