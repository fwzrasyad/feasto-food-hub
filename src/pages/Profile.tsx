import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Edit2, Save, Store } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
}

interface VendorProfile {
  name: string;
  email: string;
  restaurant: string;
  phone: string;
  avatar: string;
}

interface Order {
  id: number;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
}

interface IncomingOrder {
  id: number;
  customerName: string;
  items: any[];
  total: number;
  status: string;
  timestamp: string;
  vendorId: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail") || "";
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: userEmail,
    phone: "+60 12-345 6789",
    location: "Desasiswa Tekun, USM",
    avatar: "",
  });
  const [vendorProfile, setVendorProfile] = useState<VendorProfile>({
    name: "Restaurant Owner",
    email: userEmail,
    restaurant: "My Restaurant",
    phone: "+60 12-345 6789",
    avatar: "",
  });
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);

  useEffect(() => {
    // Redirect non-authenticated users
    if (!userRole) {
      navigate("/auth");
      return;
    }

    if (userRole === "customer") {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedOrders = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      setOrderHistory(savedOrders.reverse()); // Show most recent first
    } else if (userRole === "vendor") {
      const vendorName = localStorage.getItem("userName") || "Restaurant Owner";
      const restaurantName = localStorage.getItem("restaurantName") || "My Restaurant";
      
      setVendorProfile({
        name: vendorName,
        email: userEmail,
        restaurant: restaurantName,
        phone: "+60 12-345 6789",
        avatar: "",
      });

      // Load incoming orders for this vendor
      const allOrders = JSON.parse(localStorage.getItem("incomingOrders") || "[]");
      const vendorOrders = allOrders.filter((order: IncomingOrder) => {
        // For now, we'll use a simple identifier - you might want to store vendorId with orders
        return order.vendorId === parseInt(localStorage.getItem("vendorId") || "0");
      });
      setIncomingOrders(vendorOrders.reverse()); // Show most recent first
    }
  }, [userRole, navigate]);

  const handleSaveProfile = () => {
    if (userRole === "customer") {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      toast.success("Profile updated successfully!");
    } else if (userRole === "vendor") {
      localStorage.setItem("userName", vendorProfile.name);
      localStorage.setItem("restaurantName", vendorProfile.restaurant);
      toast.success("Restaurant profile updated successfully!");
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleVendorInputChange = (field: keyof VendorProfile, value: string) => {
    setVendorProfile({ ...vendorProfile, [field]: value });
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    const updatedOrders = incomingOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setIncomingOrders(updatedOrders);
    localStorage.setItem("incomingOrders", JSON.stringify(updatedOrders));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
      case "preparing":
        return "bg-blue-500";
      case "ready":
      case "out-for-delivery":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!userRole) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {userRole === "customer" ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-foreground">My Profile</h1>
                <p className="text-muted-foreground">
                  Manage your account and view order history
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Customer Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Profile Details</span>
                      {!isEditing ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveProfile}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order History */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orderHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No orders yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your order history will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderHistory.map((order) => (
                          <Card key={order.id} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">Order #{order.id}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  {order.status.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="space-y-2 mb-3">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {item.name} x{item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      RM {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-border flex justify-between items-center">
                                <span className="font-semibold">Total</span>
                                <span className="text-lg font-bold text-primary">
                                  RM {order.total.toFixed(2)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 text-foreground flex items-center gap-3">
                  <Store className="h-10 w-10" />
                  Restaurant Profile
                </h1>
                <p className="text-muted-foreground">
                  Manage your restaurant and track incoming orders
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Vendor Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Details</span>
                      {!isEditing ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveProfile}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={vendorProfile.avatar} />
                        <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                          {getInitials(vendorProfile.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="vendor-name" className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          Your Name
                        </Label>
                        <Input
                          id="vendor-name"
                          value={vendorProfile.name}
                          onChange={(e) => handleVendorInputChange("name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      {/* <div>
                        <Label htmlFor="restaurant-name" className="flex items-center gap-2 mb-2">
                          <Store className="h-4 w-4" />
                          Restaurant Name
                        </Label>
                        <Input
                          id="restaurant-name"
                          value={vendorProfile.restaurant}
                          onChange={(e) => handleVendorInputChange("restaurant", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div> */}

                      <div>
                        <Label htmlFor="vendor-email" className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input
                          id="vendor-email"
                          type="email"
                          value={vendorProfile.email}
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="vendor-phone" className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        <Input
                          id="vendor-phone"
                          value={vendorProfile.phone}
                          onChange={(e) => handleVendorInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Incoming Orders */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Incoming Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {incomingOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No incoming orders</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Orders from customers will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {incomingOrders.map((order) => (
                          <Card key={order.id} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">Order #{order.id}</p>
                                  <p className="text-sm text-muted-foreground">
                                    From: <span className="font-medium">{order.customerName}</span>
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  {order.status.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="space-y-2 mb-3">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                      {item.name} x{item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      RM {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-border space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">Total</span>
                                  <span className="text-lg font-bold text-primary">
                                    RM {order.total.toFixed(2)}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  {order.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="flex-1 gradient-primary"
                                        onClick={() => updateOrderStatus(order.id, "accepted")}
                                      >
                                        Accept Order
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => updateOrderStatus(order.id, "rejected")}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {order.status === "accepted" && (
                                    <Button
                                      size="sm"
                                      className="w-full gradient-gold"
                                      onClick={() => updateOrderStatus(order.id, "preparing")}
                                    >
                                      Start Preparing
                                    </Button>
                                  )}
                                  {order.status === "preparing" && (
                                    <Button
                                      size="sm"
                                      className="w-full bg-purple-600 hover:bg-purple-700"
                                      onClick={() => updateOrderStatus(order.id, "ready")}
                                    >
                                      Mark as Ready
                                    </Button>
                                  )}
                                  {order.status === "ready" && (
                                    <Button
                                      size="sm"
                                      className="w-full bg-green-600 hover:bg-green-700"
                                      onClick={() => updateOrderStatus(order.id, "completed")}
                                    >
                                      Order Picked Up
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
