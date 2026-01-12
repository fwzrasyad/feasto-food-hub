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
import { vendors } from "@/lib/vendorsData"; // Keep vendors static for now, or fetch them too if you want

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
  const [showCart, setShowCart] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

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

      // FETCH FROM DB
      let query = supabase.from('menu_items').select('*');

      // Optional: Filter by vendor in the database query itself (Better performance)
      if (currentVendorId) {
        query = query.eq('vendor_id', currentVendorId);
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
        setShowCart(true);
        navigate(location.pathname, { replace: true });
      }
    } catch (e) { /* ignore */ }
  }, [location.search]);

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
    toast.success(`${qty}x ${item.name} added to cart!`);
  };

  const updateQuantity = (id: number, change: number) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updatedCart);
  };

  const removeFromCart = (id: number) => {
    updateCart(cart.filter((item) => item.id !== id));
    toast.info("Item removed");
  };

  const { user } = useAuth(); // Needed for checkout

  const checkout = async () => {
    if (cart.length === 0) {
      return toast.error("Your cart is empty!");
    }

    if (!user) {
      toast.error("Please login to place an order");
      navigate("/auth");
      return;
    }

    try {
      // 1. Group items by vendor
      // We need to create one order per vendor to match the schema design 
      const itemsByVendor: Record<number, CartItem[]> = {};
      cart.forEach(item => {
        const originalItem = menuItems.find(m => m.id === item.id);
        const vId = originalItem?.vendorId || 1; // Fallback

        if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
        itemsByVendor[vId].push(item);
      });

      // 2. Create Order for each Vendor
      const promises = Object.entries(itemsByVendor).map(async ([vendorIdStr, items]) => {
        const vendorId = parseInt(vendorIdStr);
        const vendorTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // A. Insert Order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            vendor_id: vendorId,
            total_amount: vendorTotal,
            status: 'pending'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // B. Insert Order Items
        const orderItemsData = items.map(item => ({
          order_id: orderData.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData);

        if (itemsError) throw itemsError;
      });

      await Promise.all(promises);

      // Save to LocalStorage (Legacy/Backup for demo persistence if needed, but redundant now)
      // const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      // orderHistory.push(...); 
      // localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

      // Clear Cart
      updateCart([]);
      setShowCart(false);
      toast.success("Order placed successfully! 🎉");

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order: " + error.message);
    }
  };

  // Filter Logic (Client side filtering for search/category)
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentVendor = selectedVendorId ? vendors.find(v => v.id === selectedVendorId) : null;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 bg-gradient-to-b from-background to-muted/30">
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
            <h1 className="text-4xl font-bold text-primary">
              {currentVendor ? currentVendor.name : "All Menu Items"}
            </h1>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "gradient-primary" : ""}
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
                />
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No items found.</p>
          )}

          {/* Item Detail Modal */}
          <ItemDetailsDialog
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            item={selectedItem}
            onAddToCart={(item, qty) => addToCart(item as MenuItem, qty)}
          />

        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <Button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full gradient-gold shadow-lg z-40"
          size="icon"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -right-2 -top-2 bg-primary text-white">{cartItemCount}</Badge>
          </div>
        </Button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowCart(false)}>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <Card className="h-full rounded-none border-0">
              <CardHeader className="border-b flex flex-row items-center justify-between">
                <CardTitle>Your Cart</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>✕</Button>
              </CardHeader>
              <CardContent className="p-4">
                {cart.length === 0 ? <p className="text-center py-8">Cart is empty</p> : (
                  <>
                    <div className="space-y-4 mb-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-primary font-semibold">RM {item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold mb-4">
                        <span>Total:</span>
                        <span className="text-primary">RM {cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full gradient-primary" size="lg" onClick={checkout}>Checkout</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Menu;