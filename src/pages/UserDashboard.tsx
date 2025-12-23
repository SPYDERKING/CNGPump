import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import {
  User,
  Calendar,
  Fuel,
  IndianRupee,
  TrendingUp,
  Car,
  Phone,
  Save,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
} from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_number: string | null;
}

interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalFuelBooked: number;
  totalSpent: number;
  monthlyData: { month: string; bookings: number; spent: number }[];
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { bookings } = useBookings();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    vehicle_number: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalFuelBooked: 0,
    totalSpent: 0,
    monthlyData: [],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            vehicle_number: data.vehicle_number || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Calculate stats from bookings
  useEffect(() => {
    if (bookings.length === 0) {
      setStats({
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalFuelBooked: 0,
        totalSpent: 0,
        monthlyData: [],
      });
      return;
    }

    const completed = bookings.filter(b => b.booking_status === 'completed').length;
    const cancelled = bookings.filter(b => b.booking_status === 'cancelled').length;
    const totalFuel = bookings.reduce((sum, b) => sum + (b.fuel_quantity || 0), 0);
    const totalAmount = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    // Group by month
    const monthlyMap = new Map<string, { bookings: number; spent: number }>();
    bookings.forEach(booking => {
      const month = format(new Date(booking.slot_date), 'MMM yyyy');
      const existing = monthlyMap.get(month) || { bookings: 0, spent: 0 };
      monthlyMap.set(month, {
        bookings: existing.bookings + 1,
        spent: existing.spent + (booking.amount || 0),
      });
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6);

    setStats({
      totalBookings: bookings.length,
      completedBookings: completed,
      cancelledBookings: cancelled,
      totalFuelBooked: totalFuel,
      totalSpent: totalAmount,
      monthlyData,
    });
  }, [bookings]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          vehicle_number: formData.vehicle_number,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setProfile(prev => prev ? { ...prev, ...formData } : null);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Confirmed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pieData = [
    { name: 'Completed', value: stats.completedBookings, color: 'hsl(var(--chart-2))' },
    { name: 'Cancelled', value: stats.cancelledBookings, color: 'hsl(var(--destructive))' },
    { name: 'Active', value: stats.totalBookings - stats.completedBookings - stats.cancelledBookings, color: 'hsl(var(--primary))' },
  ].filter(d => d.value > 0);

  const chartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
    spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              My Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your profile and view booking statistics</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Total Bookings</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Fuel className="h-4 w-4" />
                    <span className="text-xs">Fuel Booked</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalFuelBooked} kg</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-xs">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.monthlyData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <BarChart data={stats.monthlyData}>
                        <XAxis dataKey="month" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No booking data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No booking data yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your last 5 bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 5).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{format(new Date(booking.slot_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{booking.slot_time.substring(0, 5)}</TableCell>
                        <TableCell>{(booking as any).pump?.name || 'N/A'}</TableCell>
                        <TableCell>{booking.fuel_quantity} kg</TableCell>
                        <TableCell>₹{booking.amount}</TableCell>
                        <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                      </TableRow>
                    ))}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No bookings yet. <Button variant="link" onClick={() => navigate('/#pumps')}>Book your first slot!</Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Complete history of your CNG slot bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{format(new Date(booking.slot_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{booking.slot_time.substring(0, 5)}</TableCell>
                          <TableCell>{(booking as any).pump?.name || 'N/A'}</TableCell>
                          <TableCell>{booking.fuel_quantity} kg</TableCell>
                          <TableCell>₹{booking.amount}</TableCell>
                          <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                        </TableRow>
                      ))}
                      {bookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No bookings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Email
                    </label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicle Number
                    </label>
                    <Input
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., MH12AB1234"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          vehicle_number: profile?.vehicle_number || '',
                        });
                      }}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;