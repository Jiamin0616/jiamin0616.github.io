const mybutton = document.querySelector("button");
console.log(mybutton);
console.addEventListener("click", handleclick);

function handleclick() {
  console.log("hey did just you click me?");
  topheading.textContent = "This is the top heading";
  topheading.style.color = "red";
}

const header = document.querySelector("header");
console.log(header);
console.log(header.textContent);

const topheading = document.querySelector("h1");
// console.log(topheading);
// console.log(topheading.texrtContent);
topheading.textContent = "This is the top heading";
topheading.style.color = "red";

console.log(header);
console.log(header.textContent);
console.log(header.innerHTML);
header.innerHTML += "<h1>my couse is ${}</h1>";
// console.log(header.innerHTML);

const allparagraphs = document.querySelectorAll("p");
// console.log(allparagraphs);
// console.log(allparagraphs,textContent);
for (let i = 0; i < allparagraphs.length; i++) {
  //   console.log(allparagraphs[i].textContent);
  allparagraphs[i].style.color = "1px solid blue";
  allparagraphs[i].style.backgroundColor = "beige";
}

const myfirstlist = document.querySelector("#first-subheading");
console.log(mysubheading);
console.log(mysubheading.textContent);

const allsbheading = document.querySelectorAll("h2");
console.log(allsbheadings);
for (let i = 0; i < allsbheadings.length; i++) {
  console.log(allsbheadings[i].textContent);
}
