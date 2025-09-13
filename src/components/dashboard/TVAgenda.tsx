import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Users } from "lucide-react";

interface TVBooking {
  id: string;
  start_datetime: string;
  end_datetime: string;
  clients: { name: string };
  rooms: { name: string };
  status: string;
}

export const TVAgenda = () => {
  const [bookings, setBookings] = useState<TVBooking[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayBookings();
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh bookings every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchTodayBookings();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchTodayBookings = async () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfWeek = addDays(startOfDay, 7);

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        start_datetime,
        end_datetime,
        status,
        clients:client_id(name),
        rooms:room_id(name)
      `)
      .gte("start_datetime", startOfDay.toISOString())
      .lte("start_datetime", endOfWeek.toISOString())
      .in("status", ["confirmed", "pending"])
      .order("start_datetime", { ascending: true });

    if (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } else {
      setBookings(data || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      confirmed: { label: "Confirmado", variant: "default" as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config?.variant}>{config?.label}</Badge>;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, dd/MM", { locale: ptBR });
  };

  const groupBookingsByDate = () => {
    const grouped: { [key: string]: TVBooking[] } = {};
    
    bookings.forEach(booking => {
      const date = format(new Date(booking.start_datetime), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });

    return grouped;
  };

  const groupedBookings = groupBookingsByDate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with current time */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">ACIJ - Agenda de Salas</h1>
        <div className="flex items-center justify-center gap-4 text-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6" />
            {format(currentTime, "HH:mm", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Bookings by date */}
      <div className="space-y-6">
        {Object.keys(groupedBookings).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-2xl font-semibold mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-muted-foreground">Não há agendamentos para os próximos 7 dias.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedBookings).map(([date, dayBookings]) => (
            <Card key={date} className="border-2">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  {getDateLabel(new Date(date))}
                  <Badge variant="outline" className="ml-auto">
                    {dayBookings.length} agendamento(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {format(new Date(booking.start_datetime), "HH:mm")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(booking.end_datetime), "HH:mm")}
                          </div>
                        </div>
                        
                        <div className="h-12 w-px bg-border" />
                        
                        <div className="space-y-1">
                          <div className="font-semibold text-lg flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {booking.clients?.name}
                          </div>
                          <div className="text-muted-foreground">
                            {booking.rooms?.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-muted-foreground text-sm">
        Atualizado automaticamente a cada 5 minutos • Última atualização: {format(new Date(), "HH:mm")}
      </div>
    </div>
  );
};