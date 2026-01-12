import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// Define Types locally to avoid circular deps (can refactor to types.ts later)
interface CartItem {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;
    vendorId: number;
    quantity: number;
}

const Cart = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load Cart
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);

        // Listen for updates from other tabs/components
        const handleStorageChange = () => {
            const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
            setCart(updatedCart);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const updateCart = (newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cartUpdated")); // Notify Header
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

    const checkout = async () => {
        if (cart.length === 0) return toast.error("Your cart is empty!");
        if (!user) {
            toast.error("Please login to place an order");
            navigate("/auth");
            return;
        }

        setLoading(true);
        try {
            // 1. Group items by vendor
            const itemsByVendor: Record<number, CartItem[]> = {};
            cart.forEach(item => {
                const vId = item.vendorId || 1; // Fallback
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

            // Clear Cart
            updateCart([]);
            toast.success("Order placed successfully! 🎉");
            navigate("/orders");

        } catch (error: any) {
            console.error("Checkout error:", error);
            if (error.code === '23503') {
                toast.error("Cart contains items from unavailable vendors. Please clear your cart and try again.");
            } else {
                toast.error("Failed to place order: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 py-12 px-4 bg-muted/20">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-display font-bold">Your Cart</h1>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="md:col-span-2 space-y-4">
                            {cart.length === 0 ? (
                                <Card className="text-center py-16 border-dashed">
                                    <CardContent>
                                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                                        <p className="text-muted-foreground mb-6">Hungry? Browse the menu to add some delicious food!</p>
                                        <Button className="gradient-primary" onClick={() => navigate("/vendors")}>
                                            Browse Restaurants
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">Items</h2>
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            if (confirm("Clear entire cart?")) updateCart([]);
                                        }} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4 mr-2" /> Clear All
                                        </Button>
                                    </div>
                                    {cart.map((item) => (
                                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="flex p-4 gap-4">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{item.category}</p>
                                                        </div>
                                                        <p className="font-bold text-lg text-primary">RM {(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-1">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md bg-white shadow-sm hover:bg-white/90" onClick={() => updateQuantity(item.id, -1)}>
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md bg-white shadow-sm hover:bg-white/90" onClick={() => updateQuantity(item.id, 1)}>
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Order Summary */}
                        {cart.length > 0 && (
                            <div className="md:col-span-1">
                                <Card className="sticky top-24 shadow-lg border-primary/10">
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <CardTitle className="text-lg">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>RM {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Delivery Fee</span>
                                            <span>RM 0.00</span>
                                        </div>
                                        <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                            <span>Total</span>
                                            <span className="text-primary">RM {cartTotal.toFixed(2)}</span>
                                        </div>
                                        <Button
                                            className="w-full gradient-primary h-12 text-lg shadow-lg hover:shadow-primary/25 mt-6"
                                            onClick={checkout}
                                            disabled={loading}
                                        >
                                            {loading ? "Processing..." : "Place Order"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Cart;
