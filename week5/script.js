// console.log("hello");
// console.log("how are you buddy?");
// // this is a comment

// // this is another Comment

// let myName = "Rohit";
// console.log("Hello", myName);
// myName = "Sarah";
// console.log("Hello", myName);
// let no = "s10";
// console.log("hello", no);
// // let mycity = prompt("where do you live? ");
// // console.log("i lice in", mycity);
// let a = 30;
// {
//   let a = 10;
//   console.log(a);
// }
// console.log(a);

// Number variable 0 - Infinity dont use quotes
let a = 10;
let b = parseInt("20");
console.log(a, b);
let c = a + b;
console.log(c);
let grade = 52;
if (grade > 70) {
  console.log("Yey you got HD");
} else {
  console.log("sorry you just passed the course");
}

let weather = "rainy";
if (weather === "sunney") {
  console.log("what a nice day");
} else console.log("so sad");

// + addition as well as joining
// - subtract
// * multiplication
// / division

// string varibles
const myName = "Rohit Ashok Khot";
console.log(myName);
const myCity = "Melbourne";
const msg = `
    <h1>i live in ${myCity}</h1>
    <p>"i love this city"</p>`;

console.log(msg);
// boolen variable TURE FALSE
let isThisSunday = false;
let isThisAfternoon = true;

// object{name:vale, name:value}
const myStudentRecord = {
  name: "Sam",
  id: 1234,
  course: "OART103",
  isLocal: false,
};

console.log(myStudentRecord);
console.log(myStudentRecord.course);

// arrays
// let sName1 = ("Rohit");
// let sName2 = ("jim");
// let sName3 = ("Alice");

let students = ["Rohit", "Jim", "Sarah", "Alice"];
// console.log("hello",students[0]);
for (let i = 0; i < students.length; i++) {
  console.log("hello", students[i]);
}

let numbers = [2, 4, 6, 8, 10];
console.log(numbers[3]);
