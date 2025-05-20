document.addEventListener("DOMContentLoaded", () => {
  // References to dom elements
  const fileInput = document.getElementById("fileInput");
  const pixelSizeInput = document.getElementById("pixelSize");
  const colorCountInput = document.getElementById("colorCount");
  const filterSelect = document.getElementById("filterSelect");
  const exportBtn = document.getElementById("exportBtn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const btnFilter = document.getElementById("btnFilter");
  const btnSticker = document.getElementById("btnSticker");
  const panelFilter = document.getElementById("panelFilter");
  const panelSticker = document.getElementById("panelSticker");
  const staticContainer = document.getElementById("staticStickers");
  const menu = document.getElementById("contextMenu");
  const miDelete = document.getElementById("ctxDelete");
  const miFlipH = document.getElementById("ctxFlipH");
  const miFlipV = document.getElementById("ctxFlipV");
  const bgm = document.getElementById("bgm");
  const btnMusic = document.getElementById("btnMusic");

  let baseImage = null;
  // hold the uploaded image
  let palette = [];
  const stickers = [];
  let selectedSticker = null;
  let resizeHandle = null;
  let dragOffsetX = 0,
    dragOffsetY = 0;
  let resizeStartX = 0,
    resizeStartY = 0;
  let resizeStartW = 0,
    resizeStartH = 0;
  let dragging = null;

  let ctxTarget = null;

  const colorThief = new ColorThief();

  // ---------------
  btnFilter.addEventListener("click", () => {
    panelFilter.classList.toggle("open");
    panelSticker.classList.remove("open");
  });
  btnSticker.addEventListener("click", () => {
    panelSticker.classList.toggle("open");
    panelFilter.classList.remove("open");
  });

  // const ctx = canvas.getContext("2d", { willReadFrequently: true });
  // get the canvas context with willReadFrequently option
  // console.log({fileInput,pixelSizeInput,colorCountInput,exportBtn,canvas,ctx});
  // initialize Color Thief for palette extraction
  // -------------------
  function drawBase() {
    if (!baseImage) return;
    const size = +pixelSizeInput.value;
    const width = canvas.width,
      height = canvas.height;
    const smallW = Math.floor(width / size);
    const smallH = Math.floor(height / size);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseImage, 0, 0, smallW, smallH);

    const imageData = ctx.getImageData(0, 0, smallW, smallH);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      let bestIdx = 0;
      let bestDist = Infinity;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      palette.forEach((color, j) => {
        const dr = r - color[0];
        const dg = g - color[1];
        const db = b - color[2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = j;
        }
      });
      data[i] = palette[bestIdx][0];
      data[i + 1] = palette[bestIdx][1];
      data[i + 2] = palette[bestIdx][2];
    }
    const newImageData = new ImageData(data, smallW, smallH);
    ctx.putImageData(newImageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, width, height);
  }

  function render() {
    drawBase();
    stickers.forEach((sticker) => drawSticker(sticker));

    if (selectedSticker) {
      const st = selectedSticker;
      const size = 15;
      const half = size / 2;
      const corners = {
        nw: [st.x, st.y],
        ne: [st.x + st.width, st.y],
        sw: [st.x, st.y + st.height],
        se: [st.x + st.width, st.y + st.height],
      };
      ctx.fillStyle = "#ff69b4";
      ctx.strokeStyle = "#ff1493";
      for (const [cx, cy] of Object.values(corners)) {
        ctx.fillRect(cx - half, cy - half, size, size);
        ctx.strokeRect(cx - half, cy - half, size, size);
      }
    }

    const v = filterSelect.value;
    canvas.classList.remove("pastel", "neon", "vhs");
    if (v !== "none") canvas.classList.add(v);
  }

  function animate() {
    render();
    requestAnimationFrame(animate);
  }

  // ----------------------
  fileInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      baseImage = new Image();
      baseImage.crossOrigin = "Anonymous";
      baseImage.onload = () => {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        palette = colorThief.getPalette(baseImage, +colorCountInput.value);
        animate();
      };
      baseImage.src = evt.target.result;
    };
    reader.readAsDataURL(f);
  });

  pixelSizeInput.addEventListener("input", () => {
    if (baseImage)
      palette = colorThief.getPalette(baseImage, +colorCountInput.value);
  });
  colorCountInput.addEventListener("input", () => {
    if (baseImage)
      palette = colorThief.getPalette(baseImage, +colorCountInput.value);
  });

  // ---------------------
  const STATIC_STICKERS = [
    "stickers/1.png",
    "stickers/2.png",
    "stickers/3.png",
    "stickers/4.png",
    "stickers/5.png",
    "stickers/6.png",
    "stickers/7.png",
    "stickers/8.png",
    "stickers/9.PNG",
    "stickers/10.png",
    "stickers/11.png",
    "stickers/12.PNG",
    "stickers/13.png",
    "stickers/14.png",
    "stickers/15.PNG",
    "stickers/16.png",
    "stickers/17.PNG",
    "stickers/18.png",
    "stickers/19.PNG",
    "stickers/20.png",
    "stickers/21.png",
    "stickers/22.png",
    "stickers/23.png",
  ];

  STATIC_STICKERS.forEach((url) => {
    const thumb = document.createElement("img");
    thumb.src = url;
    thumb.title = "click to add sticker";
    thumb.addEventListener("click", () => addSticker(url));
    staticContainer.appendChild(thumb);
  });

  function addSticker(url) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const scale = 0.4;
      const width = img.width * scale;
      const height = img.height * scale;
      stickers.push({
        img,
        x: (canvas.width - width) / 2,
        y: (canvas.height - height) / 2,
        width: width,
        height: height,
        flipH: false,
        flipV: false,
      });
    };
    img.src = url;
  }

  // ------------------------

  // let resizeStartX = 0,
  //     resizeStartY = 0,
  //     resizeStartW = 0,
  //     resizeStartH = 0;

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = cx * scaleX;
    const y = cy * scaleY;

    if (selectedSticker) {
      const st = selectedSticker;
      const size = 8,
        half = size / 2;
      const corners = {
        nw: [st.x, st.y],
        ne: [st.x + st.width, st.y],
        sw: [st.x, st.y + st.height],
        se: [st.x + st.width, st.y + st.height],
      };
      for (const [key, [cx0, cy0]] of Object.entries(corners)) {
        if (
          x >= cx0 - half &&
          x <= cx0 + half &&
          y >= cy0 - half &&
          y <= cy0 + half
        ) {
          resizeHandle = key;
          resizeStartX = x;
          resizeStartY = y;
          resizeStartW = st.width;
          resizeStartH = st.height;
          return;
        }
      }
    }

    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      if (
        x >= sticker.x &&
        x <= sticker.x + sticker.width &&
        y >= sticker.y &&
        y <= sticker.y + sticker.height
      ) {
        selectedSticker = sticker;
        dragging = sticker;
        dragOffsetX = x - sticker.x;
        dragOffsetY = y - sticker.y;
        return;
      }
    }

    selectedSticker = null;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = cx * scaleX;
    const y = cy * scaleY;

    if (resizeHandle && selectedSticker) {
      const st = selectedSticker;
      const dx = x - resizeStartX;
      const dy = y - resizeStartY;
      switch (resizeHandle) {
        case "se":
          st.width = Math.max(10, resizeStartW + dx);
          st.height = Math.max(10, resizeStartH + dy);
          break;
        case "nw":
          st.x += dx;
          st.y += dy;
          st.width = Math.max(10, resizeStartW - dx);
          st.height = Math.max(10, resizeStartH - dy);
          break;
        case "ne":
          st.y += dy;
          st.width = Math.max(10, resizeStartW + dx);
          st.height = Math.max(10, resizeStartH - dy);
          break;
        case "sw":
          st.x += dx;
          st.width = Math.max(10, resizeStartW - dx);
          st.height = Math.max(10, resizeStartH + dy);
          break;
      }
    } else if (dragging) {
      dragging.x = x - dragOffsetX;
      dragging.y = y - dragOffsetY;
    }
  });

  ["mouseup", "mouseleave"].forEach((event) =>
    canvas.addEventListener(event, () => {
      dragging = null;
      resizeHandle = null;
    })
  );

  // -------------------
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left,
      my = e.clientY - r.top;
    let idx = -1;
    for (let i = stickers.length - 1; i >= 0; i--) {
      const st = stickers[i];
      if (
        mx >= st.x &&
        mx <= st.x + st.width &&
        my >= st.y &&
        my <= st.y + st.height
      ) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      ctxTarget = { st: stickers[idx], idx };
      menu.style.top = `${e.clientY}px`;
      menu.style.left = `${e.clientX}px`;
      menu.style.display = "block";
    }
  });
  window.addEventListener("click", () => (menu.style.display = "none"));

  miDelete.addEventListener("click", () => {
    if (ctxTarget) {
      stickers.splice(ctxTarget.idx, 1);
      ctxTarget = null;
      menu.style.display = "none";
    }
  });
  miFlipH.addEventListener("click", () => {
    if (ctxTarget) {
      ctxTarget.st.flipH = !ctxTarget.st.flipH;
      menu.style.display = "none";
    }
  });
  miFlipV.addEventListener("click", () => {
    if (ctxTarget) {
      ctxTarget.st.flipV = !ctxTarget.st.flipV;
      menu.style.display = "none";
    }
  });

  function drawSticker(sticker) {
    ctx.save();
    ctx.translate(
      sticker.x + sticker.width / 2,
      sticker.y + sticker.height / 2
    );
    ctx.scale(sticker.flipH ? -1 : 1, sticker.flipV ? -1 : 1);
    ctx.drawImage(
      sticker.img,
      -sticker.width / 2,
      -sticker.height / 2,
      sticker.width,
      sticker.height
    );
    ctx.restore();
  }
  exportBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "pixel-art.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });

  btnMusic.addEventListener("click", () => {
    if (bgm.paused) {
      bgm.play();
      btnMusic.innerText = "Pause Music";
    } else {
      bgm.pause();
      btnMusic.innerText = "Play Music";
    }
  });
});
