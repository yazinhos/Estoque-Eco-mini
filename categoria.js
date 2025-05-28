// categoria.js
document.addEventListener('DOMContentLoaded', () => {
  const currentCategory = localStorage.getItem('currentCategory') || 'doces';
  
  // Referência ao banco de dados
  const productsRef = ref(database, `products_${currentCategory}`);
  
  // Ouvinte em tempo real
  onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    const products = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    
    renderProducts(products); // Sua função para exibir produtos
  });
  
  // Função para adicionar produto
  window.addProduct = (productData) => {
    push(productsRef, productData);
  };
  
  // Função para atualizar produto
  window.updateProduct = (id, newData) => {
    update(ref(database, `products_${currentCategory}/${id}`), newData);
  };
  
  // Função para deletar produto
  window.deleteProduct = (id) => {
    remove(ref(database, `products_${currentCategory}/${id}`));
  };
});