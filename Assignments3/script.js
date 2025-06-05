/* 

CONTEXT & ACTION
 This prototype modelled a digital “notebook collage” tool. 
 The primary interaction is “drag + click”, reflecting how artists actually work with clip art on the desktop. 
 Haptics were automated through the use of HTML5 and pure JavaScript, allowing the user to drag assets, click 
 to select them, and then rotate/zoom or delete them.
 Background Selection: This is an experimental digital scrapbook, powered by a clean, uncluttered user interface 
 that mimics the feel of a blank page. The site focuses on user creativity rather than toolbars.

DESIGN CHOICES
  1. Font & Aesthetic
     - Monospace (‘Courier New’) is used to evoke a retro “pixelated” 
       feel, reminiscent of early graphical tools and pixel art workflows. This 
       influences readability, creating a sense of nostalgia and simplicity. 
     - Buttons are semi‐transparent (rgba backgrounds) with pixel‐like hover 
       feedback. This establishes a cohesive “retro UI” look that complements 
       the notebook context.

  2. Color Palette
     - Soft pastel palette: 
       * #E3F8F9 (pale mint background) 
       * #FEFDE3 (light cream for asset panel) 
       * #6CD4DB (teal accent for header) 
       * #F5E9F2 (light lavender for controls) 
       This scheme keeps the canvas feeling fresh and airy, prioritizing user 
       assets over UI chrome.
     - Using pastel colors reduces visual fatigue when users spend extended 
       time arranging items, an advantage for creativity‐focused tasks.

  3. Layout via Flexbox
     - The two‐column layout is implemented with CSS Flexbox 
       (`display: flex;`). 
       * Left side: fixed width 300px (asset panel). 
       * Right side: flexible remainder (canvas).
       * #thumb-container uses `flex-wrap: wrap; gap: 8px;` to arrange 
         thumbnails in two columns automatically.
     - Choosing Flexbox ensures responsiveness: on narrower screens, assets 
       wrap properly. This improves usability across different window sizes.
     * Reference: MDN Flexbox Guide (https://developer.mozilla.org/docs/Web/CSS/CSS_Flexible_Box_Layout)

  4. Asset Upload & Management
     - Local file upload is handled via the HTML5 FileReader API. Whenever a 
       user uploads an asset, it’s read as a DataURL and appended to 
       `sampleAssets[currentTab]`, then re‐rendered. This dynamic loading 
       ensures users can use their own images without editing code.

  5. Drag + Click Interactions
     - Thumbnails (“.thumb”) are draggable. On pointerdown, i create a 
       semi‐transparent “dragGhost” image that follows the cursor. On 
       pointerup inside the canvas, i call 'createInstance(src, x, y)' to 
       create a new draggable element at that location.
     - 'createInstance()' wraps each asset in a '.draggable' container, adds 
       an '<img>', plus three handles: 
         * Rotate (⟳), Scale (↔), Delete (✖). 
       These Unicode icons are chosen for universal recognition (no external 
       icon library needed).

  6. Selection & Transformation
     - Click on a placed instance (image) toggles'.selected', which outlines 
       the item with a dashed border. This direct feedback signals “active” 
       state, making it easier to perform rotation or scaling.
     - Rotate: Users press the ⟳ handle. I store the initial pointer angle 
       relative to element center and update 'inst.style.transform = 
       rotate(angle) scale(...)' on pointermove.  
     - Scale: Users press the ↔ handle. I store initial distance from center 
       and update scale factor on pointermove.
     - Delete: Pressing the ✖ handle simply removes that instance. I then 
       push to history for undo support.

  7. History & Undo
     - Maintain 'historyStack' of HTML snapshots ('canvasWrapper.innerHTML') 
       after each creation, transformation end, deletion, or reset. 
     - 'pushHistory()' is called at the end of each interaction. 
     - 'undoBtn' restores the previous snapshot via 'restoreHistory()', then 
       rebinds all event listeners.
     - While effective, storing full HTML snapshots can be memory‐intensive if 
       the canvas fills with many assets. A potential challenge in a larger 
       project is optimizing by storing only diffs or serializing in a custom 
       data model rather than raw HTML.

  8. Export to PNG
     - The “Export” function creates a temporary '<canvas>' with the same 
       dimensions as the visible notebook area (minus 20px padding). 
     - I iterate through each '.draggable' instance and:
       * Compute the top/left relative to the notebook (subtract wrapper’s 
         left/top offsets and padding).
       * Extract width, height, rotation angle, and scale factor from the 
         instance’s computed styles and 'data-*' attributes.
       * Draw the image onto the temp canvas with 'ctx.translate()', 
         'ctx.rotate()', 'ctx.scale()', then 'ctx.drawImage()'.
     - Finally, call 'tempCanvas.toDataURL('image/png')' and download. This 
       approach ensures the exported collage matches exactly what the user sees 
       on screen, including rotations and scaling.

FUTURE CHALLENGES & BENEFITS
  - Performance: As the number of elements grows, re‐rendering full HTML 
    history snapshots can become slow. In a production environment, a more 
    efficient data structure (e.g., JSON of element states) and incremental 
    diff/undo logic would be advisable.
  - Mobile Touch & Gesture Support: Extending to pinch‐to‐zoom or two-finger 
    rotate on touch devices could increase complexity—current code only uses 
    pointer events.
  - Accessibility: I’ve prioritized minimal UI chrome, but keyboard navigation 
    (tab focus, ARIA labels) would be necessary for WCAG compliance.
  - Asset Management: Integrating a backend or cloud storage for assets would 
    allow larger asset libraries and sharing between users, at the cost of 
    building API endpoints and authentication.

  Overall, this prototype demonstrates how a simple context (“digital scrapbook”)
  and two primary actions (“Drag + Click”) drive the entire UI/UX. The pastel
  aesthetic, monospace font, and pixel‐transparent buttons are direct results of 
  choosing an experimental art context that values creativity over complexity.
*/

// DOM References
const tabBar = document.getElementById("tab-bar");
const tabs = tabBar.querySelectorAll(".tab");
const thumbContainer = document.getElementById("thumb-container");
const uploadInput = document.getElementById("upload-input");
const canvasWrapper = document.getElementById("canvas-wrapper");
const canvas = document.getElementById("canvas");
const fileCanvas = document.getElementById("file-canvas");
const undoBtn = document.getElementById("undo-btn");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");

// State Variables
let currentTab = "fonts";
let draggingThumb = null;
let dragGhost = null;
let currSelected = null;
let isDraggingInstance = false;
let isTransforming = false;
let transformMode = null;
let startPointer = { x: 0, y: 0 };
let instanceData = {
  el: null,
  centerX: 0,
  centerY: 0,
  startAngle: 0,
  startRot: 0,
  startDist: 0,
  startScale: 1,
};

// History Stack for Undo
const historyStack = [];
let historyIndex = -1;

/* 
  sampleAssets object:
  Replace the empty arrays below with your local asset paths,
  e.g. 'assets/fonts/fontA.png', 'assets/decor/tape1.png',
  'assets/images/photo1.jpg', etc.
*/
const sampleAssets = {
  fonts: [
    "fonts/a.png",
    "fonts/b.png",
    "fonts/c.png",
    "fonts/d.png",
    "fonts/e.png",
    "fonts/f.png",
    "fonts/g.png",
    "fonts/h.png",
    "fonts/i.png",
  ],
  decor: [
    "decor/01.png",
    "decor/02.png",
    "decor/03.png",
    "decor/04.png",
    "decor/09.png",
    "decor/10.png",
    "decor/05.png",
    "decor/06.png",
    "decor/07.png",
    "decor/08.png",
  ],
  images: [
    "images/img1.jpg",
    "images/img2.jpg",
    "images/img3.jpg",
    "images/img4.jpg",
  ],
};

/**
 * pushHistory()
 * -------------
 * Capture the current innerHTML of the entire canvas wrapper
 * and store it in historyStack for undo functionality.
 */
function pushHistory() {
  // Discard any “future” states beyond the current index
  historyStack.splice(historyIndex + 1);
  // Store the full HTML markup of the canvas wrapper
  historyStack.push(canvasWrapper.innerHTML);
  historyIndex = historyStack.length - 1;
  updateUndoButton();
}

/**
 * updateUndoButton()
 * ------------------
 * Enable/disable the Undo button based on historyIndex.
 */
function updateUndoButton() {
  undoBtn.disabled = historyIndex <= 0;
}

/**
 * restoreHistory(idx)
 * -------------------
 * Restore the canvas wrapper’s HTML content to a previous snapshot,
 * then rebind all event listeners for draggable elements.
 */
function restoreHistory(idx) {
  if (idx < 0 || idx >= historyStack.length) return;
  canvasWrapper.innerHTML = historyStack[idx];
  historyIndex = idx;
  rebindAll();
  updateUndoButton();
}

/**
 * rebindAll()
 * -----------
 * After injecting HTML from a snapshot, rebind all necessary events:
 * - Prevent clicking controls from deselecting
 * - Rebind thumbnails and draggable instances
 */
function rebindAll() {
  document
    .getElementById("canvas-controls")
    .addEventListener("pointerdown", stopPropagation);
  rebindCanvasControls();
  const instances = canvas.querySelectorAll(".draggable");
  instances.forEach((inst) => bindInstanceEvents(inst));
  updateUndoButton();
}

/**
 * stopPropagation(e)
 * ------------------
 * Prevent click events on controls from bubbling to the canvas,
 * which would otherwise deselect the current instance.
 */
function stopPropagation(e) {
  e.stopPropagation();
}

/**
 * renderThumbnails(tabName)
 * -------------------------
 * Clear the #thumb-container and then populate it with
 * <img> elements for each URL in sampleAssets[tabName].
 */
function renderThumbnails(tabName) {
  thumbContainer.innerHTML = "";
  sampleAssets[tabName].forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("thumb");
    img.draggable = true;
    img.dataset.src = src;
    thumbContainer.appendChild(img);
  });
}
// Initial render
renderThumbnails(currentTab);

/*
 * Tab Click Handler
 * -----------------
 * Switch active tab, update currentTab variable,
 * then re-render thumbnails for the selected category.
 */
tabBar.addEventListener("click", function (e) {
  if (!e.target.classList.contains("tab")) return;
  tabs.forEach((t) => t.classList.remove("active"));
  e.target.classList.add("active");
  currentTab = e.target.dataset.tab;
  renderThumbnails(currentTab);
});

/*
 * Upload New Asset into Current Category
 * --------------------------------------
 * When user selects a file in the “Upload Asset” input,
 * read it as DataURL and append it to sampleAssets[currentTab].
 * Then re-render thumbnails so the new asset appears immediately.
 */
uploadInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    sampleAssets[currentTab].push(evt.target.result);
    renderThumbnails(currentTab);
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});

/*
 * Thumbnail Dragging: Create a Semi-Transparent “dragGhost”
 * When pointerdown on a .thumb, create a ghost <img> that follows
 * the cursor until the user releases (pointerup) inside #canvas-wrapper.
 */
thumbContainer.addEventListener("pointerdown", function (e) {
  if (e.target.classList.contains("thumb")) {
    draggingThumb = e.target;
    dragGhost = document.createElement("img");
    dragGhost.src = draggingThumb.dataset.src;
    dragGhost.style.position = "fixed";
    dragGhost.style.width = draggingThumb.clientWidth + "px";
    dragGhost.style.opacity = "0.5";
    dragGhost.style.pointerEvents = "none";
    document.body.appendChild(dragGhost);
    moveGhost(e.pageX, e.pageY);
  }
});

/*
 * pointermove Listener
 * --------------------
 * If dragGhost exists, move it to follow the cursor.
 * Else if dragging a placed instance, update its left/top.
 * Else if transforming (rotate/scale) a selected instance,
 * compute new angle or scale on the fly.
 */
document.addEventListener("pointermove", function (e) {
  if (dragGhost) {
    moveGhost(e.pageX, e.pageY);
  } else if (isDraggingInstance && currSelected) {
    // Move the selected instance
    const dx = e.pageX - startPointer.x;
    const dy = e.pageY - startPointer.y;
    currSelected.el.style.left = instanceData.left + dx + "px";
    currSelected.el.style.top = instanceData.top + dy + "px";
  } else if (isTransforming && currSelected) {
    // Rotate or scale the selected instance
    const inst = currSelected.el;
    const rect = inst.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    if (transformMode === "rotate") {
      // Compute current angle relative to center
      const angleNow = Math.atan2(e.pageY - cy, e.pageX - cx);
      const delta = angleNow - instanceData.startAngle;
      const newAngle = instanceData.startRot + delta;
      inst.dataset.angle = newAngle;
      inst.style.transform = `rotate(${newAngle}rad) scale(${inst.dataset.scale})`;
    } else if (transformMode === "scale") {
      // Compute new distance for uniform scaling
      const distNow = Math.hypot(e.pageX - cx, e.pageY - cy);
      let factor = (distNow / instanceData.startDist) * instanceData.startScale;
      if (factor < 0.1) factor = 0.1; // Minimum scale to avoid collapsing
      inst.dataset.scale = factor;
      inst.style.transform = `rotate(${inst.dataset.angle}rad) scale(${factor})`;
    }
  }
});

/*
 * pointerup Listener
 * ------------------
 * If dragGhost exists, check if release point is inside #canvas-wrapper.
 * If yes, call createInstance() to add the asset to the canvas.
 * In any case, remove the ghost. Also finalize any dragging or transforming,
 * then push the new state onto the history stack.
 */
document.addEventListener("pointerup", function (e) {
  if (dragGhost) {
    const cwRect = canvasWrapper.getBoundingClientRect();
    if (
      e.clientX >= cwRect.left &&
      e.clientX <= cwRect.right &&
      e.clientY >= cwRect.top &&
      e.clientY <= cwRect.bottom
    ) {
      createInstance(
        draggingThumb.dataset.src,
        e.clientX - cwRect.left,
        e.clientY - cwRect.top
      );
      pushHistory();
    }
    document.body.removeChild(dragGhost);
    dragGhost = null;
    draggingThumb = null;
  }
  isDraggingInstance = false;
  if (isTransforming) {
    isTransforming = false;
    transformMode = null;
    pushHistory();
  }
});

/**
 * moveGhost(x, y)
 * ---------------
 * Moves the semi-transparent ghost image so that its center
 * stays under the cursor.
 */
function moveGhost(x, y) {
  dragGhost.style.left = x - dragGhost.width / 2 + "px";
  dragGhost.style.top = y - dragGhost.height / 2 + "px";
}

/**
 * createInstance(src, x, y)
 * --------------------------
 * Creates a draggable instance on the canvas, with an initial width fixed at 120px.
 * - src: URL or DataURL of the image
 * - x, y: Coordinates relative to the canvasWrapper; if NaN, the image is centered.
 */
function createInstance(src, x, y) {
  const inst = document.createElement("div");
  inst.classList.add("draggable");

  // Determine position: if x or y is NaN, place the item at the center of the canvas.
  const cwRect = canvasWrapper.getBoundingClientRect();
  const defaultX = (cwRect.width - 120) / 2;
  const defaultY = (cwRect.height - 120) / 2;
  const leftPos = !isNaN(x) ? x - 60 : defaultX;
  const topPos = !isNaN(y) ? y - 60 : defaultY;

  inst.style.left = leftPos + "px";
  inst.style.top = topPos + "px";
  inst.dataset.angle = 0;
  inst.dataset.scale = 1;
  inst.dataset.left = parseFloat(inst.style.left);
  inst.dataset.top = parseFloat(inst.style.top);

  // Create the <img> element and force its initial width to 120px
  const img = document.createElement("img");
  img.src = src;
  img.draggable = false;
  img.style.width = "120px"; // Fixed width of 120px
  img.style.height = "auto"; // Height adjusts to maintain aspect ratio
  inst.appendChild(img);

  // Append a rotate handle (⟳) in the top-right corner
  const rotateHandle = document.createElement("div");
  rotateHandle.classList.add("rotate-handle");
  rotateHandle.textContent = "⟳";
  inst.appendChild(rotateHandle);

  // Append a scale handle (↔) in the bottom-right corner
  const scaleHandle = document.createElement("div");
  scaleHandle.classList.add("scale-handle");
  scaleHandle.textContent = "↔";
  inst.appendChild(scaleHandle);

  // Append a delete button (✖) in the top-left corner
  const delBtn = document.createElement("div");
  delBtn.classList.add("delete-btn");
  delBtn.textContent = "✖";
  inst.appendChild(delBtn);

  // Finally, add the new instance to the canvas and bind its events
  canvas.appendChild(inst);
  bindInstanceEvents(inst);
}

/**
 * bindInstanceEvents(inst)
 * ------------------------
 * For a given draggable instance, bind:
 * - Click→selectInstance
 * - Delete icon → remove instance
 * - Drag on instance → reposition
 * - Rotate handle → start rotation
 * - Scale handle → start uniform scaling
 */
function bindInstanceEvents(inst) {
  // Click to select
  inst.addEventListener("pointerdown", selectInstance);

  // Delete
  const delBtn = inst.querySelector(".delete-btn");
  delBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    canvas.removeChild(inst);
    pushHistory();
  });

  // Drag entire instance
  inst.addEventListener("pointerdown", function (e) {
    const isHandle =
      e.target === inst.querySelector(".rotate-handle") ||
      e.target === inst.querySelector(".scale-handle") ||
      e.target === delBtn;
    if (isHandle) return;
    isDraggingInstance = true;
    startPointer.x = e.pageX;
    startPointer.y = e.pageY;
    instanceData.left = parseFloat(inst.style.left);
    instanceData.top = parseFloat(inst.style.top);
  });

  // Rotate handle logic
  const rotateHandle = inst.querySelector(".rotate-handle");
  rotateHandle.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    isTransforming = true;
    transformMode = "rotate";
    const rect = inst.getBoundingClientRect();
    instanceData.centerX = rect.left + rect.width / 2;
    instanceData.centerY = rect.top + rect.height / 2;
    instanceData.startAngle = Math.atan2(
      e.pageY - instanceData.centerY,
      e.pageX - instanceData.centerX
    );
    instanceData.startRot = parseFloat(inst.dataset.angle);
  });

  // Scale handle logic
  const scaleHandle = inst.querySelector(".scale-handle");
  scaleHandle.addEventListener("pointerdown", function (e) {
    e.stopPropagation();
    isTransforming = true;
    transformMode = "scale";
    const rect = inst.getBoundingClientRect();
    instanceData.centerX = rect.left + rect.width / 2;
    instanceData.centerY = rect.top + rect.height / 2;
    instanceData.startDist = Math.hypot(
      e.pageX - instanceData.centerX,
      e.pageY - instanceData.centerY
    );
    instanceData.startScale = parseFloat(inst.dataset.scale);
  });
}

/**
 * selectInstance(e)
 * -----------------
 * Add .selected class to the clicked instance (dashed outline),
 * remove from previous if any.
 */
function selectInstance(e) {
  e.stopPropagation();
  if (currSelected) {
    currSelected.el.classList.remove("selected");
  }
  currSelected = { el: e.currentTarget };
  currSelected.el.classList.add("selected");
}

// Click blank area on canvas to deselect
canvasWrapper.addEventListener("pointerdown", function (e) {
  if (e.target === canvasWrapper || e.target === canvas) {
    if (currSelected) {
      currSelected.el.classList.remove("selected");
      currSelected = null;
    }
  }
});

/**
 * Upload Photo: treat it as a draggable instance as well.
 * Uses createInstance(src, NaN, NaN) to center photo.
 */
fileCanvas.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    createInstance(evt.target.result, NaN, NaN);
    pushHistory();
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});

// Prevent default dragover to allow drop logic
canvasWrapper.addEventListener("dragover", function (e) {
  e.preventDefault();
});

/**
 * Undo Button Handler
 * -------------------
 * If historyIndex > 0, restore to previous snapshot.
 */
undoBtn.addEventListener("click", function () {
  if (historyIndex > 0) restoreHistory(historyIndex - 1);
});

/**
 * Reset Button Handler
 * --------------------
 * Clear all placed instances from canvas (removes innerHTML),
 * deselect any instance, and push new empty state to history.
 */
resetBtn.addEventListener("click", function () {
  canvas.innerHTML = "";
  currSelected = null;
  pushHistory();
});

/**
 * Export Button Handler
 * ---------------------
 * Create a temporary HTML5 Canvas with same dimensions as visible “notebook”
 * (width - 40, height - 40). Draw white background, then draw each instance
 * (including rotated and scaled) onto it. Finally, generate a PNG DataURL
 * and trigger a download. This ensures the exported image matches what’s
 * shown on screen.
 */
exportBtn.addEventListener("click", function () {
  const wr = canvasWrapper.getBoundingClientRect();
  const width = wr.width - 40;
  const height = wr.height - 40;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d");

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Draw each draggable instance (including any uploaded photos)
  const instances = canvas.querySelectorAll(".draggable");
  instances.forEach((inst) => {
    const img = inst.querySelector("img");
    const rect = img.getBoundingClientRect();
    const parentRect = canvasWrapper.getBoundingClientRect();
    const x = rect.left - parentRect.left - 20;
    const y = rect.top - parentRect.top - 20;
    const drawW = rect.width;
    const drawH = rect.height;
    const angle = parseFloat(inst.dataset.angle) || 0;
    const scale = parseFloat(inst.dataset.scale) || 1;

    ctx.save();
    ctx.translate(x + drawW / 2, y + drawH / 2);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  });

  const dataURL = tempCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "collage.png";
  link.click();
});

/**
 * On DOMContentLoaded: Initialize history stack and rebind controls
 */
window.addEventListener("DOMContentLoaded", function () {
  pushHistory();
  rebindCanvasControls();
});

/**
 * rebindCanvasControls()
 * ----------------------
 * Prevent clicking on top controls from deselecting a selected instance.
 * This ensures that if a user clicks “Undo,” “Reset,” or “Export,” it doesn’t
 * inadvertently deselect the current collage element.
 */
function rebindCanvasControls() {
  document
    .getElementById("canvas-controls")
    .addEventListener("pointerdown", stopPropagation);
}
