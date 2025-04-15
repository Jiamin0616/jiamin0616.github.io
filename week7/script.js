const airportAudio = document.querySelector("#airport-audio");
console.log(airportAudio);

// -----------------------------------------------------
// here is my logic for playing the sound
// first i am fetching the right play button
// -----------------------------------------------------
const playButton = document.querySelector("#play-button");
console.log(playButton);
// playing sound on click
playButton.addEventListener("click", playAudio);

//my play function
function playAudio() {
  airportAudio.play();
}

//  -----------------------------------------------------
// here is my logic for pausing the sound
// first i am fetching the right play button
const popSound = document.querySelector("#pop-sound");
console.log(popSound);

const popButton = document.querySelector("#pop-button");
console.log(popButton);
// playing sound on click
popSound.addEventListener("click", popAudio);
console.log(popSound);

// my pause function
function popAudio() {
  //  airportAudio.pause();
  popSound.play();
}
//  -----------------------------------------------------
const pauseButton = document.querySelector("#pause-button");
console.log(pauseButton);

// -----------------------------------------------------
// here is my logic for playing the sound
// first i am fetching the right play button
// -----------------------------------------------------
// playing sound on click
pauseButton.addEventListener("click", pauseAudio);

//my play function
function pauseAudio() {
  airportAudio.pause();
}
