import { MapPin, Clock, Fuel, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PumpCardProps {
  name: string;
  address: string;
  distance: string;
  capacity: number;
  remainingCapacity: number;
  waitTime: string;
  queueLength: number;
  rating: number;
  isOpen: boolean;
  onBookSlot?: () => void;
}

const PumpCard = ({
  name,
  address,
  distance,
  capacity,
  remainingCapacity,
  waitTime,
  queueLength,
  rating,
  isOpen,
  onBookSlot
}: PumpCardProps) => {
  const capacityPercentage = (remainingCapacity / capacity) * 100;
  
  const getCapacityColor = () => {
    if (capacityPercentage > 50) return "bg-success";
    if (capacityPercentage > 20) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-lg text-card-foreground">
              {name}
            </h3>
            {isOpen ? (
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                Open
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                Closed
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {address}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="font-semibold text-sm text-accent">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            Fuel Available
          </span>
          <span className="font-semibold text-card-foreground">
            {remainingCapacity} / {capacity} kg
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${getCapacityColor()}`}
            style={{ width: `${capacityPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">Distance</div>
          <div className="font-display font-semibold text-card-foreground">{distance}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Wait
          </div>
          <div className="font-display font-semibold text-card-foreground">{waitTime}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Users className="w-3 h-3" />
            Queue
          </div>
          <div className="font-display font-semibold text-card-foreground">{queueLength}</div>
        </div>
      </div>

      <Button 
        variant="hero" 
        className="w-full"
        disabled={!isOpen || capacityPercentage < 5}
        onClick={onBookSlot}
      >
        {isOpen && capacityPercentage >= 5 ? "Book Slot" : "Unavailable"}
      </Button>
    </div>
  );
};

export default PumpCard;
