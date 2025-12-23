import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, Wallet, ArrowUpDown, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock payment data - in a real app, this would come from an API
  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const mockPayments = [
          {
            id: 1,
            date: "2024-01-15T14:30:00Z",
            amount: 450,
            method: "Credit Card",
            status: "completed",
            bookingId: "BK-2024-001",
            pumpName: "Green Energy CNG Station"
          },
          {
            id: 2,
            date: "2024-01-10T11:15:00Z",
            amount: 320,
            method: "UPI",
            status: "completed",
            bookingId: "BK-2024-002",
            pumpName: "City CNG Hub"
          },
          {
            id: 3,
            date: "2024-01-05T09:45:00Z",
            amount: 580,
            method: "Wallet",
            status: "refunded",
            bookingId: "BK-2024-003",
            pumpName: "Express CNG Point"
          },
          {
            id: 4,
            date: "2023-12-28T16:20:00Z",
            amount: 410,
            method: "Credit Card",
            status: "completed",
            bookingId: "BK-2023-045",
            pumpName: "Green Energy CNG Station"
          }
        ];
        setPayments(mockPayments);
      }, 500);
    }
  }, [user]);

  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <CreditCard className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // In a real app, this would export the payment history
    alert("Payment history exported successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Payment History</h1>
              <p className="text-muted-foreground mt-1">
                View and manage your payment transactions
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    All your payment transactions for CNG bookings
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort by Date
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sortedPayments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No payment history</h3>
                  <p className="text-muted-foreground text-sm">
                    Your payment transactions will appear here once you make bookings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date & Time</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Booking ID</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pump</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-foreground">
                              {formatDate(payment.date)}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-mono text-foreground">
                              {payment.bookingId}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm text-foreground">
                              {payment.pumpName}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="text-sm font-medium text-foreground">
                              ₹{payment.amount}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm text-foreground">{payment.method}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  ₹{payments.reduce((sum, payment) => sum + (payment.status === 'completed' ? payment.amount : 0), 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {payments.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total payments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Favorite Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  Credit Card
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Used in 60% of transactions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentHistory;