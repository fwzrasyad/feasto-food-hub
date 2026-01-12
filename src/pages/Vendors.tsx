import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Star, MapPin, ChevronRight } from "lucide-react";
import { vendors, hostels } from "@/lib/vendorsData";

const Vendors = () => {
  const navigate = useNavigate();
  const [selectedHostel, setSelectedHostel] = useState<string>("All");

  const filteredVendors = selectedHostel === "All" 
    ? vendors 
    : vendors.filter(v => v.hostel === selectedHostel);

  const handleVendorClick = (vendorId: number) => {
    localStorage.setItem("selectedVendorId", vendorId.toString());
    navigate("/menu");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-6 px-6 py-2.5 text-sm font-semibold gradient-gold border-0 shadow-gold">
              Browse Restaurants
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-gradient-primary">
              Choose Your Vendor
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Select from our diverse range of restaurants across USM hostels
            </p>
          </div>

          <Tabs value={selectedHostel} onValueChange={setSelectedHostel} className="mb-12">
            <TabsList className="flex flex-wrap h-auto gap-3 bg-muted/50 p-3 rounded-2xl border-2">
              <TabsTrigger value="All" className="flex-1 min-w-[120px] rounded-xl font-semibold data-[state=active]:gradient-primary data-[state=active]:text-white">
                All Hostels
              </TabsTrigger>
              {hostels.map((hostel) => (
                <TabsTrigger key={hostel} value={hostel} className="flex-1 min-w-[120px] rounded-xl font-semibold data-[state=active]:gradient-primary data-[state=active]:text-white">
                  {hostel}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedHostel} className="mt-10">
              {filteredVendors.length === 0 ? (
                <Card className="shadow-custom-lg">
                  <CardContent className="p-16 text-center">
                    <Store className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="text-2xl font-display font-bold mb-3">No Vendors Found</h3>
                    <p className="text-muted-foreground text-lg">
                      No vendors available in this hostel yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVendors.map((vendor) => (
                    <Card 
                      key={vendor.id} 
                      className="hover-lift cursor-pointer group shadow-custom-md hover:shadow-custom-lg transition-all duration-500 border-2 hover:border-primary/20"
                      onClick={() => handleVendorClick(vendor.id)}
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img
                            src={vendor.image}
                            alt={vendor.name}
                            className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <Badge className="absolute top-6 right-6 bg-white/95 text-primary backdrop-blur-sm font-semibold px-4 py-2 shadow-md">
                            {vendor.cuisine}
                          </Badge>
                        </div>
                        
                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
                                {vendor.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{vendor.hostel}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-xl">
                              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                              <span className="text-base font-bold">{vendor.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                            {vendor.description}
                          </p>
                          
                          <Button 
                            className="w-full gradient-primary group-hover:shadow-gold-lg transition-all py-6 text-base font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVendorClick(vendor.id);
                            }}
                          >
                            View Menu
                            <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vendors;
