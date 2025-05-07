const mybutton = document.getElementById("my-button");

myButton.addEventListener("click", moveInput);

const myInput = document.getElementById("my-input");

let clicked = true;

function moveInput() {
  if (clicked) {
    myInput.style.translate = "10px 20px";
    clicked = true;
  } else {
    myInput.style.translate = "0px 0px";
    clicked = false;
  }
}
