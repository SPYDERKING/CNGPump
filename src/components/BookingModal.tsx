import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Clock, Fuel, CreditCard, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useApiBookings } from "@/hooks/useApiBookings";
import { toast } from "@/hooks/use-toast";
import type { Pump } from "@/hooks/usePumps";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pump: Pump | null;
}

type BookingStep = "details" | "confirmation";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const PRICE_PER_KG = 85;

const BookingModal = ({ isOpen, onClose, pump }: BookingModalProps) => {
  const [step, setStep] = useState<BookingStep>("details");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [fuelQuantity, setFuelQuantity] = useState("10");
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<{ token_code: string; qr_data: string } | null>(null);

  const { user } = useAuth();
  const { createBooking } = useApiBookings();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const amount = parseFloat(fuelQuantity || "0") * PRICE_PER_KG;

  const handleContinue = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to book a slot",
        variant: "destructive"
      });
      onClose();
      navigate("/auth");
      return;
    }
    
    if (!pump) return;
    
    setLoading(true);
    // Convert pump.id to number since our backend expects integer IDs
    const pumpId = pump.id;
    const userId = user.id;
    
    const { error, data } = await createBooking(userId, {
      pump_id: pumpId,
      slot_date: selectedDate,
      slot_time: selectedTime,
      fuel_quantity: parseFloat(fuelQuantity),
      amount
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive"
      });
    } else if (data?.token) {
      setTokenData({
        token_code: data.token.token_code,
        qr_data: data.token.qr_data
      });
      setStep("confirmation");
      toast({
        title: "Booking Confirmed!",
        description: "Your e-token has been generated. Payment is temporarily disabled."
      });
    }
  };

  const handleBack = () => {
    // No back step needed since we're skipping payment
  };

  const handleClose = () => {
    setStep("details");
    setSelectedDate("");
    setSelectedTime("");
    setFuelQuantity("10");
    setTokenData(null);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case "details":
        return (
          <div className="space-y-6">
            {pump && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="font-display font-semibold text-card-foreground">
                  {pump.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {pump.address}, {pump.city}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Select Date
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Select Time Slot
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Fuel Quantity (kg)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={fuelQuantity}
                  onChange={(e) => setFuelQuantity(e.target.value)}
                  className="h-12 flex-1"
                  min="1"
                  max="50"
                />
                <div className="text-sm text-muted-foreground">
                  Est. ₹{amount.toFixed(2)}
                </div>
              </div>
            </div>

            {!user && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-accent text-sm">
                <AlertCircle className="w-4 h-4" />
                You need to login to complete your booking
              </div>
            )}
          </div>
        );



      case "confirmation":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-muted-foreground">
                Your e-token has been generated successfully
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/50">
              {tokenData && (
                <>
                  <div className="w-40 h-40 rounded-xl overflow-hidden mx-auto mb-4 bg-card">
                    <img 
                      src={tokenData.qr_data} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="font-display text-xl font-bold text-primary">
                    {tokenData.token_code}
                  </div>
                </>
              )}
              <div className="text-sm text-muted-foreground mt-2">
                Valid for {selectedDate} at {selectedTime}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/10 text-accent text-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              Token expires 20 minutes after your slot time
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-3">
            {step === "details" && <Calendar className="w-6 h-6 text-primary" />}
            {step === "confirmation" && <QrCode className="w-6 h-6 text-primary" />}
            <h2 className="font-display text-xl font-bold text-card-foreground">
              {step === "details" && "Book Your Slot"}
              {step === "confirmation" && "E-Token"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        {step !== "confirmation" && (
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              <div className={`flex-1 h-1 rounded-full ${step === "details" ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
          {step !== "confirmation" ? (
            <Button 
              variant="hero" 
              onClick={handleContinue} 
              className="flex-1"
              disabled={step === "details" && (!selectedDate || !selectedTime) || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Book Slot & Generate E-Token"
              )}
            </Button>
          ) : (
            <Button variant="hero" onClick={handleClose} className="flex-1">
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
