import { Link } from "react-router-dom";
import { ShoppingBag, Truck, Clock, Shield, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative gradient-hero text-white py-24 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaC0ydjJoMnYtMmgydi0yaC0yem0tMiAydi0yaC0ydjJoMnptLTIgMGgtMnYyaDJ2LTJ6bTItNHYtMmgtMnYyaDJ6bTAtNHYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-block mb-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in">
              <span className="text-sm md:text-base font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" fill="currentColor" />
                #1 Food Delivery Platform on Campus
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-fade-in leading-[1.1]">
              Delicious Food,
              <span className="block text-accent mt-3">Delivered Fast</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-white/90 max-w-3xl mx-auto animate-fade-in leading-relaxed font-light">
              Order from your favorite campus vendors and track delivery in real-time
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold gradient-primary shadow-custom-lg hover:shadow-custom-xl transition-all" asChild>
                <Link to="/auth">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold border-2 hover:gradient-primary hover:text-primary-foreground transition-all" asChild>
                <Link to="/vendors">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Browse Vendors
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
              <div className="text-center animate-fade-in">
                <div className="text-4xl md:text-5xl font-display font-bold mb-2">50+</div>
                <div className="text-sm md:text-base text-white/80 font-medium">Vendors</div>
              </div>
              <div className="text-center border-x border-white/20 animate-fade-in">
                <div className="text-4xl md:text-5xl font-display font-bold mb-2">30min</div>
                <div className="text-sm md:text-base text-white/80 font-medium">Avg Delivery</div>
              </div>
              <div className="text-center animate-fade-in">
                <div className="text-4xl md:text-5xl font-display font-bold mb-2">5k+</div>
                <div className="text-sm md:text-base text-white/80 font-medium">Happy Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground">
                Why Choose USM Food?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The smartest way to order food on campus with features designed for your convenience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="hover-lift border-2 shadow-custom-md hover:border-primary/20 transition-all">
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-custom-md">
                    <ShoppingBag className="h-11 w-11 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-4 text-foreground">Wide Selection</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Choose from dozens of campus vendors and cuisines to satisfy any craving
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-lift border-2 shadow-custom-md hover:border-accent/20 transition-all">
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-gold flex items-center justify-center shadow-gold">
                    <Truck className="h-11 w-11 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-4 text-foreground">Fast Delivery</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Get your food delivered within 30 minutes or track estimated arrival time
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-lift border-2 shadow-custom-md hover:border-primary/20 transition-all">
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-custom-md">
                    <Clock className="h-11 w-11 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-4 text-foreground">Real-Time Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Track your order from preparation to delivery with live status updates
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-lift border-2 shadow-custom-md hover:border-accent/20 transition-all">
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-3xl gradient-gold flex items-center justify-center shadow-gold">
                    <Shield className="h-11 w-11 text-accent-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-4 text-foreground">Secure Payment</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Safe and secure payment options for complete peace of mind
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-4 gradient-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaC0ydjJoMnYtMmgydi0yaC0yem0tMiAydi0yaC0ydjJoMnptLTIgMGgtMnYyaDJ2LTJ6bTItNHYtMmgtMnYyaDJ6bTAtNHYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8">Ready to Order?</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Join thousands of students and staff enjoying delicious meals delivered right to their doorstep every day
            </p>
            <Link to="/menu">
              <Button size="lg" className="gradient-gold shadow-gold-lg hover:shadow-gold-lg hover:scale-105 transition-smooth text-lg px-14 py-7 h-auto font-semibold">
                View Full Menu
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
