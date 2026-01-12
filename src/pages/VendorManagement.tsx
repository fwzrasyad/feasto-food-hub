import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Store, Clock, CheckCircle, XCircle, Loader2, Utensils, ClipboardList, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// Types
interface VendorProfile {
  id: number;
  name: string;
  description: string;
  image_url: string;
  hostel: string;
  is_open: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  is_available: boolean;
}

interface OrderItem {
  quantity: number;
  menu_item: { name: string };
  price_at_time: number;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  profiles: { full_name: string; email: string }; // Customer info
  order_items: OrderItem[];
}

const VendorManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);

  // Onboarding Form State
  const [onboardingForm, setOnboardingForm] = useState({
    name: "",
    description: "",
    hostel: "Bidasari",
    image_url: ""
  });

  // Dashboard State
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Menu Editing State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "Rice",
    image_url: ""
  });

  // Load Data
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.role !== 'vendor') {
      toast.error("Access denied. Vendors only.");
      navigate("/");
      return;
    }

    // Start main data load
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      // 1. Get Vendor Profile
      const { data: profile, error: profileError } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', user!.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching vendor:", profileError);
      }

      if (profile) {
        setVendorProfile(profile);

        // 2. Parallel Fetch: Orders & Menu
        // This is much faster than awaiting them sequentially
        const [ordersResult, menuResult] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              id, created_at, status, total_amount,
              profiles:user_id (full_name, email),
              order_items (
                quantity, price_at_time,
                menu_item:menu_items(name)
              )
            `)
            .eq('vendor_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(50), // Limit to recent 50 orders for performance

          supabase
            .from('menu_items')
            .select('*')
            .eq('vendor_id', profile.id)
            .order('name')
        ]);

        if (ordersResult.error) console.error("Orders error", ordersResult.error);
        if (menuResult.error) console.error("Menu error", menuResult.error);

        setOrders(ordersResult.data as any || []);
        setMenuItems(menuResult.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS: ONBOARDING ---
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          owner_id: user!.id,
          name: onboardingForm.name,
          description: onboardingForm.description,
          hostel: onboardingForm.hostel,
          image_url: onboardingForm.image_url || 'https://placehold.co/600x400',
          is_open: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Store created successfully!");
      setVendorProfile(data);
      // Reload everything
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  // --- ACTIONS: ORDERS ---
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Optimistic Update: Update UI immediately
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error("Failed to update status");
      // Revert optimization on error
      loadDashboardData();
    } else {
      toast.success(`Order marked as ${newStatus}`);
    }
  };

  // --- ACTIONS: MENU ---
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorProfile) return;

    const payload = {
      vendor_id: vendorProfile.id,
      name: menuForm.name,
      price: parseFloat(menuForm.price),
      description: menuForm.description,
      category: menuForm.category,
      image_url: menuForm.image_url || 'https://placehold.co/400',
      is_available: true
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Item updated");
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(payload);
        if (error) throw error;
        toast.success("Item added");
      }
      setIsDialogOpen(false);

      // Refresh just the menu for speed
      const { data } = await supabase.from('menu_items').select('*').eq('vendor_id', vendorProfile.id).order('name');
      setMenuItems(data || []);

      setEditingItem(null);
      setMenuForm({ name: "", price: "", description: "", category: "Rice", image_url: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    // Optimistic remove
    const originalItems = [...menuItems];
    setMenuItems(menuItems.filter(i => i.id !== id));

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete");
      setMenuItems(originalItems); // Revert
    } else {
      toast.success("Item deleted");
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      image_url: item.image_url
    });
    setIsDialogOpen(true);
  };

  // --- ACTIONS: STORE SETTINGS ---
  const handleToggleOpen = async () => {
    if (!vendorProfile) return;
    const newState = !vendorProfile.is_open;

    // Optimistic Update
    setVendorProfile({ ...vendorProfile, is_open: newState });

    const { error } = await supabase
      .from('vendors')
      .update({ is_open: newState })
      .eq('id', vendorProfile.id);

    if (error) {
      toast.error("Failed to update status");
      setVendorProfile({ ...vendorProfile, is_open: !newState }); // Revert
    } else {
      toast.success(newState ? "Store is now OPEN" : "Store is now CLOSED");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'store' | 'menu') => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${field}/${fileName}`;

    const toastId = "upload";
    toast.loading("Uploading image...", { id: toastId });

    try {
      console.log(`Starting upload to ${filePath}`);
      // Add upsert: true to prevent errors if overwriting (though random name makes it rare)
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      console.log("Public URL:", data.publicUrl);

      toast.success("Upload successful!", { id: toastId });

      if (field === 'store') {
        setOnboardingForm({ ...onboardingForm, image_url: data.publicUrl });
        // If profile exists, auto-save the new image
        if (vendorProfile) {
          const { error: dbError } = await supabase.from('vendors').update({ image_url: data.publicUrl }).eq('id', vendorProfile.id);
          if (dbError) console.error("DB Update Error:", dbError);
          setVendorProfile({ ...vendorProfile, image_url: data.publicUrl });
        }
      } else {
        setMenuForm({ ...menuForm, image_url: data.publicUrl });
      }
    } catch (error: any) {
      console.error("Upload Handler Log:", error);
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    }
  };

  // --- RENDER ---

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );

  // View 1: Onboarding
  if (!vendorProfile) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-muted/50 to-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4 animate-in fade-in slide-in-from-bottom-5">
          <Card className="w-full max-w-lg shadow-2xl border-primary/10">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Create Your Store Profile</CardTitle>
              <CardDescription>Tell us about your food business to start selling.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input required value={onboardingForm.name} onChange={e => setOnboardingForm({ ...onboardingForm, name: e.target.value })} className="border-primary/20 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={onboardingForm.description} onChange={e => setOnboardingForm({ ...onboardingForm, description: e.target.value })} className="border-primary/20 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label>Location / Hostel</Label>
                  <Select value={onboardingForm.hostel} onValueChange={v => setOnboardingForm({ ...onboardingForm, hostel: v })}>
                    <SelectTrigger className="border-primary/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aman Damai">Aman Damai</SelectItem>
                      <SelectItem value="Fajar Harapan">Fajar Harapan</SelectItem>
                      <SelectItem value="Bakti Permai">Bakti Permai</SelectItem>
                      <SelectItem value="Cahaya Gemilang">Cahaya Gemilang</SelectItem>
                      <SelectItem value="Indah Kembara">Indah Kembara</SelectItem>
                      <SelectItem value="Restu & Saujana">Restu & Saujana</SelectItem>
                      <SelectItem value="Tekun">Tekun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'store')} className="border-primary/20" />
                  </div>
                  {onboardingForm.image_url && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Image uploaded</p>}
                </div>
                <Button type="submit" className="w-full gradient-primary shadow-lg hover:shadow-primary/25 h-11 text-lg">Create Store</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // View 2: Dashboard
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero Header */}
      <div className="relative bg-muted/30 border-b">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-cover bg-center shadow-lg border-2 border-white ring-2 ring-primary/20"
                style={{ backgroundImage: `url(${vendorProfile.image_url})` }}
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  {vendorProfile.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur">
                    <Store className="w-3 h-3 mr-1" /> {vendorProfile.hostel}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant={vendorProfile.is_open ? 'default' : 'destructive'} className={vendorProfile.is_open ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {vendorProfile.is_open ? 'OPEN FOR BUSINESS' : 'CLOSED'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2">
                <Label htmlFor="store-status" className="font-medium text-sm text-muted-foreground">Store Status</Label>
                <Button
                  id="store-status"
                  variant={vendorProfile.is_open ? "default" : "secondary"}
                  size="sm"
                  onClick={handleToggleOpen}
                  className={vendorProfile.is_open ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {vendorProfile.is_open ? "Open" : "Closed"}
                </Button>
              </div>
              <Button variant="outline" className="shadow-sm hover:shadow" onClick={() => {
                localStorage.setItem("selectedVendorId", vendorProfile.id.toString());
                navigate(`/menu`);
              }}>
                View Public Page
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-background/60 backdrop-blur border-primary/10 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Active Orders</p>
                  <p className="text-xl font-bold">{activeOrdersCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur border-primary/10 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600"><DollarSign className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                  <p className="text-xl font-bold">RM {totalRevenue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur border-primary/10 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><Utensils className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Menu Items</p>
                  <p className="text-xl font-bold">{menuItems.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto grid grid-cols-2 md:inline-flex">
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all focus-visible:ring-0 gap-2">
              <ClipboardList className="w-4 h-4" /> Live Orders
            </TabsTrigger>
            <TabsTrigger value="menu" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all focus-visible:ring-0 gap-2">
              <Utensils className="w-4 h-4" /> Menu Management
            </TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* PENDING */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  <h3 className="font-bold text-yellow-700 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Pending ({orders.filter(o => o.status === 'pending').length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {orders.filter(o => o.status === 'pending').map(order => (
                    <Card key={order.id} className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Order #{order.id}</CardTitle>
                            <CardDescription className="text-xs">{new Date(order.created_at).toLocaleTimeString()}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="font-bold">RM {order.total_amount.toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm font-medium mt-1 text-foreground/80">{order.profiles?.full_name || "Guest"}</p>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="bg-muted/30 p-2 rounded-md space-y-1 mb-3 text-sm">
                          {order.order_items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="font-medium text-foreground">{item.quantity}x {item.menu_item?.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                            Accept Order
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {orders.filter(o => o.status === 'pending').length === 0 && (
                    <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                      <Clock className="h-8 w-8 mb-2 opacity-20" />
                      <p>No pending orders</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PREPARING */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <h3 className="font-bold text-blue-700 flex items-center gap-2">
                    <Utensils className="w-5 h-5" /> Preparing ({orders.filter(o => o.status === 'preparing').length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {orders.filter(o => o.status === 'preparing').map(order => (
                    <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Order #{order.id}</CardTitle>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-1">{order.profiles?.full_name}</p>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="bg-muted/30 p-2 rounded-md space-y-1 mb-3 text-sm">
                          {order.order_items.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{item.quantity}x {item.menu_item?.name}</span>
                            </div>
                          ))}
                        </div>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={() => updateOrderStatus(order.id, 'completed')}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Ready for Pickup
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {orders.filter(o => o.status === 'preparing').length === 0 && (
                    <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                      <Utensils className="h-8 w-8 mb-2 opacity-20" />
                      <p>Kitchen is clear</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COMPLETED */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <h3 className="font-bold text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Completed (Last 24h)
                  </h3>
                </div>
                <div className="space-y-3">
                  {orders.filter(o => o.status === 'completed' || o.status === 'cancelled').slice(0, 5).map(order => (
                    <Card key={order.id} className={`border-l-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity ${order.status === 'cancelled' ? 'border-l-red-500' : 'border-l-green-500'}`}>
                      <CardHeader className="p-3 pb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">#{order.id}</span>
                          <Badge variant="outline" className={order.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}>
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 text-sm text-muted-foreground flex justify-between">
                        <span>{order.profiles?.full_name}</span>
                        <span>RM {order.total_amount.toFixed(2)}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* MENU TAB */}
          <TabsContent value="menu" className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Your Menu</h2>
                <p className="text-muted-foreground text-sm">Manage item availability and pricing</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  setMenuForm({ name: "", price: "", description: "", category: "Rice", image_url: "" });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary shadow-lg hover:shadow-primary/25"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveItem} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input required value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Price (RM)</Label>
                      <Input type="number" step="0.1" required value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={menuForm.category} onValueChange={v => setMenuForm({ ...menuForm, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rice">Rice</SelectItem>
                          <SelectItem value="Noodles">Noodles</SelectItem>
                          <SelectItem value="Western">Western</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} />
                    </div>
                    <div>
                      <Label>Image</Label>
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'menu')} />
                      {menuForm.image_url && <img src={menuForm.image_url} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-md border" />}
                    </div>
                    <Button type="submit" className="w-full gradient-primary">Save Item</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {menuItems.map(item => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all border-border/60">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url(${item.image_url})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <h3 className="font-bold truncate text-lg shadow-black drop-shadow-md">{item.name}</h3>
                      <p className="font-medium text-white/90">RM {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <CardContent className="p-4 bg-card">
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 hover:bg-primary/10 hover:text-primary" onClick={() => openEditDialog(item)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {menuItems.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground mb-4">No menu items yet.</p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Add your first item</Button>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default VendorManagement;
