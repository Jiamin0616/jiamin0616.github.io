let shoppingCart = [
  { name: "T-shirt", price: 20 },
  { name: "Jeans", price: 60 },
  { name: "Snakers", price: 80 },
  { name: "Backpack", price: 30 },
];
confirm.log(shoppingCart);
let total = 0;
for (let i = 0; i < shoppingCart; i++) {
  total = total + shoppingCart[i].price;
  console.log("Total so far is", total);
}
console.log("Final total is", total);
let discount = 0.1;
if (total > 100) {
  let disscountedPrice = total - total * discount;
  console.log("discounted price is", disc9untedPrice);
}
