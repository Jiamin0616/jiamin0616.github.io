// design principles
// Interaction feedback:
// - Hover: Make the scale smaller (to 0.9) to show how pressing the button feels.
// - Press and hold to make it brighter, then let go to make it darker. This will make it glow for a moment and show that you've clicked.
//  Event-Driven: Separating the controls (buttons/slider) from the audio logic makes the software easier to understand and test.
// - Feedback mechanisms
//  The play/pause icon swap is instant, showing the current playback state.
//  The shuffle and repeat buttons toggle the '.active' class to show which mode is on.
//  The +/- and mute controls on the volume let you adjust the audio to your exact needs.
//  The volume slider is a range input, which is a standard way to adjust volume.
// -accessibility
// Button padding makes targets easy to touch on mobile devices (WCAG recommended ≥48px).
// -performance
// The fewer external dependencies there are, the quicker it will load.
//  The browser automatically limits audio metadata and timeupdate events.
// -error handling
// If the network is down, the browser will show the usual error messages.
// -external libraries
// icons from icons8.com
// audio format: mp3

document.addEventListener("DOMContentLoaded", function () {
  // Get the core element: the audio object in the player container.
  var audio = new Audio();
  var Tracks = document.querySelectorAll("#playlist li");
  var currentIndex = 0;
  var isShuffled = false;
  var repeatMode = 0;

  // Get all control elements
  var playBtn = document.getElementById("play"); // Play button
  var prevBtn = document.getElementById("prev"); // Previous track button
  var nextBtn = document.getElementById("next"); // Next track button
  var shuffleBtn = document.getElementById("shuffle"); // Shuffle button
  var repeatBtn = document.getElementById("repeat"); // Repeat button
  var muteBtn = document.getElementById("mute"); // Mute button
  var volUpBtn = document.getElementById("vol-up"); // Volume up button
  var volDownBtn = document.getElementById("vol-down"); // Volume down button
  var progress = document.getElementById("progress"); // Progress slider
  var currentTime = document.getElementById("current-time"); // Current time element
  var duration = document.getElementById("duration"); // Duration element
  var titleE = document.getElementById("title"); // Title element

  // Get playlist items
  function loadTrack(index) {
    if (!Tracks.length) return;
    currentIndex = ((index % Tracks.length) + Tracks.length) % Tracks.length;
    var item = Tracks[currentIndex];
    var src = item.getAttribute("data-src");
    audio.src = encodeURI(item.getAttribute("data-src"));
    titleE.textContent = item.getAttribute("data-title");
    Tracks.forEach(function (li) {
      li.classList.remove("active");
    });
    item.classList.add("active");
    audio.load();
  }
  loadTrack(0);

  // Initialize variables

  // Load Specified Tracks

  // Play/Pause button event
  playBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play();
      this.querySelector("img").src =
        "https://img.icons8.com/ios-glyphs/30/ffffff/pause--v1.png";
    } else {
      audio.pause();
      this.querySelector("img").src =
        "https://img.icons8.com/ios-glyphs/30/ffffff/play--v1.png";
    }
  });

  // Previous track button event
  prevBtn.addEventListener("click", function () {
    if (isShuffled) {
      loadTrack(math.floor(math.random() * Tracks.length));
    } else {
      loadTrack(currentIndex - 1);
    }
    audio.play();
  });

  // Next track button event
  nextBtn.addEventListener("click", function () {
    if (isShuffled) {
      loadTrack(Math.floor(Math.random() * Tracks.length));
    } else {
      loadTrack(currentIndex + 1);
    }
    audio.play();
  });

  // Shuffle button event
  shuffleBtn.addEventListener("click", function () {
    isShuffled = !isShuffled;
    this.classList.toggle("active", isShuffled);
  });

  // Repeat button event
  repeatBtn.addEventListener("click", function () {
    repeatMode = (repeatMode + 1) % 3;
    this.classList.toggle("active", repeatMode > 0);
    this.title = ["No Repeat", "Repeat all", "Repeat One"][repeatMode];
  });

  // Mute button event
  muteBtn.addEventListener("click", function () {
    audio.muted = !audio.muted;
    this.classList.toggle("active", audio.muted);
  });

  // Volume up button event
  volUpBtn.addEventListener("click", function () {
    audio.volume = Math.min(1, audio.volume + 0.1);
  });

  // Volume down button event
  volDownBtn.addEventListener("click", function () {
    audio.volume = Math.max(0, audio.volume - 0.1);
  });

  // Progress slider event
  audio.addEventListener("loadedmetadata", function () {
    progress.max = Math.floor(audio.duration);
    duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", function () {
    progress.value = Math.floor(audio.currentTime);
    currentTime.textContent = formatTime(audio.currentTime);
  });
  progress.addEventListener("input", function () {
    audio.currentTime = this.value;
  });

  // auto play next track
  audio.addEventListener("ended", function () {
    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
    } else if (isShuffled) {
      loadTrack(Math.floor(Math.random() * Tracks.length));
      audio.play();
    } else if (repeatMode === 1) {
      loadTrack(currentIndex + 1);
      audio.play();
    }
  });

  // Click on the list to play
  Tracks.forEach(function (li, index) {
    li.addEventListener("click", function () {
      loadTrack(index);
      audio.play();
    });
  });

  // Format time function
  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = String(Math.floor(seconds % 60)).padStart(2, "0");
    return m + ":" + s;
  }
});
