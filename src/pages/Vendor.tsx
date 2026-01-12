import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
}

const Vendor = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("vendorOrders") || "[]");
    setOrders(savedOrders);
  }, []);

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("vendorOrders", JSON.stringify(updatedOrders));
    
    // Update delivery orders as well
    const deliveryOrders = JSON.parse(localStorage.getItem("deliveryOrders") || "[]");
    const updatedDeliveryOrders = deliveryOrders.map((order: Order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem("deliveryOrders", JSON.stringify(updatedDeliveryOrders));
    
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "preparing":
        return "bg-purple-500";
      case "ready":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "accepted";
      case "accepted":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "completed";
      default:
        return currentStatus;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "preparing":
        return <Package className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Vendor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage incoming orders and update their status
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground">
                  New orders will appear here when customers place them
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
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.toUpperCase()}
                        </span>
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-primary">
                            RM {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Total</p>
                        <p className="text-2xl font-bold text-primary">RM {order.total.toFixed(2)}</p>
                      </div>
                      
                      {order.status !== "completed" && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          className="gradient-primary"
                        >
                          {order.status === "pending" && "Accept Order"}
                          {order.status === "accepted" && "Start Preparing"}
                          {order.status === "preparing" && "Mark Ready"}
                          {order.status === "ready" && "Complete Order"}
                        </Button>
                      )}
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

export default Vendor;
