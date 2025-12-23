import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Fuel, User, MapPin, LogOut, Calendar, Shield, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, isPumpAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Fuel className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              CNG<span className="text-primary">Queue</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </a>
            <a href="/#pumps" className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Find Pumps
            </a>
            
            {isAdmin && (
              <>
                <Link to="/register-pump" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Register Your Pump
                </Link>
                <Link to="/pump-admin" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Admin Dashboard
                </Link>
                <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Analytics
                </Link>
              </>
            )}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate('/pump-admin')}>
                        <Fuel className="w-4 h-4 mr-2" />
                        Pump Dashboard
                      </DropdownMenuItem>
                      {isSuperAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/super-admin')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Super Admin
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Account</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                  Book Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              <a href="/#features" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                Features
              </a>
              <a href="/#how-it-works" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                How It Works
              </a>
              <a href="/#pumps" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                Find Pumps
              </a>
              
              {user && (
                <>
                  <div className="border-t border-border my-2" />
                  <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">Dashboard</p>
                  <Link 
                    to="/dashboard" 
                    className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 ${isActive('/dashboard') ? 'bg-muted' : ''}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 ${isActive('/my-bookings') ? 'bg-muted' : ''}`}
                  >
                    <Calendar className="w-4 h-4" />
                    My Bookings
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <>
                  <div className="border-t border-border my-2" />
                  <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">Admin</p>
                  <Link 
                    to="/register-pump" 
                    className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2`}
                  >
                    Register Your Pump
                  </Link>
                  <Link 
                    to="/pump-admin" 
                    className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 ${isActive('/pump-admin') ? 'bg-muted' : ''}`}
                  >
                    <Fuel className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/analytics" 
                    className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2`}
                  >
                    Analytics
                  </Link>
                  {isSuperAdmin && (
                    <Link 
                      to="/super-admin" 
                      className={`px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 ${isActive('/super-admin') ? 'bg-muted' : ''}`}
                    >
                      <Shield className="w-4 h-4" />
                      Super Admin
                    </Link>
                  )}
                </>
              )}
              
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate("/auth")}>
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button variant="hero" onClick={() => navigate("/auth")}>
                      Book Now
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
