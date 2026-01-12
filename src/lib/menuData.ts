export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  vendorId: number;
  description?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Nasi Lemak Special",
    price: 6.50,
    category: "Rice",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop",
    vendorId: 1,
    description: "Fragrant coconut rice with sambal, egg, and anchovies"
  },
  {
    id: 2,
    name: "Chicken Chop",
    price: 12.00,
    category: "Western",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
    vendorId: 2,
    description: "Grilled chicken with mushroom sauce and fries"
  },
  {
    id: 3,
    name: "Mee Goreng",
    price: 5.50,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop",
    vendorId: 3,
    description: "Spicy fried noodles with vegetables"
  },
  {
    id: 4,
    name: "Teh Tarik",
    price: 2.50,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop",
    vendorId: 4,
    description: "Traditional Malaysian pulled tea"
  },
  {
    id: 5,
    name: "Roti Canai Set",
    price: 4.00,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
    vendorId: 5,
    description: "Fluffy flatbread with curry dipping sauce"
  },
  {
    id: 6,
    name: "Nasi Ayam",
    price: 7.00,
    category: "Rice",
    image: "https://images.unsplash.com/photo-1603073163308-9c49024d4597?w=400&h=300&fit=crop",
    vendorId: 6,
    description: "Fragrant chicken rice with special sauce"
  },
  {
    id: 7,
    name: "Fish & Chips",
    price: 13.50,
    category: "Western",
    image: "https://images.unsplash.com/photo-1580217593608-61931cefc821?w=400&h=300&fit=crop",
    vendorId: 2,
    description: "Crispy battered fish with golden fries"
  },
  {
    id: 8,
    name: "Iced Milo",
    price: 3.00,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop",
    vendorId: 4,
    description: "Refreshing chocolate malt drink"
  },
  {
    id: 9,
    name: "Char Kuey Teow",
    price: 6.00,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&h=300&fit=crop",
    vendorId: 3,
    description: "Stir-fried flat noodles with prawns"
  },
  {
    id: 10,
    name: "Laksa Penang",
    price: 7.50,
    category: "Noodles",
    image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&h=300&fit=crop",
    vendorId: 3,
    description: "Tangy and spicy fish-based noodle soup"
  },
  {
    id: 11,
    name: "Burger Special",
    price: 8.50,
    category: "Western",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    vendorId: 2,
    description: "Juicy beef patty with cheese and toppings"
  },
  {
    id: 12,
    name: "Fresh Orange Juice",
    price: 4.50,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
    vendorId: 4,
    description: "Freshly squeezed orange juice"
  },
];

export const categories = ["All", "Rice", "Western", "Noodles", "Drinks", "Breakfast"];
