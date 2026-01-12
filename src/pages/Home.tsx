import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Clock, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background Gradient & Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-5 z-0" />

                <div className="container relative z-10 px-4 md:px-6 text-center">
                    <div className="animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
                            Campus Dining, <br />
                            <span className="gradient-text-primary">Evolved.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Skip the queue. Order from your favorite USM cafes and stalls right from your phone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="gradient-primary text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-primary/30 transition-all hover:scale-105" onClick={() => navigate("/menu")}>
                                Order Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            {!user && (
                                <Button size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full border-2 hover:bg-muted/50" onClick={() => navigate("/auth")}>
                                    Sign Up / Login
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative Blob */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse" />
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center space-y-4 group p-6 rounded-2xl hover:bg-background/80 hover:shadow-xl transition-all duration-500 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Utensils className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Diverse Options</h3>
                            <p className="text-muted-foreground">From Nasi Lemak to Western cuisine, explore all campus vendors in one place.</p>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4 group p-6 rounded-2xl hover:bg-background/80 hover:shadow-xl transition-all duration-500 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Skip the Queue</h3>
                            <p className="text-muted-foreground">Pre-order your meals and pick them up when they're ready. No more waiting.</p>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4 group p-6 rounded-2xl hover:bg-background/80 hover:shadow-xl transition-all duration-500 border border-transparent hover:border-border/50">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                <Wallet className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold">Easy Payment</h3>
                            <p className="text-muted-foreground">Seamless digital payments. Track your spending and order history easily.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
