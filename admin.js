let list = {};
let editIdx = null;
let prod = {};
let err = "S-a produs o eroare."

async function ajax(method, url, body) {
  return new Promise(function(resolve, reject) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject(new Error("serverul a dat eroare"));
        }
      }
    };
    xhttp.open(method, url, true);
    xhttp.send(body);
  });
};

async function getProducts() {
  await ajax("GET", "https://wineareaa.firebaseio.com/products.json")
    .then(function(answer) {
      list = answer;
      drawProducts();
    })
    .catch(function(err) {
      console.error(err);
    }) 
};

function drawProducts() {
  let str = "";
  for (let i in list) {
    if (!list.hasOwnProperty(i)) {
      continue;
    }
    if (list[i] === null) {
      continue;
    }

    str += `
    <tr>
      <td class="image"><img src="${list[i].image}" alt=""></td>
      <td class="name"><span onclick="editProduct('${i}')">${list[i].name}</span></td>
      <td class="price">${list[i].price}<span> lei</span></td>
      <td class="quantity">${list[i].stock}</td>
      <td><span class="remove" onclick="deleteProduct('${i}')">Remove</span></td>
    </tr>
  `;
  }

  document.querySelector("table tbody").innerHTML = str;

}

function showEditForm() {
  document.querySelector("#edit").style.display = "block";
  document.querySelector("#list").style.display = "none";
}

function showProductsTable() {
  document.querySelector("#edit").style.display = "none";
  document.querySelector("#addContainer").style.display = "none";
  document.querySelector("#list").style.display = "";
}

function showAddForm() {
  document.querySelector("#addContainer").style.display = "block";
  document.querySelector("#list").style.display = "none";
}


function editProduct(i) {
  showEditForm();
  editIdx = i;
  let productChanged = list[i];
  document.querySelector("#productName").innerHTML = productChanged.name;
  document.querySelector('[ name="image"]').value = productChanged.image;
  document.querySelector('[name="name"]').value = productChanged.name;
  document.querySelector('[name="brand"]').value = productChanged.brand;
  document.querySelector('[name="milliliters"]').value = productChanged.milliliters;
  document.querySelector('[name="description"]').value = productChanged.description;
  document.querySelector('[name="price"]').value = productChanged.price;
  document.querySelector('[name="quantity"]').value = productChanged.stock;
}

async function getCart(i, productChanged) {
  await ajax("GET", `https://wineareaa.firebaseio.com/cart/${i}.json`)
    .then(function(answer) {
      prod = answer;
    })
    .then(async function() {
      if (prod !== null) {
        await ajax("PUT", `https://wineareaa.firebaseio.com/cart/${editIdx}/price.json`, JSON.stringify(productChanged.price))
        await ajax("PUT", `https://wineareaa.firebaseio.com/cart/${editIdx}/stock.json`, JSON.stringify(productChanged.stock))
      }
    })
}

async function saveChanges() {
  let productChanged = {};
  productChanged.name = document.querySelector('[name="name"]').value;
  productChanged.milliliters = document.querySelector('[name="milliliters"]').value;
  productChanged.brand = document.querySelector('[name="brand"]').value;
  productChanged.image = document.querySelector('[ name="image"]').value;
  productChanged.description = document.querySelector('[ name="description"]').value;
  productChanged.price = document.querySelector('[ name="price"]').value;
  productChanged.stock = document.querySelector('[ name="quantity"]').value;
  await getCart(editIdx, productChanged);
  await ajax("PUT", `https://wineareaa.firebaseio.com/products/${editIdx}.json`, JSON.stringify(productChanged))
  await getProducts();
  showProductsTable();
  editIdx = null;
}

async function deleteProduct(i) {
  if(confirm(`Vrei sa stergi produsul ${list[i].name}`) == true) {
    await ajax("DELETE", `https://wineareaa.firebaseio.com/products/${i}.json`)
    await getProducts();
  }


}

async function addProduct() {
  let productChanged = {};
  productChanged.name = document.querySelector('[name="name1"]').value;
  productChanged.brand = document.querySelector('[name="brand1"]').value;
  productChanged.image = document.querySelector('[ name="image1"]').value;
  productChanged.description = document.querySelector('[ name="description1"]').value;
  productChanged.price = document.querySelector('[ name="price1"]').value;
  productChanged.stock = document.querySelector('[ name="quantity1"]').value;
  productChanged.milliliters = document.querySelector('[ name="milliliters1"]').value;
  await ajax("POST", "https://wineareaa.firebaseio.com/products/.json", JSON.stringify(productChanged))
  await getProducts();
  showProductsTable();
}

function loading() {
  let load = setTimeout(showPage, 600);
}

async function showPage() {
  await getProducts();
  document.querySelector("#content").classList.remove("hidden");

}