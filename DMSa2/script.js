document.addEventListener("DOMContentLoaded", () => {
  // References to dom elements
  const fileInput = document.getElementById("fileInput");
  const pixelSizeInput = document.getElementById("pixelSize");
  const colorCountInput = document.getElementById("colorCount");
  const exportBtn = document.getElementById("exportBtn");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // initialize Color Thief for palette extraction
  const colorThief = new ColorThief();

  let image = null;
  // hold the uploaded image
  let palette = [];
  // hold the dynamically generated palette

  // when the user selects a file
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // check if the file is an image

    const reader = new FileReader();
    reader.onload = (evt) => {
      image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        // set the canvas size to the image size
        // resize the canvas to fit the image
        canvas.width = image.width;
        canvas.height = image.height;

        // extract the main coulors from the image
        const count = parseInt(colorCountInput.value, 10);
        palette = colorThief.getPalette(image, count);
        processImage();
      };
      // render the image on the canvas
      image.src = evt.target.result;
      // create a local URL for the chosen file
    };
    reader.readAsDataURL(file);
  });

  // re-render the image when the pixel size changes
  pixelSizeInput.addEventListener("input", processImage);
  colorCountInput.addEventListener("input", () => {
    if (!image) return;
    // update the color count
    const count = parseInt(colorCountInput.value, 10);
    palette = colorThief.getPalette(image, count);
    processImage();
  });

  // core rendering function: pixelate + palette quantize + upscale
  function processImage() {
    if (!image) return;

    const size = parseInt(pixelSizeInput.value, 10);
    const width = canvas.width;
    const height = canvas.height;

    // draw the image scaled down to pixel size
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width / size, height / size);

    // read pixels and map to nearest palette color
    const imgeData = ctx.getImageData(0, 0, width / size, height / size);
    const data = imgeData.data;
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
    ctx.putImageData(imgeData, 0, 0);

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
  }
  // export the canvas as a PNG
  exportBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
