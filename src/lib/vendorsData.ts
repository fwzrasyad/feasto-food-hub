export const hostels = [
  "Bakti Permai",
  "Aman Damai",
  "Fajar Harapan",
  "Indah Kembara",
  "Restu",
  "Cahaya Gemilang",
  "Tekun",
  "Saujana"
];

export interface Vendor {
  id: number;
  name: string;
  hostel: string;
  description: string;
  image: string;
  rating: number;
  cuisine: string;
}

export const vendors: Vendor[] = [
  {
    id: 1,
    name: "Nasi Lemak Corner",
    hostel: "Bakti Permai",
    description: "Authentic Malaysian breakfast specialist",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop",
    rating: 4.8,
    cuisine: "Malaysian"
  },
  {
    id: 2,
    name: "Western Grill House",
    hostel: "Bakti Permai",
    description: "Premium western dishes and grills",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
    rating: 4.6,
    cuisine: "Western"
  },
  {
    id: 3,
    name: "Mee Goreng Express",
    hostel: "Aman Damai",
    description: "Fast and delicious noodle dishes",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop",
    rating: 4.7,
    cuisine: "Noodles"
  },
  {
    id: 4,
    name: "Beverage Station",
    hostel: "Aman Damai",
    description: "Fresh drinks and traditional beverages",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop",
    rating: 4.5,
    cuisine: "Drinks"
  },
  {
    id: 5,
    name: "Roti Canai Bistro",
    hostel: "Fajar Harapan",
    description: "Traditional breakfast and tea time",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
    rating: 4.9,
    cuisine: "Breakfast"
  },
  {
    id: 6,
    name: "Ayam Penyet Specialist",
    hostel: "Indah Kembara",
    description: "Indonesian rice dishes",
    image: "https://images.unsplash.com/photo-1603073163308-9c49024d4597?w=400&h=300&fit=crop",
    rating: 4.7,
    cuisine: "Rice"
  }
];
