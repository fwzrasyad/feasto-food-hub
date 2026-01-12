import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuCard from "@/components/MenuCard";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Trash2, Minus, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";


// Import Supabase Client
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
// import { vendors } from "@/lib/vendorsData"; // REMOVED

// Define Types locally to match Database + Frontend needs
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  vendorId: number;
  // Optional fields for UI compatibility
  rating?: number;
  reviews?: number;
  calories?: number;
  isVegetarian?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  // const [showCart, setShowCart] = useState(false); // REMOVED
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVendor, setCurrentVendor] = useState<any>(null); // New State

  // Categories can be static or dynamic. Static is fine for now.
  const categories = ["All", "Rice", "Noodles", "Chicken", "Beverages", "Snacks"];

  // 1. FETCH DATA FROM SUPABASE
  useEffect(() => {
    const initData = async () => {
      setLoading(true);

      // Load Cart from LocalStorage
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(savedCart);

      // Check URL for Vendor Filter
      const vendorIdStore = localStorage.getItem("selectedVendorId");
      const currentVendorId = vendorIdStore ? parseInt(vendorIdStore) : null;
      setSelectedVendorId(currentVendorId);

      // FETCH VENDOR INFO (If selected)
      if (currentVendorId) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', currentVendorId)
          .single();

        if (vendorData) setCurrentVendor(vendorData);
      }

      // FETCH MENU ITEMS
      let query = supabase.from('menu_items').select('*');

      // Optional: Filter by vendor in the database query itself (Better performance)
      if (currentVendorId) {
        query = query.eq('vendor_id', currentVendorId);
      } else {
        // If no vendor selected, maybe limit or show all? 
        // For now, let's just show all to keep it simple, or user can browse all food
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to load menu items");
      } else if (data) {
        // Map DB columns to Frontend Interface
        const mappedItems: MenuItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          image: item.image_url || "https://placehold.co/400",
          vendorId: item.vendor_id || 1,
          rating: 4.5,
          reviews: 10,
          calories: 0,
          isVegetarian: false
        }));
        setMenuItems(mappedItems);
      }
      setLoading(false);
    };

    initData();
  }, []); // Run once on mount

  // Handle ?openCart=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("openCart") === "1") {
        navigate("/cart"); // Redirect to new dedicated page
      }
    } catch (e) { /* ignore */ }
  }, [location.search, navigate]);

  // Cart Logic
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addToCart = (item: MenuItem, qty: number = 1) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + qty }
          : cartItem
      );
      updateCart(updatedCart);
    } else {
      updateCart([...cart, { ...item, quantity: qty }]);
    }
    toast.success(`${qty}x ${item.name} added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart')
      }
    });
  };

  const { user } = useAuth(); // Needed for checkout

  // Filter Logic (Client side filtering for search/category)
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">

          {/* Vendor Header */}
          <div className="mb-8">
            {currentVendor && (
              <Button variant="ghost" className="mb-4" onClick={() => {
                localStorage.removeItem("selectedVendorId");
                navigate("/vendors");
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vendors
              </Button>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  {currentVendor ? currentVendor.name : "All Menu Items"}
                </h1>
                {currentVendor && <p className="text-lg text-muted-foreground max-w-2xl">{currentVendor.description || "Order delicious meals directly from us."}</p>}
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-lg mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-primary/20 focus-visible:ring-primary shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-6 transition-all ${selectedCategory === category ? "gradient-primary border-0 shadow-md" : "hover:bg-primary/5 hover:text-primary border-primary/20 bg-background"}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  {...item}
                  onAddToCart={(item) => addToCart(item as MenuItem, 1)}
                  onClick={() => setSelectedItem(item)}
                  isVendor={user?.role === 'vendor'}
                />
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}

          {/* Item Detail Modal */}
          <ItemDetailsDialog
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            item={selectedItem}
            onAddToCart={(item, qty) => addToCart(item as MenuItem, qty)}
            isVendor={user?.role === 'vendor'}
          />

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Menu;