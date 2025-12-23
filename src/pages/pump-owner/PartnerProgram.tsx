import { useNavigate } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Users, TrendingUp, Star, Gift } from 'lucide-react';

const PartnerProgram = () => {
  const navigate = useNavigate();
  const { loading } = useAdminAccess();
  
  const benefits = [
    {
      icon: <Award className="h-8 w-8 text-blue-500" />,
      title: "Revenue Sharing",
      description: "Earn up to 25% commission on all bookings made through our platform"
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Lead Generation",
      description: "Access to qualified leads and customer data in your area"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: "Growth Tools",
      description: "Marketing materials and promotional support to grow your business"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Premium Support",
      description: "Dedicated account manager and 24/7 priority support"
    }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const tiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for new partners",
      features: [
        "Basic dashboard access",
        "Up to 100 bookings/month",
        "Standard support",
        "Email notifications"
      ]
    },
    {
      name: "Professional",
      price: "₹2,999/month",
      description: "For growing businesses",
      features: [
        "Advanced analytics",
        "Unlimited bookings",
        "Priority support",
        "SMS notifications",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "White-label solution",
        "Dedicated infrastructure",
        "24/7 dedicated support",
        "API access",
        "Custom integrations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Partner Program</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our partner network and unlock new revenue streams while providing exceptional service to your customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  {benefit.icon}
                </div>
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Partner Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-blue-500 border-2' : ''}`}>
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="my-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.price !== "Custom" && tier.price !== "Free" && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <p className="text-muted-foreground">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featIndex) => (
                      <li key={featIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p className="text-muted-foreground">
                  Register your business and complete the verification process
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Integrate</h3>
                <p className="text-muted-foreground">
                  Set up our system at your location and train your staff
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
                <p className="text-muted-foreground">
                  Begin receiving bookings and earning commissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Become a Partner?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of successful CNG pump owners who are already benefiting from our partner program. 
            Our team is ready to help you get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Gift className="mr-2 h-5 w-5" />
              Apply Now
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerProgram;