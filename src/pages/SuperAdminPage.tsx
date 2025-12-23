import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePumps } from '@/hooks/usePumps';
import { useSuperAdminStats } from '@/hooks/useSuperAdminStats';
import { supabase } from '@/integrations/supabase/client';
import { API_CONFIG } from '@/lib/apiConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  Fuel,
  Plus,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  IndianRupee,
  Building,
  RefreshCw,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Pencil,
} from 'lucide-react';

import { Pump } from '@/hooks/usePumps';

interface PumpAdmin {
  id: string;
  user_id: string;
  pump_id: string;
  created_at: string;
  user_email?: string;
  pump_name?: string;
}

interface NewPumpForm {
  name: string;
  address: string;
  city: string;
  total_capacity: number;
  walkin_lanes: number;
  booked_lanes: number;
  latitude: string;
  longitude: string;
}

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useAdminAuth();
  const { pumps, refetch: refetchPumps } = usePumps();
  const { stats, loading: statsLoading, refetch: refetchStats } = useSuperAdminStats();

  const [pumpAdmins, setPumpAdmins] = useState<PumpAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddPumpDialogOpen, setIsAddPumpDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedPumpId, setSelectedPumpId] = useState<string>('');
  const [newPumpForm, setNewPumpForm] = useState<NewPumpForm>({
    name: '',
    address: '',
    city: '',
    total_capacity: 1000,
    walkin_lanes: 2,
    booked_lanes: 2,
    latitude: '',
    longitude: '',
  });
  const [isCreatingPump, setIsCreatingPump] = useState(false);
  const [isEditPumpDialogOpen, setIsEditPumpDialogOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<Pump | null>(null);
  const [editPumpForm, setEditPumpForm] = useState<NewPumpForm>({
    name: '',
    address: '',
    city: '',
    total_capacity: 1000,
    walkin_lanes: 2,
    booked_lanes: 2,
    latitude: '',
    longitude: '',
  });
  const [matchingUsers, setMatchingUsers] = useState<Array<{user_id: string, full_name: string}>>([]);
  const [showUserSelection, setShowUserSelection] = useState(false);
  
  const selectUserForAdmin = async (userId: string, userName: string) => {
    try {
      // Use backend API to assign the role
      const token = session?.access_token;
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setShowUserSelection(false);
        setMatchingUsers([]);
        return;
      }
      
      try {
        const response = await fetch(API_CONFIG.ENDPOINTS.USERS.ASSIGN_ROLE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            role: 'pump_admin'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.detail && errorData.detail.includes('already has this role')) {
            toast.error('This user is already a general admin');
          } else {
            throw new Error(errorData.detail || 'Failed to assign role');
          }
          setShowUserSelection(false);
          setMatchingUsers([]);
          return;
        }
        
        toast.success(`User ${userName} assigned as general admin successfully`);
        setNewAdminEmail('');
        setShowUserSelection(false);
        setMatchingUsers([]);
      } catch (error) {
        if (error instanceof Error && error.message.includes('already has this role')) {
          toast.error('This user is already a general admin');
        } else {
          throw error;
        }
        setShowUserSelection(false);
        setMatchingUsers([]);
      }
    } catch (error) {
      console.error('Error assigning general admin:', error);
      if (error instanceof Error) {
        toast.error(`Failed to assign admin authority: ${error.message}`);
      } else {
        toast.error('Failed to assign admin authority');
      }
      setShowUserSelection(false);
      setMatchingUsers([]);
    }
  };
  const [isUpdatingPump, setIsUpdatingPump] = useState(false);

  // Redirect if not super admin
  useEffect(() => {
    if (!authLoading && !roleLoading && !isSuperAdmin) {
      navigate('/');
    }
  }, [authLoading, roleLoading, isSuperAdmin, navigate]);

  // Fetch pump admins
  useEffect(() => {
    const fetchPumpAdmins = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pump_admins')
          .select(`
            *,
            pumps(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const userIds = [...new Set((data || []).map(pa => pa.user_id))];
        
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          const profileMap = new Map(
            (profilesData || []).map(p => [p.user_id, p])
          );

          const enrichedAdmins = (data || []).map(pa => ({
            ...pa,
            pump_name: (pa.pumps as any)?.name,
            user_email: profileMap.get(pa.user_id)?.full_name || 'Unknown User',
          }));

          setPumpAdmins(enrichedAdmins);
        } else {
          setPumpAdmins([]);
        }
      } catch (error) {
        console.error('Error fetching pump admins:', error);
        toast.error('Failed to fetch pump admins');
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchPumpAdmins();
    }
  }, [isSuperAdmin]);

  const addPumpAdmin = async () => {
    if (!newAdminEmail.trim() || !selectedPumpId) {
      toast.error('Please enter user name and select a pump');
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('full_name', `%${newAdminEmail}%`)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error('User not found. Make sure they have signed up.');
        return;
      }

      const userId = profileData.user_id;

      await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'pump_admin' }, { onConflict: 'user_id,role' });

      const { error: assignError } = await supabase
        .from('pump_admins')
        .insert({ user_id: userId, pump_id: selectedPumpId });

      if (assignError) {
        if (assignError.code === '23505') {
          toast.error('This user is already an admin for this pump');
        } else {
          throw assignError;
        }
        return;
      }

      toast.success('Pump admin added successfully');
      setIsAddDialogOpen(false);
      setNewAdminEmail('');
      setSelectedPumpId('');
      window.location.reload();
    } catch (error) {
      console.error('Error adding pump admin:', error);
      toast.error('Failed to add pump admin');
    }
  };

  const removePumpAdmin = async (adminId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('pump_admins')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      const { data: remainingAssignments } = await supabase
        .from('pump_admins')
        .select('id')
        .eq('user_id', userId);

      if (!remainingAssignments || remainingAssignments.length === 0) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'pump_admin');
      }

      setPumpAdmins(prev => prev.filter(pa => pa.id !== adminId));
      toast.success('Pump admin removed');
    } catch (error) {
      console.error('Error removing pump admin:', error);
      toast.error('Failed to remove pump admin');
    }
  };

  const togglePumpStatus = async (pumpId: string, isOpen: boolean) => {
    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.PUMPS.BASE}/${pumpId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_open: !isOpen,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update pump status');
      }
      
      const result = await response.json();
      
      toast.success(`Pump ${isOpen ? 'closed' : 'opened'} successfully`);
      refetchPumps();
    } catch (error) {
      console.error('Error toggling pump status:', error);
      toast.error('Failed to update pump status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const createPump = async () => {
    if (!newPumpForm.name.trim() || !newPumpForm.address.trim() || !newPumpForm.city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreatingPump(true);
      
      // Send pump data to backend API instead of Supabase directly
      const response = await fetch(API_CONFIG.ENDPOINTS.PUMPS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPumpForm.name.trim(),
          address: newPumpForm.address.trim(),
          city: newPumpForm.city.trim(),
          total_capacity: newPumpForm.total_capacity,
          remaining_capacity: newPumpForm.total_capacity, // Initially same as total capacity
          walkin_lanes: newPumpForm.walkin_lanes,
          booked_lanes: newPumpForm.booked_lanes,
          latitude: newPumpForm.latitude ? parseFloat(newPumpForm.latitude) : null,
          longitude: newPumpForm.longitude ? parseFloat(newPumpForm.longitude) : null,
          rating: 4.0, // Default rating
          is_open: true, // Default to open
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create pump');
      }
      
      const result = await response.json();
      
      toast.success('CNG Pump created successfully');
      setIsAddPumpDialogOpen(false);
      setNewPumpForm({
        name: '',
        address: '',
        city: '',
        total_capacity: 1000,
        walkin_lanes: 2,
        booked_lanes: 2,
        latitude: '',
        longitude: '',
      });
      refetchPumps();
      refetchStats();
    } catch (error) {
      console.error('Error creating pump:', error);
      toast.error('Failed to create pump: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreatingPump(false);
    }
  };

  const deletePump = async (pumpId: string) => {
    if (!confirm('Are you sure you want to delete this pump? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.ENDPOINTS.PUMPS.BASE}/${pumpId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete pump');
      }
      
      toast.success('Pump deleted successfully');
      refetchPumps();
      refetchStats();
    } catch (error) {
      console.error('Error deleting pump:', error);
      toast.error('Failed to delete pump. Make sure there are no active bookings.');
    }
  };

  const openEditPumpDialog = (pump: Pump) => {
    setEditingPump(pump);
    setEditPumpForm({
      name: pump.name,
      address: pump.address,
      city: pump.city,
      total_capacity: pump.total_capacity,
      walkin_lanes: pump.walkin_lanes,
      booked_lanes: pump.booked_lanes,
      latitude: pump.latitude?.toString() || '',
      longitude: pump.longitude?.toString() || '',
    });
    setIsEditPumpDialogOpen(true);
  };

  const updatePump = async () => {
    if (!editingPump) return;
    
    if (!editPumpForm.name.trim() || !editPumpForm.address.trim() || !editPumpForm.city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsUpdatingPump(true);
      const response = await fetch(`${API_CONFIG.ENDPOINTS.PUMPS.BASE}/${editingPump.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editPumpForm.name.trim(),
          address: editPumpForm.address.trim(),
          city: editPumpForm.city.trim(),
          total_capacity: editPumpForm.total_capacity,
          remaining_capacity: editPumpForm.total_capacity, // Update remaining capacity if needed
          walkin_lanes: editPumpForm.walkin_lanes,
          booked_lanes: editPumpForm.booked_lanes,
          latitude: editPumpForm.latitude ? parseFloat(editPumpForm.latitude) : null,
          longitude: editPumpForm.longitude ? parseFloat(editPumpForm.longitude) : null,
          rating: editingPump.rating, // Keep existing rating
          is_open: editingPump.is_open, // Keep existing status
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update pump');
      }
      
      const result = await response.json();
      
      toast.success('Pump updated successfully');
      setIsEditPumpDialogOpen(false);
      setEditingPump(null);
      refetchPumps();
    } catch (error) {
      console.error('Error updating pump:', error);
      toast.error('Failed to update pump: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdatingPump(false);
    }
  };

  const assignGeneralAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Please enter user email or name');
      return;
    }

    try {
      // Search for users using the backend API
      const token = session?.access_token;
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${API_CONFIG.ENDPOINTS.USERS.SEARCH}?query=${encodeURIComponent(newAdminEmail.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to search users');
      }
      
      const userData = await response.json();
      
      if (!userData || userData.length === 0) {
        toast.error('No users found matching your search. Make sure the user has signed up.');
        return;
      }
      
      // If we have exactly one match, assign the role directly
      if (userData.length === 1) {
        const user = userData[0];
        
        try {
          // Use backend API to assign the role
          const response = await fetch(API_CONFIG.ENDPOINTS.USERS.ASSIGN_ROLE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: user.id,
              role: 'pump_admin'
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to assign role');
          }
          
          toast.success(`User ${user.full_name || user.email} assigned as general admin successfully`);
          setNewAdminEmail('');
        } catch (error) {
          if (error instanceof Error && error.message.includes('already has this role')) {
            toast.error('This user is already a general admin');
          } else {
            throw error;
          }
        }
      } else {
        // If multiple matches found, show selection UI
        // Map the backend user data to the format expected by the UI
        const formattedUsers = userData.map(user => ({
          user_id: user.id,
          full_name: user.full_name || user.email || 'Unknown User',
        }));
        
        setMatchingUsers(formattedUsers);
        setShowUserSelection(true);
      }
    } catch (error) {
      console.error('Error assigning general admin:', error);
      if (error instanceof Error) {
        toast.error(`Failed to assign admin authority: ${error.message}`);
      } else {
        toast.error('Failed to assign admin authority');
      }
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const chartConfig = {
    bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/pump-admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Super Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={refetchStats}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Users className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="pumps">
              <Fuel className="h-4 w-4 mr-2" />
              Pumps
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Today's Bookings</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.todayBookings}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-xs">Today's Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{stats.todayRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Fuel className="h-4 w-4" />
                    <span className="text-xs">Active Pumps</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.activePumps}/{stats.totalPumps}</p>
                </CardContent>
              </Card>
            </div>

            {/* Total Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-3xl font-bold">{stats.totalBookings}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <IndianRupee className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pump Admins</p>
                    <p className="text-3xl font-bold">{pumpAdmins.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Bookings
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
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.monthlyData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <LineChart data={stats.monthlyData}>
                        <XAxis dataKey="month" fontSize={10} tickLine={false} />
                        <YAxis fontSize={10} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-6">
            {/* General Admin Management Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>General Admin Management</CardTitle>
                  <CardDescription>Assign general admin authority to users</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Assign Admin Authority</h3>
                  </div>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter user's email or name"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="max-w-md"
                    />
                    <Button onClick={assignGeneralAdmin}>
                      <Shield className="mr-2 h-4 w-4" />
                      Make Admin
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pump Admin Assignments Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pump Admin Assignments</CardTitle>
                  <CardDescription>Manage which users can administer each pump</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Pump Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Pump Admin</DialogTitle>
                      <DialogDescription>
                        Assign a user as an admin for a specific pump
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">User Name</label>
                        <Input
                          placeholder="Enter user's email or name"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the user's name as registered in their profile
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pump</label>
                        <Select value={selectedPumpId} onValueChange={setSelectedPumpId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pump" />
                          </SelectTrigger>
                          <SelectContent>
                            {pumps.map(pump => (
                              <SelectItem key={pump.id} value={pump.id}>
                                {pump.name} - {pump.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addPumpAdmin} className="w-full">
                        Add Admin
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Pump</TableHead>
                      <TableHead>Assigned On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pumpAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Admin</Badge>
                            {admin.user_email}
                          </div>
                        </TableCell>
                        <TableCell>{admin.pump_name}</TableCell>
                        <TableCell>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePumpAdmin(admin.id, admin.user_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pumpAdmins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No pump admins assigned yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pumps Tab */}
          <TabsContent value="pumps" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    All Pumps
                  </CardTitle>
                  <CardDescription>Manage CNG stations</CardDescription>
                </div>
                <Dialog open={isAddPumpDialogOpen} onOpenChange={setIsAddPumpDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Pump
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New CNG Pump</DialogTitle>
                      <DialogDescription>
                        Add a new CNG station to the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pump Name *</label>
                        <Input
                          placeholder="Enter pump name"
                          value={newPumpForm.name}
                          onChange={(e) => setNewPumpForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Address *</label>
                        <Input
                          placeholder="Enter full address"
                          value={newPumpForm.address}
                          onChange={(e) => setNewPumpForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City *</label>
                        <Input
                          placeholder="Enter city"
                          value={newPumpForm.city}
                          onChange={(e) => setNewPumpForm(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Total Capacity (L)</label>
                          <Input
                            type="number"
                            placeholder="1000"
                            value={newPumpForm.total_capacity}
                            onChange={(e) => setNewPumpForm(prev => ({ ...prev, total_capacity: parseInt(e.target.value) || 1000 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Walk-in Lanes</label>
                          <Input
                            type="number"
                            placeholder="2"
                            value={newPumpForm.walkin_lanes}
                            onChange={(e) => setNewPumpForm(prev => ({ ...prev, walkin_lanes: parseInt(e.target.value) || 2 }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Booked Lanes</label>
                        <Input
                          type="number"
                          placeholder="2"
                          value={newPumpForm.booked_lanes}
                          onChange={(e) => setNewPumpForm(prev => ({ ...prev, booked_lanes: parseInt(e.target.value) || 2 }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Latitude (optional)</label>
                          <Input
                            placeholder="e.g., 28.6139"
                            value={newPumpForm.latitude}
                            onChange={(e) => setNewPumpForm(prev => ({ ...prev, latitude: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Longitude (optional)</label>
                          <Input
                            placeholder="e.g., 77.2090"
                            value={newPumpForm.longitude}
                            onChange={(e) => setNewPumpForm(prev => ({ ...prev, longitude: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button onClick={createPump} className="w-full" disabled={isCreatingPump}>
                        {isCreatingPump ? 'Creating...' : 'Create Pump'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pumps.map((pump) => (
                      <TableRow key={pump.id}>
                        <TableCell className="font-medium">{pump.name}</TableCell>
                        <TableCell>{pump.city}</TableCell>
                        <TableCell>
                          {pump.remaining_capacity}/{pump.total_capacity} L
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">⭐ {pump.rating}</Badge>
                        </TableCell>
                        <TableCell>
                          {pump.is_open ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Open
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Closed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditPumpDialog(pump)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePumpStatus(pump.id, pump.is_open)}
                          >
                            {pump.is_open ? 'Close' : 'Open'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePump(pump.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pumps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No pumps found. Click "Add New Pump" to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Pump Dialog */}
            <Dialog open={isEditPumpDialogOpen} onOpenChange={setIsEditPumpDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit CNG Pump</DialogTitle>
                  <DialogDescription>
                    Update pump details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pump Name *</label>
                    <Input
                      placeholder="Enter pump name"
                      value={editPumpForm.name}
                      onChange={(e) => setEditPumpForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <Input
                      placeholder="Enter full address"
                      value={editPumpForm.address}
                      onChange={(e) => setEditPumpForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      placeholder="Enter city"
                      value={editPumpForm.city}
                      onChange={(e) => setEditPumpForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total Capacity (L)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={editPumpForm.total_capacity}
                        onChange={(e) => setEditPumpForm(prev => ({ ...prev, total_capacity: parseInt(e.target.value) || 1000 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Walk-in Lanes</label>
                      <Input
                        type="number"
                        placeholder="2"
                        value={editPumpForm.walkin_lanes}
                        onChange={(e) => setEditPumpForm(prev => ({ ...prev, walkin_lanes: parseInt(e.target.value) || 2 }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Booked Lanes</label>
                    <Input
                      type="number"
                      placeholder="2"
                      value={editPumpForm.booked_lanes}
                      onChange={(e) => setEditPumpForm(prev => ({ ...prev, booked_lanes: parseInt(e.target.value) || 2 }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Latitude (optional)</label>
                      <Input
                        placeholder="e.g., 28.6139"
                        value={editPumpForm.latitude}
                        onChange={(e) => setEditPumpForm(prev => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Longitude (optional)</label>
                      <Input
                        placeholder="e.g., 77.2090"
                        value={editPumpForm.longitude}
                        onChange={(e) => setEditPumpForm(prev => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={updatePump} className="w-full" disabled={isUpdatingPump}>
                    {isUpdatingPump ? 'Updating...' : 'Update Pump'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pump Performance
                </CardTitle>
                <CardDescription>Top performing CNG stations by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Pump Name</TableHead>
                      <TableHead>Total Bookings</TableHead>
                      <TableHead>Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.pumpPerformance.map((pump, index) => (
                      <TableRow key={pump.name}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'outline'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{pump.name}</TableCell>
                        <TableCell>{pump.bookings}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ₹{pump.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.pumpPerformance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No performance data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Pump</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.pumpPerformance.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={stats.pumpPerformance} layout="vertical">
                        <XAxis type="number" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Pump</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.pumpPerformance.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={stats.pumpPerformance} layout="vertical">
                        <XAxis type="number" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Selection Modal for Admin Assignment */}
      <Dialog open={showUserSelection} onOpenChange={setShowUserSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
            <DialogDescription>
              Multiple users found matching your search. Please select the correct user to assign admin privileges.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {matchingUsers.map((user) => (
                <div 
                  key={user.user_id} 
                  className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => selectUserForAdmin(user.user_id, user.full_name)}
                >
                  <span className="font-medium">{user.full_name}</span>
                  <span className="text-xs text-muted-foreground">{user.user_id.substring(0, 8)}...</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUserSelection(false);
                setMatchingUsers([]);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPage;
