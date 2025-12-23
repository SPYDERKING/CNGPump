import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, QrCode, CheckCircle, XCircle, AlertCircle, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useApiBookings } from "@/hooks/useApiBookings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const { getUserBookings, updateConfirmationStatus, deleteBooking, cancelBooking, loading } = useApiBookings();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    console.log('MyBookings useEffect triggered', { authLoading, user });
    if (!authLoading && !user) {
      console.log('No user, redirecting to auth');
      navigate("/auth");
    } else if (user) {
      console.log('User found, fetching bookings');
      fetchUserBookings();
      
      // Set up periodic cleanup of old bookings
      const cleanupInterval = setInterval(() => {
        try {
          cleanupOldBookings();
        } catch (error) {
          console.error('Error in cleanupOldBookings:', error);
        }
      }, 300000); // Run every 5 minutes
      
      return () => {
        if (cleanupInterval) {
          clearInterval(cleanupInterval);
        }
      };
    } else {
      console.log('Still loading auth');
    }
  }, [user, authLoading, navigate]);

  const fetchUserBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      console.log('Fetching bookings for user:', user);
      // Pass user.id as string since our backend expects UUID strings
      const userId = user.id;
      console.log('User ID:', userId);
      const { error, data } = await getUserBookings(userId);
      console.log('Booking fetch result:', { error, data });
      if (error) {
        console.error('Error in getUserBookings:', error);
        setBookingsError(error.message);
      } else {
        setBookings(data || []);
        console.log('Set bookings:', data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookingsError('Failed to fetch bookings');
    } finally {
      console.log('Finished fetching bookings, setting loading to false');
      setBookingsLoading(false);
    }
  };

  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium">Cancelled</span>;
      case 'expired':
        return <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">Expired</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">Active</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleCancelClick = (bookingId: string) => {
    setCancellingId(bookingId);
    setIsConfirmOpen(true);
  };

  const handleConfirmComing = async (bookingId: string) => {
    // Pass booking ID as string since our backend expects UUID strings
    const id = bookingId;
    const { error } = await updateConfirmationStatus(id, 'coming');
    if (error) {
      toast.error('Failed to update confirmation: ' + error.message);
    } else {
      toast.success('Confirmation updated successfully');
      // Refresh bookings
      fetchUserBookings();
    }
  };

  const handleShowQrCode = (booking: any) => {
    setSelectedBooking(booking);
    setIsQrModalOpen(true);
  };

  const handleConfirmNotComing = async (bookingId: string) => {
    try {
      // Pass booking ID as string since our backend expects UUID strings
      const id = bookingId;
      console.log(`Calling updateConfirmationStatus for booking ${id} with status 'not_coming'`);
      const { error } = await updateConfirmationStatus(id, 'not_coming');
      if (error) {
        console.error('Failed to update confirmation:', error);
        toast.error('Failed to update confirmation: ' + error.message);
      } else {
        toast.success('Confirmation updated successfully');
        // Refresh bookings
        console.log('Refreshing bookings after confirmation update');
        fetchUserBookings();
      }
    } catch (error) {
      console.error('Unexpected error in handleConfirmNotComing:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;
    // Pass booking ID as string since our backend expects UUID strings
    const bookingId = cancellingId;
    const { error } = await cancelBooking(bookingId);
    if (error) {
      toast.error('Failed to cancel booking: ' + error.message);
    } else {
      toast.success('Booking cancelled successfully');
      // Refresh bookings
      fetchUserBookings();
    }
    setIsConfirmOpen(false);
    setCancellingId(null);
  };

  const handleDeleteClick = (bookingId: string) => {
    setDeletingId(bookingId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    // Pass booking ID as string since our backend expects UUID strings
    const bookingId = deletingId;
    const { error } = await deleteBooking(bookingId);
    if (error) {
      toast.error('Failed to delete booking: ' + error.message);
    } else {
      toast.success('Booking deleted successfully');
      // Refresh bookings
      fetchUserBookings();
    }
    setIsDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const cleanupOldBookings = () => {
    // Filter out old canceled or completed bookings
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Remove bookings older than 30 days
    
    setBookings(prevBookings => 
      prevBookings.filter(booking => {
        try {
          // Keep bookings that are not canceled or completed, or are recent
          const bookingDate = new Date(booking.slot_date);
          const isRecent = bookingDate >= cutoffDate;
          const isActive = booking.booking_status !== 'cancelled' && booking.booking_status !== 'completed';
          return isActive || isRecent;
        } catch (error) {
          // If there's an error parsing the date, keep the booking to be safe
          console.warn('Error parsing booking date, keeping booking:', booking);
          return true;
        }
      })
    );
  };

  const canCancelBooking = (booking: typeof bookings[0]) => {
    return booking.booking_status === 'active' || booking.booking_status === 'confirmed';
  };

  console.log('Rendering MyBookings', { bookings, bookingsError, bookingsLoading });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage your CNG slot bookings</p>
        </div>

        {bookingsError ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-muted-foreground mb-6">
              {bookingsError}
            </p>
            <Button variant="hero" onClick={fetchUserBookings}>
              Retry
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No bookings yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Book your first CNG slot and skip the queue!
            </p>
            <Button variant="hero" onClick={() => navigate("/#pumps")}>
              Find a Pump
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Token QR */}
                  {booking.token && booking.booking_status !== 'cancelled' && (
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-card border border-border">
                        <img 
                          src={booking.token.qr_data} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center mt-2">
                        <span className="font-display font-bold text-primary text-sm">
                          {booking.token.token_code}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-card-foreground">
                          {booking.pump?.name || 'CNG Station'}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {booking.pump?.address}, {booking.pump?.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.booking_status)}
                        {booking.token && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-auto text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleShowQrCode(booking)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(booking.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Date</div>
                          <div className="font-medium text-card-foreground">
                            {formatDate(booking.slot_date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Time Slot</div>
                          <div className="font-medium text-card-foreground">
                            {formatTime(booking.slot_time)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <QrCode className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Amount</div>
                          <div className="font-medium text-card-foreground">
                            ₹{parseFloat(booking.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confirmation Actions */}
                    {booking.booking_status === 'confirmed' && 
                     booking.confirmation_status === 'pending' && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/30">
                        <AlertCircle className="w-5 h-5 text-accent" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-card-foreground">
                            Confirm your arrival
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Let us know if you'll be coming for your slot
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleConfirmComing(booking.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Coming
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmNotComing(booking.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {booking.confirmation_status === 'coming' && booking.booking_status !== 'cancelled' && (
                      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          You confirmed you're coming. See you there!
                        </div>
                        {canCancelBooking(booking) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(booking.id)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                    {booking.confirmation_status === 'not_coming' && booking.booking_status !== 'cancelled' && (
                      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          You indicated you won't be coming.
                        </div>
                      </div>
                    )}

                    {/* Cancel button for active/confirmed bookings without confirmation prompt */}
                    {canCancelBooking(booking) && 
                     booking.confirmation_status !== 'coming' && 
                     booking.confirmation_status !== 'pending' && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelClick(booking.id)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone and your slot will be released.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancellingId(null)}>
                Keep Booking
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Booking Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this booking? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Delete Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* QR Code Modal */}
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Your Booking QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code at the CNG pump to confirm your booking.
              </DialogDescription>
            </DialogHeader>
            {selectedBooking?.token && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg">
                  <img 
                    src={selectedBooking.token.qr_data} 
                    alt="Booking QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-2xl text-primary">
                    {selectedBooking.token.token_code}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Booking for {formatDate(selectedBooking.slot_date)} at {formatTime(selectedBooking.slot_time)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-center pt-2">
              <Button onClick={() => setIsQrModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
