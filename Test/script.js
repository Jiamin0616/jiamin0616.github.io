// script.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. 获取 DOM 元素
  const fileInput = document.getElementById("fileInput");
  const pixelSizeInput = document.getElementById("pixelSize");
  const colorCountInput = document.getElementById("colorCount");
  const filterSelect = document.getElementById("filterSelect"); // 可选
  const exportBtn = document.getElementById("exportBtn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // 2. 初始化 ColorThief
  const colorThief = new ColorThief();

  // 3. 状态变量
  let image = null; // 存储上传的图片
  let palette = []; // 存储提取的调色板

  // 4. 处理文件上传
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        // 同步画布尺寸
        canvas.width = image.width;
        canvas.height = image.height;
        // 提取初始调色板
        palette = colorThief.getPalette(image, +colorCountInput.value);
        // 首次渲染
        processImage();
      };
      image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 5. 控件变动重新渲染
  pixelSizeInput.addEventListener("input", processImage);
  colorCountInput.addEventListener("input", () => {
    if (!image) return;
    palette = colorThief.getPalette(image, +colorCountInput.value);
    processImage();
  });
  if (filterSelect) {
    filterSelect.addEventListener("change", processImage);
  }

  // 6. 核心渲染函数
  function processImage() {
    if (!image) return;
    const size = +pixelSizeInput.value;
    const w = canvas.width,
      h = canvas.height;

    // a) 缩小绘制
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w / size, h / size);

    // b) 调色板量化
    const imgData = ctx.getImageData(0, 0, w / size, h / size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      let bestIdx = 0,
        bestDist = Infinity;
      palette.forEach((c, j) => {
        const dr = r - c[0],
          dg = g - c[1],
          db = b - c[2];
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
    ctx.putImageData(imgData, 0, 0);

    // c) 放大回原尺寸且关闭平滑
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w / size, h / size, 0, 0, w, h);

    // d) 应用滤镜效果
    applyCanvasFilter(w, h);
  }

  // 7. 应用滤镜
  function applyCanvasFilter(w, h) {
    if (!filterSelect) return;
    const val = filterSelect.value;

    // 重置
    canvas.classList.remove("pastel", "neon", "vhs");
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    if (["pastel", "neon", "vhs"].includes(val)) {
      canvas.classList.add(val);
    } else if (val === "duotone") {
      let duotoneData = ctx.getImageData(0, 0, w, h);
      duotoneData = applyDuotone(duotoneData, [255, 180, 200], [100, 50, 150]);
      ctx.putImageData(duotoneData, 0, 0);
    } else if (val === "bloom") {
      applyPixelBloom(w, h);
    }
  }

  // 8. Duotone 效果帮助函数
  function applyDuotone(imageData, colorA, colorB) {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
      const t = gray / 255;
      d[i] = colorA[0] + (colorB[0] - colorA[0]) * t;
      d[i + 1] = colorA[1] + (colorB[1] - colorA[1]) * t;
      d[i + 2] = colorA[2] + (colorB[2] - colorA[2]) * t;
    }
    return imageData;
  }

  // 9. Pixel Bloom 效果帮助函数
  function applyPixelBloom(w, h) {
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext("2d");
    tctx.drawImage(canvas, 0, 0);
    ctx.save();
    ctx.filter = "blur(2px)";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  }

  // 10. 导出 PNG
  exportBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "pixel_art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
