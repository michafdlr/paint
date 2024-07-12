const activeToolEl = document.getElementById('active-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const bucketBtn = document.getElementById('bucket');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const eraser = document.getElementById('eraser');
const textbox = document.getElementById('textbox');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const downloadMessage = document.getElementById('download-message');
const filename = document.getElementById('filename');
const saveBtn = document.getElementById('save');
const { body } = document;

// Global Variables
const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let currentSize = 10;
let lastSize = 10;
let bucketColor = '#ffffff';
let currentColor = 'rgb(0 0 0)';
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];
let textboxSelected = false;
let font = 'Oswald';
let fontSize = `${2*currentSize}px`;
let textArray = [];

// Formatting Brush Size
function displayBrushSize() {
  if (brushSlider.value < 10) {
    brushSize.textContent = `0${brushSlider.value}`
  } else {
    brushSize.textContent = brushSlider.value
  }
}

// Setting Brush Size
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener('change', switchToBrush)

// Setting Background Color
bucketColorBtn.addEventListener('change', () => {
  bucketColor = `#${bucketColorBtn.value}`;
  bucketBtn.style.color = bucketColor;
})

bucketBtn.addEventListener('click', () => {
  createCanvas();
  restoreCanvas();
})

// // Eraser
eraser.addEventListener('click', () => {
  textboxSelected = false;
  lastSize = currentSize;
  isEraser = true;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  currentColor = bucketColor;
  currentSize = 50;
  brushSlider.value = currentSize;
  displayBrushSize();
});

// Textbox

textbox.addEventListener('click', () => {
  if (isEraser) {
    currentSize = lastSize
  }
  textboxSelected = true;
  isEraser = false;
  activeToolEl.textContent = 'Text';
  eraser.style.color = 'white';
  brushIcon.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  textbox.style.color = currentColor;
  brushSlider.value = currentSize;
  displayBrushSize();
})

//Function to dynamically add an input box:
function addInput(x, y) {

  const input = document.createElement('input');

  input.type = 'text';
  input.style.position = 'fixed';
  input.style.left = (x-20) + 'px';
  input.style.top = (y+50) + 'px';
  input.style.zIndex = '100';

  input.onkeydown = handleEnter;

  body.appendChild(input);

  input.focus();
}

//Key handler for input box:
function handleEnter(e) {
  const keyCode = e.keyCode;
  if (keyCode === 13) {
    drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
    body.removeChild(this);
    console.log(textArray)
  }
}

function drawText(txt, x, y) {
  context.textBaseline = 'top';
  context.textAlign = 'left';
  fontSize = `${2*currentSize}px `
  context.font = fontSize + font;
  context.fillStyle = currentColor;
  context.fillText(txt, x, y);
  textArray.push({
    txt, x, y, currentColor, fontSize
  })
}

// // Switch back to Brush
function switchToBrush() {
  if (isEraser) {
    currentSize = lastSize;
  }
  textboxSelected = false;
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  eraser.style.color = 'white';
  textbox.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  brushIcon.style.color = currentColor;
  brushSlider.value = currentSize;
  displayBrushSize();
}

// Create Canvas
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight-50;
  context.fillStyle = bucketColor;
  context.fillRect(0,0,canvas.width,canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

// // Clear Canvas
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = 'Canvas Cleared';
  setTimeout(switchToBrush, 1500);
});

// // Draw what is stored in DrawnArray
function restoreCanvas() {
  textArray.forEach((item) => {
    context.textBaseline = 'top';
    context.textAlign = 'left';
    context.font = item.fontSize + font;
    context.fillStyle = item.currentColor;
    context.fillText(item.txt, item.x, item.y);
  })
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    if (drawnArray[i].erase) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// // Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down
canvas.addEventListener('mousedown', (event) => {
  if (!textboxSelected) {
    isMouseDown = true;
    const currentPosition = getMousePosition(event);
    context.moveTo(currentPosition.x, currentPosition.y);
    context.beginPath();
    context.lineWidth = currentSize;
    context.lineCap = 'round';
    context.strokeStyle = currentColor;
  } else {
    const currentPosition = getMousePosition(event);
    addInput(currentPosition.x, currentPosition.y)
  }
});

// Mouse Move
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  } else {
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// // Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('drawnArray', JSON.stringify(drawnArray))
  localStorage.setItem('textArray', JSON.stringify(textArray))
  localStorage.setItem('bucketColor', JSON.stringify(bucketColor))
  localStorage.setItem('brushColor', JSON.stringify(`#${brushColorBtn.value}`))
  // Active Tool
  activeToolEl.textContent = 'Canvas Saved';
  setTimeout(switchToBrush, 1500);
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  if (localStorage.drawnArray) {
    drawnArray = JSON.parse(localStorage.getItem('drawnArray'));
    textArray = JSON.parse(localStorage.getItem('textArray'));
    bucketColor = JSON.parse(localStorage.getItem('bucketColor'));
    currentColor = JSON.parse(localStorage.getItem('brushColor'));
    bucketBtn.style.color = bucketColor;
    bucketColorBtn.value = bucketColor.replace('#', '');
    brushIcon.style.color = currentColor;
    brushColorBtn.value = currentColor.replace('#', '');
    createCanvas();
    restoreCanvas();
  // Active Tool
    activeToolEl.textContent = 'Canvas Loaded';
    setTimeout(switchToBrush, 1500);
  } else {
    activeToolEl.textContent = 'No Saved Canvas';
    setTimeout(switchToBrush, 1500);
  }
});

// // Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  ['drawnArray', 'bucketColor', 'brushColor'].forEach((item) => {
    localStorage.removeItem(item)
  })
  // Active Tool
  activeToolEl.textContent = 'Local Storage Cleared';
  setTimeout(switchToBrush, 1500);
});

// // Download Image
downloadBtn.addEventListener('click', () => {
  if (canvas.getContext) {
    downloadMessage.style.display = 'flex';
  } else {
    alert('No Canvas Found!')
  }
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `${filename.value}.png`;
  link.href = canvas.toDataURL('image/png', 1);
  link.click();
  link.remove();
  // Active Tool
  downloadMessage.style.display = 'none';
  filename.value = '';
  activeToolEl.textContent = 'PNG File Saved';
  setTimeout(switchToBrush, 1500);
})

// // Event Listener
brushIcon.addEventListener('click', switchToBrush);
window.addEventListener('resize', () => {
  createCanvas();
  restoreCanvas();
})

// On Load
createCanvas();
