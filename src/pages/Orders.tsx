import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Package, ArrowRight, Clock, MapPin, Eye, Receipt, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    vendor: { // Joined from vendors table
        name: string;
        image_url: string;
    };
    order_items: {
        quantity: number;
        price_at_time: number;
        menu_item: {
            name: string;
        };
    }[];
}

const Orders = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/auth");
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
            id,
            total_amount,
            status,
            created_at,
            vendor:vendors (
              name,
              image_url
            ),
            order_items (
              quantity,
              price_at_time,
              menu_item:menu_items (
                name
              )
            )
          `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data as any);
            } catch (error: any) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "preparing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 px-4 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold gradient-text-primary">My Orders</h1>
                        <Button variant="outline" onClick={() => navigate("/menu")}>
                            Browse Menu
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <Card className="text-center py-16 border-dashed">
                            <CardContent>
                                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                                <p className="text-muted-foreground mb-6">Looks like you haven't ordered anything yet.</p>
                                <Button className="gradient-primary" onClick={() => navigate("/menu")}>
                                    Start Ordering
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-cover bg-center shrink-0"
                                                    style={{ backgroundImage: `url(${order.vendor?.image_url || 'https://placehold.co/100'})` }} />
                                                <div>
                                                    <CardTitle className="text-lg">{order.vendor?.name || "Unknown Vendor"}</CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                                <span className="font-bold text-lg">RM {order.total_amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="space-y-3 mb-4">
                                            {/* Show first 2 items only, then '...' if more */}
                                            {order.order_items.slice(0, 2).map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{item.quantity}x</span> {item.menu_item?.name}
                                                    </span>
                                                </div>
                                            ))}
                                            {order.order_items.length > 2 && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    + {order.order_items.length - 2} more items...
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            {order.status !== 'cancelled' && (
                                                <Button
                                                    className="flex-1 gradient-primary shadow-md hover:shadow-primary/25"
                                                    onClick={() => navigate(`/delivery?id=${order.id}`)}
                                                >
                                                    <Truck className="w-4 h-4 mr-2" /> Track Delivery
                                                </Button>
                                            )}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="flex-1">
                                                        <Eye className="w-4 h-4 mr-2" /> Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <Receipt className="w-5 h-5 text-primary" />
                                                            Order Receipt #{order.id}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    <div className="py-4 space-y-6">
                                                        <div className="flex justify-between items-center border-b pb-4">
                                                            <div>
                                                                <p className="font-bold text-lg">{order.vendor?.name}</p>
                                                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                                                            </div>
                                                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                                                {order.status}
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {order.order_items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <div className="flex gap-3">
                                                                        <span className="font-bold w-6 text-center bg-muted rounded">{item.quantity}x</span>
                                                                        <span>{item.menu_item?.name}</span>
                                                                    </div>
                                                                    <span>RM {(item.price_at_time * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="border-t pt-4 space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Subtotal</span>
                                                                <span>RM {order.total_amount.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Delivery Fee</span>
                                                                <span>RM 0.00</span>
                                                            </div>
                                                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                                                                <span>Total</span>
                                                                <span className="text-primary">RM {order.total_amount.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Orders;
