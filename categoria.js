document.addEventListener('DOMContentLoaded', () => {
  const currentCategory = localStorage.getItem('currentCategory') || 'doces';
  const productsRef = ref(database, `products_${currentCategory}`);
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');

  // Abrir modal ao clicar no "+"
  addProductBtn.addEventListener('click', () => {
    productModal.style.display = 'flex';
  });

  // Fechar modal
  closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
  });

  // Salvar produto
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const productData = {
      name: document.getElementById('product-name').value,
      brand: document.getElementById('product-brand').value,
      costPrice: parseFloat(document.getElementById('cost-price').value),
      salePrice: parseFloat(document.getElementById('sale-price').value),
      totalQuantity: parseInt(document.getElementById('total-quantity').value),
      currentQuantity: parseInt(document.getElementById('current-quantity').value)
    };
    push(productsRef, productData); // Adiciona ao Firebase
    productModal.style.display = 'none';
    productForm.reset();
  });

  // Ouvinte em tempo real
  onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    const products = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    renderProducts(products);
  });
});

// Função para renderizar produtos (adicione se não existir)
function renderProducts(products) {
  const productsList = document.getElementById('products-list');
  productsList.innerHTML = products.map(product => `
    <div class="product-item">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-prices">
          <span class="cost-price">Custo: R$ ${product.costPrice.toFixed(2)}</span>
          <span class="sale-price">Venda: R$ ${product.salePrice.toFixed(2)}</span>
        </div>
        <div class="quantity-container">
          <span>Estoque: ${product.currentQuantity}/${product.totalQuantity}</span>
        </div>
      </div>
    </div>
  `).join('');
}