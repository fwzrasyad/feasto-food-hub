import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ArrowRight, Clock, MapPin } from "lucide-react";
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
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [user, navigate]);

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
                                                <div className="h-12 w-12 rounded-lg bg-cover bg-center"
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
                                        <div className="space-y-3">
                                            {order.order_items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{item.quantity}x</span> {item.menu_item?.name}
                                                    </span>
                                                    <span>RM {(item.price_at_time * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
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
