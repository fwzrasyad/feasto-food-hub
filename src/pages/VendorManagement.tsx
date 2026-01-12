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
import { Plus, Edit, Trash2, Store, Clock, CheckCircle, XCircle, Loader2, Utensils, ClipboardList } from "lucide-react";
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

    checkVendorProfile();
  }, [user, navigate]);

  const checkVendorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error("Error fetching vendor:", error);
      }

      if (data) {
        setVendorProfile(data);
        // Load initial data for dashboard
        fetchOrders(data.id);
        fetchMenu(data.id);
      }
    } catch (error) {
      console.error(error);
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
      fetchOrders(data.id);
      fetchMenu(data.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS: ORDERS ---
  const fetchOrders = async (vendorId: number) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, created_at, status, total_amount,
        profiles:user_id (full_name, email),
        order_items (
          quantity, price_at_time,
          menu_item:menu_items(name)
        )
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) toast.error("Failed to load orders");
    else setOrders(data as any || []);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order marked as ${newStatus}`);
      if (vendorProfile) fetchOrders(vendorProfile.id);
    }
  };

  // --- ACTIONS: MENU ---
  const fetchMenu = async (vendorId: number) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('name');

    if (error) toast.error("Failed to load menu");
    else setMenuItems(data || []);
  };

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
      fetchMenu(vendorProfile.id);
      setEditingItem(null);
      setMenuForm({ name: "", price: "", description: "", category: "Rice", image_url: "" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Item deleted");
      if (vendorProfile) fetchMenu(vendorProfile.id);
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

  // --- RENDER ---

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // View 1: Onboarding
  if (!vendorProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Create Your Store Profile</CardTitle>
              <CardDescription>Tell us about your food business to start selling.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStore} className="space-y-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input required value={onboardingForm.name} onChange={e => setOnboardingForm({ ...onboardingForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={onboardingForm.description} onChange={e => setOnboardingForm({ ...onboardingForm, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Location / Hostel</Label>
                  <Select value={onboardingForm.hostel} onValueChange={v => setOnboardingForm({ ...onboardingForm, hostel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bidasari">Bidasari</SelectItem>
                      <SelectItem value="Aman Damai">Aman Damai</SelectItem>
                      <SelectItem value="Lembaran">Lembaran</SelectItem>
                      <SelectItem value="Restu">Restu</SelectItem>
                      <SelectItem value="Saujana">Saujana</SelectItem>
                      <SelectItem value="Tekun">Tekun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input placeholder="https://..." value={onboardingForm.image_url} onChange={e => setOnboardingForm({ ...onboardingForm, image_url: e.target.value })} />
                </div>
                <Button type="submit" className="w-full gradient-primary">Create Store</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // View 2: Dashboard
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{vendorProfile.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Store className="w-4 h-4" /> {vendorProfile.hostel}
              <span className={`px-2 py-0.5 rounded-full text-xs ${vendorProfile.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {vendorProfile.is_open ? 'OPEN' : 'CLOSED'}
              </span>
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/vendor?id=${vendorProfile.id}`)}>
            View Public Page
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Orders</TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Menu Management</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['pending', 'preparing', 'completed'].map((status) => (
                <div key={status} className="space-y-4">
                  <h3 className="font-semibold capitalize text-lg flex items-center gap-2">
                    {status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {status === 'preparing' && <Utensils className="w-5 h-5 text-blue-500" />}
                    {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status} ({orders.filter(o => o.status === status).length})
                  </h3>

                  {orders.filter(o => o.status === status).map(order => (
                    <Card key={order.id} className="shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Order #{order.id}</CardTitle>
                            <CardDescription className="text-xs">{new Date(order.created_at).toLocaleString()}</CardDescription>
                          </div>
                          <Badge variant="outline">RM {order.total_amount.toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm font-medium mt-1">{order.profiles?.full_name || "Guest"}</p>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="space-y-1 my-2">
                          {order.order_items.map((item, i) => (
                            <div key={i} className="text-sm flex justify-between">
                              <span>{item.quantity}x {item.menu_item?.name || "Item"}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-4 pt-2 border-t">
                          {status === 'pending' && (
                            <>
                              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" className="w-full" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                Reject
                              </Button>
                            </>
                          )}
                          {status === 'preparing' && (
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateOrderStatus(order.id, 'completed')}>
                              Mark Ready
                            </Button>
                          )}
                          {status === 'completed' && (
                            <p className="text-xs text-center w-full text-muted-foreground">Order Completed</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {orders.filter(o => o.status === status).length === 0 && (
                    <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                      No {status} orders
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* MENU TAB */}
          <TabsContent value="menu">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Your Menu</h2>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingItem(null);
                  setMenuForm({ name: "", price: "", description: "", category: "Rice", image_url: "" });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary"><Plus className="w-4 h-4 mr-2" /> Add New Item</Button>
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
                      <Label>Image URL</Label>
                      <Input placeholder="https://..." value={menuForm.image_url} onChange={e => setMenuForm({ ...menuForm, image_url: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full gradient-primary">Save Item</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map(item => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="h-40 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${item.image_url})` }} />
                  <CardContent className="p-4 relative bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold truncate pr-2">{item.name}</h3>
                      <span className="font-bold text-primary">RM {item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(item)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default VendorManagement;
