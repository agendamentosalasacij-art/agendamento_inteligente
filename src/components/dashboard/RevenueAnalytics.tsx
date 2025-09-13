import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface RevenueData {
  total_revenue: number;
  total_bookings: number;
  avg_booking_value: number;
  monthly_data: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export const RevenueAnalytics = () => {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate, endDate;

      if (period === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
      }

      // Fetch revenue data
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_amount, created_at, payment_status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("payment_status", "paid");

      if (bookingsError) throw bookingsError;

      // Calculate totals
      const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;
      const totalBookings = bookings?.length || 0;
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Calculate monthly data for year view
      const monthlyData = [];
      if (period === "year") {
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(now.getFullYear(), i, 1);
          const monthEnd = new Date(now.getFullYear(), i + 1, 0);
          
          const monthBookings = bookings?.filter(booking => {
            const bookingDate = new Date(booking.created_at);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
          }) || [];

          monthlyData.push({
            month: format(monthStart, "MMM"),
            revenue: monthBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
            bookings: monthBookings.length,
          });
        }
      }

      setData({
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        avg_booking_value: avgBookingValue,
        monthly_data: monthlyData,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics de Receita</h2>
        </div>
        <div className="text-center py-8">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics de Receita</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data?.total_revenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "month" ? "No mês atual" : "No ano atual"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total_bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio por Agendamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data?.avg_booking_value?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Média por agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {period === "year" && data?.monthly_data && (
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal do Ano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthly_data.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="font-medium">{month.month}</div>
                  <div className="text-right">
                    <div className="font-bold">R$ {month.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {month.bookings} agendamentos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Próximas Implementações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Gráficos interativos de receita</p>
            <p>• Análise de salas mais rentáveis</p>
            <p>• Comparação entre períodos</p>
            <p>• Projeções de receita</p>
            <p>• Relatórios detalhados por cliente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};