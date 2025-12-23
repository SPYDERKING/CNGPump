import { MapPin, Calendar, QrCode, Fuel, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Find Nearby Pump",
    description: "Use GPS to discover nearest CNG stations with real-time fuel availability."
  },
  {
    icon: Calendar,
    step: "02",
    title: "Select Your Slot",
    description: "Choose a convenient time slot and specify fuel quantity if needed."
  },
  {
    icon: QrCode,
    step: "03",
    title: "Get E-Token",
    description: "Receive your unique QR token with smart expiry after payment."
  },
  {
    icon: Fuel,
    step: "04",
    title: "Scan & Refuel",
    description: "Show your token at the pump, scan it, and get your CNG filled quickly."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Simple Process
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in just a few simple steps. No complex setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative text-center group animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all group-hover:scale-105">
                    <step.icon className="w-9 h-9 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-bold text-sm shadow-md">
                    {step.step}
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
