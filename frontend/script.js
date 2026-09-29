const products=[
  {id:1,name:"Relaxed Cotton Shirt",category:"Men",price:1499,icon:"👕"},
  {id:2,name:"Everyday Oversized Tee",category:"Women",price:999,icon:"👚"},
  {id:3,name:"Minimal Court Sneaker",category:"Shoes",price:2499,icon:"👟"},
  {id:4,name:"Structured Shoulder Bag",category:"Accessories",price:1899,icon:"👜"},
  {id:5,name:"Classic Straight Trousers",category:"Men",price:1799,icon:"👖"},
  {id:6,name:"Soft Knit Top",category:"Women",price:1299,icon:"🧥"},
  {id:7,name:"Everyday Runner",category:"Shoes",price:2199,icon:"👟"},
  {id:8,name:"S&B Cap",category:"Accessories",price:699,icon:"🧢"}
];

let cart=0;
const money=n=>"₹"+n.toLocaleString("en-IN");
function card(p){
  return `<article class="product-card">
    <button class="heart" onclick="wishlist('${p.name}')">♡</button>
    <div class="product-image"><span>${p.icon}</span></div>
    <div class="product-info">
      <h3>${p.name}</h3>
      <div class="product-meta"><span>${p.category}</span><strong>${money(p.price)}</strong></div>
      <button class="btn btn-dark" onclick="addToCart('${p.name}')">Add to bag</button>
    </div>
  </article>`;
}
function render(list, target){document.getElementById(target).innerHTML=list.map(card).join("")}
render(products.slice(0,4),"productGrid");
render(products,"shopGrid");

document.getElementById("categoryFilter").addEventListener("change",e=>{
  const value=e.target.value;
  render(value==="All"?products:products.filter(p=>p.category===value),"shopGrid");
});
document.getElementById("searchBtn").onclick=()=>{
  document.getElementById("searchPanel").classList.add("open");
  document.getElementById("searchInput").focus();
};
document.getElementById("closeSearch").onclick=()=>document.getElementById("searchPanel").classList.remove("open");
document.getElementById("searchInput").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim();
  render(products.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q)),"shopGrid");
});
document.getElementById("cartBtn").onclick=()=>toast(cart?`Your bag has ${cart} item${cart>1?"s":""}.`:"Your bag is empty — add a product first.");
document.getElementById("wishlistBtn").onclick=()=>toast("Wishlist UI is ready; account storage will be connected later.");
document.getElementById("lookBtn").onclick=()=>toast("Build Your Look will be connected to outfit selection in the next frontend stage.");
function addToCart(name){cart++;document.getElementById("cartCount").textContent=cart;toast(`${name} added to your bag.`)}
function wishlist(name){toast(`${name} saved to wishlist.`)}
function toast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
