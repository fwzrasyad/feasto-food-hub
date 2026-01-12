import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Package, CheckCircle, Clock, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  vendor: {
    name: string;
    image_url: string;
    description: string;
  };
  order_items: {
    quantity: number;
    price_at_time: number;
    menu_item: {
      name: string;
    };
  }[];
}

const Delivery = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      // If no ID, maybe redirect to orders or show error
      return;
    }

    const fetchOrder = async () => {
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
                        image_url,
                        description
                    ),
                    order_items (
                        quantity,
                        price_at_time,
                        menu_item:menu_items (
                            name
                        )
                    )
                `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data as any);
      } catch (error: any) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load delivery details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription for status updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder((prev) => prev ? { ...prev, status: payload.new.status } : null);
          toast.info(`Order status updated: ${payload.new.status}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);


  const getDeliveryProgress = (status: string) => {
    switch (status) {
      case "pending": return 10;
      case "accepted": return 30; // Custom status mapping if needed
      case "preparing": return 50;
      case "ready": return 75;
      case "out_for_delivery": return 90; // "out-for-delivery"
      case "completed": return 100;
      case "cancelled": return 0;
      default: return 0;
    }
  };

  const getStepStatus = (step: string, currentStatus: string) => {
    // Helper to determine if a step is active/completed
    const progress = getDeliveryProgress(currentStatus);
    let stepProgress = 0;
    switch (step) {
      case 'received': stepProgress = 10; break;
      case 'preparing': stepProgress = 50; break;
      case 'on_the_way': stepProgress = 90; break;
      case 'delivered': stepProgress = 100; break;
    }
    return progress >= stepProgress;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/20">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
          </Button>

          <Card className="shadow-lg border-primary/10 overflow-hidden">
            {/* Map Placeholder or Visual Hero */}
            <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
              <div className="relative z-10 text-center animate-in fade-in zoom-in duration-700">
                <Truck className="h-16 w-16 mx-auto text-primary mb-2 drop-shadow-md" />
                <h2 className="text-2xl font-bold tracking-tight">
                  {order.status === 'completed' ? 'Delivered!' : 'Delivery in Progress'}
                </h2>
                <p className="text-muted-foreground font-medium">Order #{order.id}</p>
              </div>
            </div>

            <CardContent className="p-8">
              {/* Progress Bar */}
              <div className="mb-10">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-lg">Estimated Arrival</span>
                  <span className="text-primary font-bold">20-30 min</span>
                </div>
                <Progress value={getDeliveryProgress(order.status)} className="h-4 rounded-full bg-muted/50" indicatorClassName="bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000" />

                <div className="grid grid-cols-4 mt-6 text-center relative">
                  {/* Step 1: Received */}
                  <div className={`flex flex-col items-center gap-2 ${getStepStatus('received', order.status) ? 'text-primary' : 'text-muted/40'}`}>
                    <div className={`p-2 rounded-full border-2 ${getStepStatus('received', order.status) ? 'border-primary bg-primary/10' : 'border-current'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">Ordered</span>
                  </div>

                  {/* Step 2: Preparing */}
                  <div className={`flex flex-col items-center gap-2 ${getStepStatus('preparing', order.status) ? 'text-primary' : 'text-muted/40'}`}>
                    <div className={`p-2 rounded-full border-2 ${getStepStatus('preparing', order.status) ? 'border-primary bg-primary/10' : 'border-current'}`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">Preparing</span>
                  </div>

                  {/* Step 3: On the Way */}
                  <div className={`flex flex-col items-center gap-2 ${getStepStatus('on_the_way', order.status) ? 'text-primary' : 'text-muted/40'}`}>
                    <div className={`p-2 rounded-full border-2 ${getStepStatus('on_the_way', order.status) ? 'border-primary bg-primary/10' : 'border-current'}`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">On the Way</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`flex flex-col items-center gap-2 ${getStepStatus('delivered', order.status) ? 'text-green-600' : 'text-muted/40'}`}>
                    <div className={`p-2 rounded-full border-2 ${getStepStatus('delivered', order.status) ? 'border-green-600 bg-green-100' : 'border-current'}`}>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={order.vendor.image_url} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-background" alt={order.vendor.name} />
                    <div>
                      <h3 className="font-bold text-lg">{order.vendor.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{order.vendor.description}</p>
                    </div>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="uppercase">
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="bg-background border px-2 py-0.5 rounded text-xs font-bold shadow-sm">{item.quantity}x</span>
                        <span>{item.menu_item.name}</span>
                      </div>
                      <span className="font-medium">RM {(item.price_at_time * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed my-4" />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Paid</span>
                  <span className="text-primary">RM {order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Delivery;
