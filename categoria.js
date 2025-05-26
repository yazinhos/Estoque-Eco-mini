document.addEventListener('DOMContentLoaded', function() {
    // Elementos da página
    const categoryTitle = document.getElementById('category-title');
    const productsList = document.getElementById('products-list');
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const productForm = document.getElementById('product-form');
    const deleteBtn = document.getElementById('delete-btn');
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModal = document.getElementById('close-details-modal');
    
    // Obter a categoria atual
    const currentCategory = localStorage.getItem('currentCategory') || 'doces';
    const categoryName = getCategoryName(currentCategory);
    categoryTitle.textContent = categoryName;
    
    // Carregar produtos da categoria
    let products = JSON.parse(localStorage.getItem(`products_${currentCategory}`)) || [];
    
    // Exibir produtos
    renderProducts();
    
    // Event listeners
    addProductBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    closeDetailsModal.addEventListener('click', closeDetailsModalFunc);
    productForm.addEventListener('submit', saveProduct);
    deleteBtn.addEventListener('click', deleteProduct);
    
    // Modal clicando fora
    window.addEventListener('click', function(event) {
        if (event.target === productModal) {
            closeModal();
        }
        if (event.target === detailsModal) {
            closeDetailsModalFunc();
        }
    });
    
    // Funções
    function getCategoryName(category) {
        const names = {
            'doces': 'Doces',
            'bebidas': 'Bebidas',
            'tabacaria': 'Tabacaria',
            'salgados': 'Salgados',
            'mantimentos': 'Mantimentos'
        };
        return names[category] || 'Categoria';
    }
    
    function renderProducts() {
        productsList.innerHTML = '';
        
        if (products.length === 0) {
            productsList.innerHTML = '<p class="no-products">Nenhum produto cadastrado nesta categoria.</p>';
            return;
        }
        
        products.forEach((product, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.dataset.id = product.id;
            
            const progressPercentage = (product.currentQuantity / product.totalQuantity) * 100;
            
            productItem.innerHTML = `
                <div class="product-info" onclick="showProductDetails(${product.id})">
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
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id}, event)">✏️</button>
                    <button class="action-btn sell-btn" onclick="sellProduct(${product.id}, event)">-</button>
                </div>
            `;
            
            productsList.appendChild(productItem);
        });
    }
    
    function openAddModal() {
        document.getElementById('modal-title').textContent = 'Adicionar Produto';
        document.getElementById('product-id').value = '';
        productForm.reset();
        deleteBtn.style.display = 'none';
        productModal.style.display = 'flex';
    }
    
    function closeModal() {
        productModal.style.display = 'none';
    }
    
    function closeDetailsModalFunc() {
        detailsModal.style.display = 'none';
    }
    
    function saveProduct(e) {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value || Date.now();
        const name = document.getElementById('product-name').value;
        const brand = document.getElementById('product-brand').value;
        const costPrice = parseFloat(document.getElementById('cost-price').value);
        const salePrice = parseFloat(document.getElementById('sale-price').value);
        const totalQuantity = parseInt(document.getElementById('total-quantity').value);
        const currentQuantity = parseInt(document.getElementById('current-quantity').value);
        
        const product = {
            id: parseInt(id),
            name,
            brand,
            costPrice,
            salePrice,
            totalQuantity,
            currentQuantity,
            category: currentCategory
        };
        
        // Verificar se é edição ou novo produto
        const existingIndex = products.findIndex(p => p.id == id);
        
        if (existingIndex >= 0) {
            products[existingIndex] = product;
        } else {
            products.push(product);
        }
        
        // Salvar no localStorage
        localStorage.setItem(`products_${currentCategory}`, JSON.stringify(products));
        
        // Atualizar a lista
        renderProducts();
        
        // Fechar modal
        closeModal();
    }
    
    function deleteProduct() {
        const id = document.getElementById('product-id').value;
        
        if (!id) return;
        
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            products = products.filter(product => product.id != id);
            localStorage.setItem(`products_${currentCategory}`, JSON.stringify(products));
            renderProducts();
            closeModal();
        }
    }
    
    // Funções globais (acessíveis no HTML)
    window.editProduct = function(id, event) {
        event.stopPropagation();
        
        const product = products.find(p => p.id == id);
        if (!product) return;
        
        document.getElementById('modal-title').textContent = 'Editar Produto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-brand').value = product.brand;
        document.getElementById('cost-price').value = product.costPrice;
        document.getElementById('sale-price').value = product.salePrice;
        document.getElementById('total-quantity').value = product.totalQuantity;
        document.getElementById('current-quantity').value = product.currentQuantity;
        
        deleteBtn.style.display = 'block';
        productModal.style.display = 'flex';
    };
    
    window.sellProduct = function(id, event) {
        event.stopPropagation();
        
        const productIndex = products.findIndex(p => p.id == id);
        if (productIndex === -1) return;
        
        if (products[productIndex].currentQuantity <= 0) {
            alert('Produto esgotado!');
            return;
        }
        
        products[productIndex].currentQuantity -= 1;
        localStorage.setItem(`products_${currentCategory}`, JSON.stringify(products));
        renderProducts();
    };
    
    window.showProductDetails = function(id) {
        const product = products.find(p => p.id == id);
        if (!product) return;
        
        const progressPercentage = (product.currentQuantity / product.totalQuantity) * 100;
        const totalSpent = product.costPrice * product.totalQuantity;
        const potentialProfit = (product.salePrice * product.totalQuantity) - totalSpent;
        const partialProfit = (product.salePrice * (product.totalQuantity - product.currentQuantity)) - (product.costPrice * (product.totalQuantity - product.currentQuantity));
        
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
    };
});