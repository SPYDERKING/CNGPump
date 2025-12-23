import { 
  QrCode, 
  MapPin, 
  Clock, 
  Brain, 
  Bell, 
  Shield, 
  CreditCard, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Smart E-Tokens",
    description: "Get unique QR tokens with dynamic expiry based on your distance, traffic, and weather conditions.",
    color: "primary"
  },
  {
    icon: MapPin,
    title: "GPS-Based Discovery",
    description: "Find nearest CNG pumps with real-time fuel availability and queue status.",
    color: "accent"
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "ML-powered demand forecasting suggests optimal booking times to avoid rush hours.",
    color: "info"
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Live capacity tracking, slot availability, and estimated wait times.",
    color: "success"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get notified 1 hour and 30 mins before your slot. Confirm or release with one tap.",
    color: "warning"
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description: "Pay via UPI, cards, or wallets. Auto-refund if you cancel or miss your slot.",
    color: "primary"
  },
  {
    icon: Smartphone,
    title: "Offline Booking",
    description: "No internet? Book via SMS or IVR call. Works everywhere, anytime.",
    color: "accent"
  },
  {
    icon: Shield,
    title: "Secure & Audited",
    description: "All tokens logged for security. Prevents fraud and duplicate scans.",
    color: "success"
  }
];

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info"
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Powered by AI
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <br />
            <span className="text-primary">Fuel Efficiently</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From smart booking to secure payments, our platform handles it all so you can focus on the road ahead.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
