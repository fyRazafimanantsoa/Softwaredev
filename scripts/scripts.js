// app.js

document.querySelector('.btn').addEventListener('click', () => {
  const nav = document.querySelector('.navigation');
  nav.classList.toggle('show');
});

async function fetchProducts() {
  const res = await fetch('json/products.json');
  return res.ok ? res.json() : [];
}

// Reuse: Sanitize function
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Reuse: Product rendering function
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

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

// Load all products and display based on page
async function loadAllProducts() {
  try {
    const res = await fetch('json/products.json');
    if (!res.ok) throw new Error('Network error');
    const products = await res.json();

    // Check which container exists and render accordingly
    if (document.getElementById('prodhome')) {
      renderProducts(products.slice(0, 6), 'prodhome'); // Optional: limit on home
    } else if (document.getElementById('products')) {
      renderProducts(products, 'products'); // Show all on products.html
    }
  } catch (error) {
    console.error('Error loading products:', error);
    const container =
      document.getElementById('prodhome') || document.getElementById('products');
    if (container) {
      container.innerHTML = `<div class="error">⚠️ Failed to load products. Please try again later.</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', loadAllProducts);


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
