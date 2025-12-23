import { Button } from "@/components/ui/button";
import { MapPin, Clock, QrCode, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleBookSlot = (e: React.MouseEvent) => {
    console.log('Book Slot button clicked');
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Attempting to scroll to pumps section');
      // Scroll to the pumps section
      const pumpsSection = document.getElementById('pumps');
      if (pumpsSection) {
        pumpsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn('Pumps section not found');
      }
    } catch (error) {
      console.error('Scroll error:', error);
    }
  };
  
  const handleFindPumps = (e: React.MouseEvent) => {
    console.log('Find Pumps button clicked');
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('Attempting to scroll to pumps section');
      // Scroll to the pumps section
      const pumpsSection = document.getElementById('pumps');
      if (pumpsSection) {
        pumpsSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn('Pumps section not found');
      }
    } catch (error) {
      console.error('Scroll error:', error);
    }
  };
  
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground backdrop-blur-sm">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">AI-Powered Smart Queue System</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Skip the Queue,
              <br />
              <span className="text-accent">Fuel Smarter</span>
            </h1>

            <p className="text-lg text-primary-foreground/70 max-w-xl leading-relaxed">
              Book your CNG slot in advance, get real-time updates, and never wait in long queues again. 
              Smart e-tokens with dynamic expiry based on traffic & weather.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                variant="accent" 
                size="xl" 
                className="group" 
                onClick={handleBookSlot}
              >
                Book Your Slot
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="glass" 
                size="xl" 
                onClick={handleFindPumps}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Nearest Pump
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/10">
              <div>
                <div className="font-display text-3xl font-bold text-accent">500+</div>
                <div className="text-sm text-primary-foreground/60">Pumps Connected</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-accent">50K+</div>
                <div className="text-sm text-primary-foreground/60">Happy Customers</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-accent">15 min</div>
                <div className="text-sm text-primary-foreground/60">Avg. Time Saved</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="relative hidden lg:block">
            {/* Main Card */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-float" style={{ animationDelay: '0s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-card-foreground">E-Token Ready</div>
                    <div className="text-sm text-muted-foreground">Token #CNG-8472</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                  Active
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <Clock className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Slot Time</div>
                  <div className="font-display font-semibold text-card-foreground">14:30 - 14:50</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm text-muted-foreground">Station</div>
                  <div className="font-display font-semibold text-card-foreground">Pump #12</div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="mt-6 flex justify-center">
                <div className="w-32 h-32 bg-card rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 glass rounded-xl p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-card-foreground">Fuel Available</div>
                  <div className="text-xs text-muted-foreground">850 kg remaining</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-card-foreground">Next Slot</div>
                  <div className="text-xs text-muted-foreground">In 25 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
