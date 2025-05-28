import { getDatabase, ref, onValue, push, update, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase (já está no seu HTML)
const database = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  const currentCategory = localStorage.getItem('currentCategory') || 'doces';
  const productsRef = ref(database, `products_${currentCategory}`);
  
  // Elementos da interface
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const productForm = document.getElementById('product-form');
  const deleteBtn = document.getElementById('delete-btn');
  const modalTitle = document.getElementById('modal-title');
  const productIdInput = document.getElementById('product-id');
  const closeDetailsModal = document.getElementById('close-details-modal');
  const detailsModal = document.getElementById('details-modal');

  // Função para renderizar produtos
  const renderProducts = (products) => {
    const productsList = document.getElementById('products-list');
    
    if (products.length === 0) {
      productsList.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
      return;
    }

    productsList.innerHTML = products.map(product => {
      const progressPercentage = (product.currentQuantity / product.totalQuantity) * 100;
      
      return `
        <div class="product-item" data-id="${product.id}">
          <div class="product-info" onclick="showDetails('${product.id}')">
            <div class="product-name">${product.name}</div>
            <div class="product-prices">
              <span class="cost-price">Custo: R$ ${product.costPrice.toFixed(2)}</span>
              <span class="sale-price">Venda: R$ ${product.salePrice.toFixed(2)}</span>
            </div>
            <div class="quantity-container">
              <span>Estoque: ${product.currentQuantity}/${product.totalQuantity}</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
          </div>
          <div class="product-actions">
            <button class="action-btn edit-btn" onclick="editProduct('${product.id}', event)">✏️</button>
            <button class="action-btn sell-btn" onclick="sellProduct('${product.id}', event)">-</button>
          </div>
        </div>
      `;
    }).join('');
  };

  // Abrir modal para adicionar produto
  addProductBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Adicionar Produto';
    productIdInput.value = '';
    productForm.reset();
    deleteBtn.style.display = 'none';
    productModal.style.display = 'flex';
  });

  // Fechar modal
  closeModalBtn.addEventListener('click', () => {
    productModal.style.display = 'none';
  });

  // Fechar modal de detalhes
  closeDetailsModal.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });

  // Salvar produto
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productData = {
      name: document.getElementById('product-name').value,
      brand: document.getElementById('product-brand').value,
      costPrice: parseFloat(document.getElementById('cost-price').value),
      salePrice: parseFloat(document.getElementById('sale-price').value),
      totalQuantity: parseInt(document.getElementById('total-quantity').value),
      currentQuantity: parseInt(document.getElementById('current-quantity').value)
    };

    try {
      if (productIdInput.value) {
        await update(ref(database, `products_${currentCategory}/${productIdInput.value}`), productData);
      } else {
        await push(productsRef, productData);
      }
      productModal.style.display = 'none';
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  });

  // Deletar produto
  deleteBtn.addEventListener('click', async () => {
    if (productIdInput.value && confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await remove(ref(database, `products_${currentCategory}/${productIdInput.value}`));
        productModal.style.display = 'none';
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
      }
    }
  });

  // Funções globais
  window.editProduct = async (id, event) => {
    event.stopPropagation();
    try {
      const snapshot = await get(ref(database, `products_${currentCategory}/${id}`));
      const product = snapshot.val();
      
      if (product) {
        modalTitle.textContent = 'Editar Produto';
        productIdInput.value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('cost-price').value = product.costPrice;
        document.getElementById('sale-price').value = product.salePrice;
        document.getElementById('total-quantity').value = product.totalQuantity;
        document.getElementById('current-quantity').value = product.currentQuantity;
        
        deleteBtn.style.display = 'block';
        productModal.style.display = 'flex';
      }
    } catch (error) {
      console.error("Erro ao editar produto:", error);
    }
  };

  window.sellProduct = async (id, event) => {
    event.stopPropagation();
    try {
      const snapshot = await get(ref(database, `products_${currentCategory}/${id}`));
      const product = snapshot.val();
      
      if (product && product.currentQuantity > 0) {
        await update(ref(database, `products_${currentCategory}/${id}`), {
          currentQuantity: product.currentQuantity - 1
        });
      } else {
        alert('Produto esgotado!');
      }
    } catch (error) {
      console.error("Erro ao vender produto:", error);
    }
  };

  window.showDetails = async (id) => {
    try {
      const snapshot = await get(ref(database, `products_${currentCategory}/${id}`));
      const product = snapshot.val();
      
      if (product) {
        const totalSpent = product.costPrice * product.totalQuantity;
        const potentialProfit = (product.salePrice * product.totalQuantity) - totalSpent;
        const soldItems = product.totalQuantity - product.currentQuantity;
        const partialProfit = (product.salePrice * soldItems) - (product.costPrice * soldItems);
        const progressPercentage = (product.currentQuantity / product.totalQuantity) * 100;
        
        document.getElementById('details-title').textContent = product.name;
        document.getElementById('detail-name').textContent = product.name;
        document.getElementById('detail-brand').textContent = product.brand || 'Não informada';
        document.getElementById('detail-cost').textContent = product.costPrice.toFixed(2);
        document.getElementById('detail-sale').textContent = product.salePrice.toFixed(2);
        document.getElementById('detail-quantity').textContent = `${product.currentQuantity}/${product.totalQuantity}`;
        document.getElementById('quantity-bar').style.width = `${progressPercentage}%`;
        document.getElementById('total-spent').textContent = totalSpent.toFixed(2);
        document.getElementById('potential-profit').textContent = potentialProfit.toFixed(2);
        document.getElementById('partial-profit').textContent = partialProfit.toFixed(2);
        
        detailsModal.style.display = 'flex';
      }
    } catch (error) {
      console.error("Erro ao mostrar detalhes:", error);
    }
  };

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