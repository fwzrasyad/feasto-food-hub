import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto shadow-custom-md">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-custom-md">
                <span className="text-2xl font-bold text-primary-foreground">U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">USM Food</span>
                <span className="text-xs text-muted-foreground font-medium">Campus Delivery</span>
              </div>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Delicious food delivered right to your campus location. Fast, convenient, and reliable.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-base text-muted-foreground hover:text-primary transition-smooth font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-base text-muted-foreground hover:text-primary transition-smooth font-medium">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/vendor" className="text-base text-muted-foreground hover:text-primary transition-smooth font-medium">
                  Vendor Portal
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="text-base text-muted-foreground hover:text-primary transition-smooth font-medium">
                  Track Delivery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-foreground">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-base text-muted-foreground">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>Universiti Sains Malaysia, Penang</span>
              </li>
              <li className="flex items-center gap-3 text-base text-muted-foreground">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>+60 4-653 3888</span>
              </li>
              <li className="flex items-center gap-3 text-base text-muted-foreground">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>food@usm.my</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-foreground">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted hover:gradient-primary hover:text-primary-foreground transition-smooth shadow-custom-sm hover:shadow-custom-md hover:scale-110"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted hover:gradient-primary hover:text-primary-foreground transition-smooth shadow-custom-sm hover:shadow-custom-md hover:scale-110"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted hover:gradient-primary hover:text-primary-foreground transition-smooth shadow-custom-sm hover:shadow-custom-md hover:scale-110"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-base text-muted-foreground">
            © 2025 USM Food Ordering & Delivery System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
