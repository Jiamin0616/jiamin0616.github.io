document.addEventListener("DOMContentLoaded", () => {
  // References to dom elements
  const fileInput = document.getElementById("fileInput");
  const pixelSizeInput = document.getElementById("pixelSize");
  const colorCountInput = document.getElementById("colorCount");
  const filterSelect = document.getElementById("filterSelect");
  const exportBtn = document.getElementById("exportBtn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const colorThief = new ColorThief();

  // const ctx = canvas.getContext("2d", { willReadFrequently: true });
  // get the canvas context with willReadFrequently option
  // console.log({fileInput,pixelSizeInput,colorCountInput,exportBtn,canvas,ctx});
  // initialize Color Thief for palette extraction

  let image = null;
  // hold the uploaded image
  let palette = [];

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        // extract palette
        const count = +colorCountInput.value;
        palette = colorThief.getPalette(image, +colorCountInput.value);

        processImage();
      };
      image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  pixelSizeInput.addEventListener("input", processImage);
  colorCountInput.addEventListener("input", () => {
    if (!image) return;
    palette = colorThief.getPalette(image, +colorCountInput.value);
    processImage();
  });
  // add event listener for filter select
  if (filterSelect) {
    filterSelect.addEventListener("change", processImage); // newly added
  }

  function processImage() {
    if (!image) return;
    const size = +pixelSizeInput.value;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width / size, height / size);

    const imageData = ctx.getImageData(0, 0, width / size, height / size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let bestIdx = 0;
      let bestDist = Infinity;
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
    ctx.putImageData(imageData, 0, 0);
    // upscale without smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      canvas,
      0,
      0,
      width / size,
      height / size,
      0,
      0,
      width,
      height
    );
    // apply filter
    applyCanvasFilter(width, height);
  }
  function applyCanvasFilter(width, height) {
    const val = filterSelect ? filterSelect.value : "none";
    canvas.classList.remove("pastel", "neon", "vhs");
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // Define val based on filterSelect value

    if (["pastel", "neon", "vhs"].includes(val)) {
      canvas.classList.add(val);
    } else if (val === "duotone") {
      let imageData = ctx.getImageData(0, 0, width, height);
      imageData = applyDuotone(imageData, [255, 180, 200], [100, 50, 150]); // red to blue
      ctx.putImageData(imageData, 0, 0);
    } else if (val === "bloom") {
      applyPixelBloom(width, height);
    }
  }

  function applyDuotone(imageData, colorA, colorB) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      const t = gray / 255;
      data[i] = colorA[0] + (colorB[0] - colorA[0]) * t;
      data[i + 1] = colorA[1] + (colorB[1] - colorA[1]) * t;
      data[i + 2] = colorA[2] + (colorB[2] - colorA[2]) * t;
    }
    return imageData;
  }

  function applyPixelBloom(width, height) {
    const tmp = document.createElement("canvas");
    tmp.width = width;
    tmp.height = height;
    const tmpCtx = tmp.getContext("2d");
    tmpCtx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.filter = "blur(2px)";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  }

  exportBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
