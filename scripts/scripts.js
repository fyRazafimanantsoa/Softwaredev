// app.js
async function fetchProducts() {
  const res = await fetch('json/products.json');
  return res.ok ? res.json() : [];
}

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getRandomSubset(arr, count) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <a href="${sanitize(p.url)}" target="_blank" rel="noopener">
        <img src="${sanitize(p.image)}" alt="${sanitize(p.name)}">
      </a>
      <h3>${sanitize(p.name)}</h3>
      <p>${sanitize(p.price)}</p>
      <p>${sanitize(p.description)}</p>
    `;
    container.appendChild(div);
  });
}

function setDates() {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('lastModified').textContent = document.lastModified;
}

document.addEventListener('DOMContentLoaded', async () => {
  setDates();
  const all = await fetchProducts();
  const subset = getRandomSubset(all, Math.floor(Math.random() * 4) + 3);
  renderProducts(subset);
});
