import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Package, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
}

const Delivery = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("deliveryOrders") || "[]");
    setOrders(savedOrders);
  }, []);

  const getDeliveryProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 20;
      case "accepted":
        return 40;
      case "preparing":
        return 60;
      case "ready":
        return 80;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const getProgressColor = (status: string) => {
    const progress = getDeliveryProgress(status);
    if (progress === 100) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-purple-500";
    return "bg-yellow-500";
  };

  const advanceDeliveryStatus = (orderId: number) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        let newStatus = order.status;
        if (order.status === "ready") newStatus = "out-for-delivery";
        if (order.status === "out-for-delivery") newStatus = "completed";
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem("deliveryOrders", JSON.stringify(updatedOrders));
    toast.success("Delivery status updated!");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Delivery Tracker</h1>
            <p className="text-muted-foreground">
              Track your orders in real-time
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Deliveries</h3>
                <p className="text-muted-foreground">
                  Your orders will appear here once placed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Order #{order.id}</span>
                      <Badge className={getProgressColor(order.status)}>
                        {order.status === "completed" ? "DELIVERED" : "IN PROGRESS"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ordered: {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Tracker */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Delivery Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {getDeliveryProgress(order.status)}%
                        </span>
                      </div>
                      <Progress value={getDeliveryProgress(order.status)} className="h-3" />
                      
                      <div className="flex justify-between mt-4 text-xs">
                        <div className={`flex flex-col items-center gap-1 ${getDeliveryProgress(order.status) >= 20 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <Package className="h-5 w-5" />
                          <span>Received</span>
                        </div>
                        <div className={`flex flex-col items-center gap-1 ${getDeliveryProgress(order.status) >= 60 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <Package className="h-5 w-5" />
                          <span>Preparing</span>
                        </div>
                        <div className={`flex flex-col items-center gap-1 ${getDeliveryProgress(order.status) >= 80 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <Truck className="h-5 w-5" />
                          <span>On the Way</span>
                        </div>
                        <div className={`flex flex-col items-center gap-1 ${getDeliveryProgress(order.status) === 100 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          <CheckCircle className="h-5 w-5" />
                          <span>Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-medium">RM {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">RM {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Update Status Button (for demo purposes) */}
                    {order.status === "ready" && (
                      <Button
                        onClick={() => advanceDeliveryStatus(order.id)}
                        className="w-full gradient-primary"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Mark Out for Delivery
                      </Button>
                    )}
                    
                    {order.status === "out-for-delivery" && (
                      <Button
                        onClick={() => advanceDeliveryStatus(order.id)}
                        className="w-full gradient-gold"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}

                    {order.status === "completed" && (
                      <div className="text-center p-4 bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="font-semibold text-green-500">Order Delivered Successfully!</p>
                      </div>
                    )}
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

export default Delivery;
