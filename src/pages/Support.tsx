import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageSquare, Clock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the support request
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Support Center
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Need help with your bookings, payments, or account? Our support team is here to assist you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Reach out to us through any of these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Email Support</h3>
                      <p className="text-muted-foreground text-sm">support@cngqueue.com</p>
                      <p className="text-muted-foreground text-xs mt-1">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Phone Support</h3>
                      <p className="text-muted-foreground text-sm">+91 1800-XXX-XXXX</p>
                      <p className="text-muted-foreground text-xs mt-1">Mon-Fri, 9AM-6PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Live Chat</h3>
                      <p className="text-muted-foreground text-sm">Available in the app</p>
                      <p className="text-muted-foreground text-xs mt-1">Mon-Sun, 8AM-10PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Response Times</h3>
                      <ul className="text-muted-foreground text-sm mt-1 space-y-1">
                        <li>Email: Within 24 hours</li>
                        <li>Phone: Immediate during business hours</li>
                        <li>Chat: Usually under 5 minutes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="font-medium">How do I book a CNG slot?</span>
                        <span className="ml-4 transform group-open:rotate-180">▼</span>
                      </summary>
                      <p className="mt-2 text-muted-foreground text-sm pl-2">
                        You can book a slot by clicking "Book Your Slot" on the homepage, selecting a pump location, 
                        choosing a date and time, and confirming your booking. You'll receive an e-token instantly.
                      </p>
                    </details>
                    
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="font-medium">Can I cancel my booking?</span>
                        <span className="ml-4 transform group-open:rotate-180">▼</span>
                      </summary>
                      <p className="mt-2 text-muted-foreground text-sm pl-2">
                        Yes, you can cancel your booking up to 30 minutes before your scheduled time through 
                        the "My Bookings" section in your account.
                      </p>
                    </details>
                    
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <span className="font-medium">What payment methods do you accept?</span>
                        <span className="ml-4 transform group-open:rotate-180">▼</span>
                      </summary>
                      <p className="mt-2 text-muted-foreground text-sm pl-2">
                        We accept credit/debit cards, UPI, and digital wallets like Paytm, PhonePe, and Google Pay.
                      </p>
                    </details>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Fill out this form and we'll get back to you as soon as possible</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;