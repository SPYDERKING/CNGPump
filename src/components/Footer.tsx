import { Fuel, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Footer = () => {
  const { isAdmin } = useAdminAuth();
  
  return (
    <footer className="gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Fuel className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                CNG<span className="text-accent">Queue</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              AI-powered smart CNG pump appointment and queue management system. 
              Skip the queue, fuel smarter.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#pumps" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Find Pumps
                </a>
              </li>
              <li>
                <a 
                  href="#pumps" 
                  className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                >
                  Book Slot
                </a>
              </li>
              <li>
                <Link to="/my-bookings" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  My Tokens
                </Link>
              </li>
              <li>
                <Link to="/payment-history" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Payment History
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {isAdmin && (
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">For Pump Owners</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register-pump" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Register Your Pump
                </Link>
              </li>
              <li>
                <Link to="/pump-admin" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/api-integration" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  API Integration
                </Link>
              </li>
              <li>
                <Link to="/partner-program" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                  Partner Program
                </Link>
              </li>
            </ul>
          </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 text-accent" />
                support@cngqueue.com
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 text-accent" />
                +91 1800-XXX-XXXX
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                <span>
                  Pune<br />
                  Maharashtra
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
