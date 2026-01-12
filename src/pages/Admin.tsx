import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Shield, Store, Users, TrendingUp } from "lucide-react";
import { vendors as initialVendors, hostels } from "@/lib/vendorsData";

interface Vendor {
  id: number;
  name: string;
  hostel: string;
  description: string;
  image: string;
  rating: number;
  cuisine: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  const [newVendor, setNewVendor] = useState({
    name: "",
    hostel: "",
    description: "",
    image: "",
    cuisine: "",
  });

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/auth");
    }
  }, [navigate]);

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.hostel || !newVendor.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const vendor: Vendor = {
      id: Date.now(),
      name: newVendor.name,
      hostel: newVendor.hostel,
      description: newVendor.description,
      image: newVendor.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      rating: 4.5,
      cuisine: newVendor.cuisine,
    };

    setVendors([...vendors, vendor]);
    toast.success("Vendor added successfully!");
    setIsAddDialogOpen(false);
    setNewVendor({ name: "", hostel: "", description: "", image: "", cuisine: "" });
  };

  const handleDeleteVendor = (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
    toast.success("Vendor removed successfully!");
  };

  const handleEditVendor = () => {
    if (!selectedVendor) return;

    setVendors(vendors.map(v => v.id === selectedVendor.id ? selectedVendor : v));
    toast.success("Vendor updated successfully!");
    setIsEditDialogOpen(false);
    setSelectedVendor(null);
  };

  const openEditDialog = (vendor: Vendor) => {
    setSelectedVendor({ ...vendor });
    setIsEditDialogOpen(true);
  };

  const stats = [
    { label: "Total Vendors", value: vendors.length, icon: Store, gradient: "gradient-primary" },
    { label: "Active Hostels", value: hostels.length, icon: Users, gradient: "gradient-gold" },
    { label: "Total Orders", value: "156", icon: TrendingUp, gradient: "gradient-primary" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-display font-bold mb-3 text-gradient-primary">
                Admin Dashboard
              </h1>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage vendors and system settings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-custom-md hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold text-gradient-primary">{stat.value}</p>
                    </div>
                    <div className={`${stat.gradient} p-4 rounded-2xl shadow-custom-md`}>
                      <stat.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vendor Management */}
          <Card className="shadow-custom-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">Vendor Management</CardTitle>
                  <CardDescription>Add, edit, or remove vendors from the platform</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                      <DialogDescription>Fill in the details to add a new vendor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Restaurant Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Nasi Lemak Corner"
                          value={newVendor.name}
                          onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hostel">Hostel *</Label>
                        <Select value={newVendor.hostel} onValueChange={(value) => setNewVendor({ ...newVendor, hostel: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hostel" />
                          </SelectTrigger>
                          <SelectContent>
                            {hostels.map((hostel) => (
                              <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cuisine">Cuisine Type</Label>
                        <Input
                          id="cuisine"
                          placeholder="e.g., Malaysian, Chinese"
                          value={newVendor.cuisine}
                          onChange={(e) => setNewVendor({ ...newVendor, cuisine: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                          id="description"
                          placeholder="Brief description"
                          value={newVendor.description}
                          onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          placeholder="https://..."
                          value={newVendor.image}
                          onChange={(e) => setNewVendor({ ...newVendor, image: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button className="gradient-primary" onClick={handleAddVendor}>Add Vendor</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <Card key={vendor.id} className="overflow-hidden shadow-custom-md hover-lift">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={vendor.image} 
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 shadow-lg"
                          onClick={() => openEditDialog(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 shadow-lg"
                          onClick={() => handleDeleteVendor(vendor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{vendor.hostel}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update vendor information</DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Restaurant Name</Label>
                <Input
                  id="edit-name"
                  value={selectedVendor.name}
                  onChange={(e) => setSelectedVendor({ ...selectedVendor, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hostel">Hostel</Label>
                <Select value={selectedVendor.hostel} onValueChange={(value) => setSelectedVendor({ ...selectedVendor, hostel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cuisine">Cuisine</Label>
                <Input
                  id="edit-cuisine"
                  value={selectedVendor.cuisine}
                  onChange={(e) => setSelectedVendor({ ...selectedVendor, cuisine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedVendor.description}
                  onChange={(e) => setSelectedVendor({ ...selectedVendor, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleEditVendor}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
