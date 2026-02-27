// Static seed catalog — used as offline fallback when the remote API is
// unreachable. Keep field names in sync with the API contract:
// { id, name, price, img, category }

export const fallbackProducts = [
  {
    id: 1,
    name: "Hamburger Clássico",
    price: 25.0,
    img: "https://placehold.co/300x300/e8a87c/ffffff?text=Hamburger",
    category: "Sanduíches",
  },
  {
    id: 2,
    name: "Cheeseburger Duplo",
    price: 32.0,
    img: "https://placehold.co/300x300/e8a87c/ffffff?text=Cheeseburger",
    category: "Sanduíches",
  },
  {
    id: 3,
    name: "Bacon Burger",
    price: 35.0,
    img: "https://placehold.co/300x300/c0392b/ffffff?text=Bacon+Burger",
    category: "Sanduíches",
  },
  {
    id: 4,
    name: "Veggie Burger",
    price: 28.0,
    img: "https://placehold.co/300x300/27ae60/ffffff?text=Veggie",
    category: "Sanduíches",
  },
  {
    id: 5,
    name: "X-Tudo",
    price: 38.0,
    img: "https://placehold.co/300x300/e8a87c/ffffff?text=X-Tudo",
    category: "Sanduíches",
  },
  {
    id: 6,
    name: "Batata Frita Pequena",
    price: 12.0,
    img: "https://placehold.co/300x300/f1c40f/333333?text=Fries+P",
    category: "Acompanhamentos",
  },
  {
    id: 7,
    name: "Batata Frita Grande",
    price: 18.0,
    img: "https://placehold.co/300x300/f1c40f/333333?text=Fries+G",
    category: "Acompanhamentos",
  },
  {
    id: 8,
    name: "Onion Rings",
    price: 16.0,
    img: "https://placehold.co/300x300/d4ac0d/333333?text=Onion+Rings",
    category: "Acompanhamentos",
  },
  {
    id: 9,
    name: "Refrigerante Lata",
    price: 7.0,
    img: "https://placehold.co/300x300/2980b9/ffffff?text=Refri",
    category: "Bebidas",
  },
  {
    id: 10,
    name: "Suco Natural",
    price: 10.0,
    img: "https://placehold.co/300x300/e74c3c/ffffff?text=Suco",
    category: "Bebidas",
  },
  {
    id: 11,
    name: "Milk Shake Chocolate",
    price: 19.0,
    img: "https://placehold.co/300x300/6c3483/ffffff?text=Shake",
    category: "Bebidas",
  },
  {
    id: 12,
    name: "Sobremesa do Dia",
    price: 14.0,
    img: "https://placehold.co/300x300/f39c12/ffffff?text=Sobremesa",
    category: "Sobremesas",
  },
];
