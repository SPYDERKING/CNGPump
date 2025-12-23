import { useNavigate } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const { loading } = useAdminAccess();
  
  // Sample data for the chart
  const data = [
    { name: 'Mon', bookings: 45, revenue: 2400 },
    { name: 'Tue', bookings: 52, revenue: 2800 },
    { name: 'Wed', bookings: 48, revenue: 2600 },
    { name: 'Thu', bookings: 60, revenue: 3200 },
    { name: 'Fri', bookings: 75, revenue: 4000 },
    { name: 'Sat', bookings: 85, revenue: 4500 },
    { name: 'Sun', bookings: 65, revenue: 3500 },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your pump performance and customer metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹64,200</div>
              <p className="text-xs text-muted-foreground">+8% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 min</div>
              <p className="text-xs text-muted-foreground">-3 min from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs text-muted-foreground">+0.2 from last week</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>7:00 AM - 9:00 AM</span>
                  <span className="font-medium">120 bookings</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>5:00 PM - 7:00 PM</span>
                  <span className="font-medium">110 bookings</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>12:00 PM - 2:00 PM</span>
                  <span className="font-medium">85 bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Sedan Cars</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SUVs</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Commercial Vehicles</span>
                  <span className="font-medium">22%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;