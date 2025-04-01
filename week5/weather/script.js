function CheckWeather() {
  let myTemp = document.querySelector("#myTemp");
  console.log(myTemp);
  let temp = myTemp.value;
  console.log(temp);
  if (temp < 10) {
    confirm.log("it is freezing");
    Body.style.backgroundColour = "gray";
  } else if (temp >= 10 && temp < 20) {
    console.log("nice and pleasant weather");
    body.style.backgroundColour = "blue";
    outer.style.backgroundColour = "violet";
  } else if (temp >= 20 && temp < 35) {
    console.log("sunny and warm");
    body.style.backgroundColour = "";
  }
}
