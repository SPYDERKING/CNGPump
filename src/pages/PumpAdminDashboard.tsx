import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { usePumps } from '@/hooks/usePumps';
import { QrScanner } from '@/components/QrScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  CalendarDays,
  Fuel,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  IndianRupee,
  Settings,
  RefreshCw,
  Ban,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PumpAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isPumpAdmin, isSuperAdmin, adminPumps, loading: roleLoading } = useAdminAuth();
  const { pumps } = usePumps();
  
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedBooking, setVerifiedBooking] = useState<any>(null);
  const [showSlotSettings, setShowSlotSettings] = useState(false);
  const [walkinLanes, setWalkinLanes] = useState(2);
  const [bookedLanes, setBookedLanes] = useState(2);

  const { bookings, stats, hourlyData, loading, verifyToken, updateSlots, cancelBooking, refetch } = useAdminDashboard(selectedPumpId);

  // Set initial pump
  useEffect(() => {
    if (isSuperAdmin && pumps.length > 0 && !selectedPumpId) {
      setSelectedPumpId(pumps[0].id);
    } else if (isPumpAdmin && adminPumps.length > 0 && !selectedPumpId) {
      setSelectedPumpId(adminPumps[0].pump_id);
    }
  }, [isSuperAdmin, isPumpAdmin, pumps, adminPumps, selectedPumpId]);

  // Fetch pump slot settings
  useEffect(() => {
    if (selectedPumpId) {
      const pump = pumps.find(p => p.id === selectedPumpId);
      if (pump) {
        setWalkinLanes(pump.walkin_lanes);
        setBookedLanes(pump.booked_lanes);
      }
    }
  }, [selectedPumpId, pumps]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !roleLoading && user && !isAdmin) {
      // Show error and redirect to home
      toast.error('Access denied. You need administrator privileges to access this page.');
      navigate('/');
    } else if (!authLoading && !roleLoading && !user) {
      // Not logged in, redirect to auth page
      toast.info('Please log in to access the admin dashboard.');
      navigate('/auth');
    }
  }, [authLoading, roleLoading, isAdmin, user, navigate]);

  const handleScan = async (data: string) => {
    setIsProcessing(true);
    setVerifiedBooking(null);

    // Extract token code from QR data
    let tokenCode = data;
    try {
      const parsed = JSON.parse(data);
      tokenCode = parsed.tokenCode || data;
    } catch {
      // If not JSON, use as-is
    }

    const result = await verifyToken(tokenCode);
    if (result) {
      setVerifiedBooking(result);
    }
    setIsProcessing(false);
  };

  const handleSaveSlots = async () => {
    await updateSlots(walkinLanes, bookedLanes);
    setShowSlotSettings(false);
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const availablePumps = isSuperAdmin ? pumps : adminPumps.map(ap => ({
    id: ap.pump_id,
    name: ap.pump_name,
  }));

  const chartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
    scanned: { label: 'Scanned', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Pump Admin Dashboard</h1>
            <Select value={selectedPumpId || ''} onValueChange={setSelectedPumpId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Pump" />
              </SelectTrigger>
              <SelectContent>
                {availablePumps.map(pump => (
                  <SelectItem key={pump.id} value={pump.id}>
                    {pump.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isSuperAdmin && (
              <Button variant="outline" onClick={() => navigate('/super-admin')}>
                Super Admin
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Today's Bookings</span>
              </div>
              <p className="text-2xl font-bold">{stats.todayBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">Tokens Scanned</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.tokensScanned}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTokens}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Fuel className="h-4 w-4" />
                <span className="text-xs">Capacity Used</span>
              </div>
              <p className="text-2xl font-bold">{stats.capacityUsed}L</p>
              <p className="text-xs text-muted-foreground">of {stats.totalCapacity}L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <IndianRupee className="h-4 w-4" />
                <span className="text-xs">Today's Revenue</span>
              </div>
              <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setShowSlotSettings(!showSlotSettings)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Slot Settings</span>
              </div>
              <p className="text-sm">
                Walk-in: {walkinLanes} | Booked: {bookedLanes}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Slot Settings Panel */}
        {showSlotSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Slots</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Walk-in Lanes</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={walkinLanes}
                  onChange={(e) => setWalkinLanes(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Booked Lanes</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={bookedLanes}
                  onChange={(e) => setBookedLanes(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button onClick={handleSaveSlots}>Save Changes</Button>
              <Button variant="ghost" onClick={() => setShowSlotSettings(false)}>Cancel</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* QR Scanner */}
          <div className="lg:col-span-1 space-y-4">
            <QrScanner onScan={handleScan} isProcessing={isProcessing} />

            {/* Verified Booking Card */}
            {verifiedBooking && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Token Verified!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Token:</strong> {verifiedBooking.token?.token_code}</p>
                  <p><strong>Customer:</strong> {verifiedBooking.profile?.full_name || 'N/A'}</p>
                  <p><strong>Vehicle:</strong> {verifiedBooking.profile?.vehicle_number || 'N/A'}</p>
                  <p><strong>Quantity:</strong> {verifiedBooking.fuel_quantity} kg</p>
                  <p><strong>Amount:</strong> ₹{verifiedBooking.amount}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Hourly Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                    <Bar dataKey="scanned" fill="var(--color-scanned)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Live Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Today's Queue
                  <Badge variant="outline" className="ml-auto">
                    {bookings.filter(b => b.token?.status === 'valid').length} in queue
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm">
                            {booking.token?.token_code || 'N/A'}
                          </TableCell>
                          <TableCell>{booking.slot_time.substring(0, 5)}</TableCell>
                          <TableCell>{booking.profile?.full_name || 'N/A'}</TableCell>
                          <TableCell>{booking.fuel_quantity} kg</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.token?.status === 'used'
                                  ? 'default'
                                  : booking.token?.status === 'expired'
                                  ? 'destructive'
                                  : booking.booking_status === 'cancelled'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {booking.booking_status === 'cancelled' ? 'cancelled' : (booking.token?.status || 'pending')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {booking.booking_status !== 'cancelled' && 
                             booking.token?.status === 'valid' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelBooking(booking.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {bookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No bookings for today
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PumpAdminDashboard;
