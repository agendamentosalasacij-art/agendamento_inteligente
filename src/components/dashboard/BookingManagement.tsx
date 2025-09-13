import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  client_id: string;
  room_id: string;
  start_datetime: string;
  end_datetime: string;
  total_amount: number;
  status: string;
  payment_status: string;
  notes: string;
  clients: { name: string };
  rooms: { name: string };
}

interface Client {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  hourly_rate: number;
}

export const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    room_id: "",
    start_datetime: "",
    end_datetime: "",
    total_amount: 0,
    status: "pending",
    payment_status: "pending",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchClients();
    fetchRooms();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        clients:client_id(name),
        rooms:room_id(name)
      `)
      .order("start_datetime", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBookings(data || []);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");

    if (!error) setClients(data || []);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, hourly_rate")
      .eq("is_active", true)
      .order("name");

    if (!error) setRooms(data || []);
  };

  const calculateAmount = () => {
    if (formData.start_datetime && formData.end_datetime && formData.room_id) {
      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const room = rooms.find(r => r.id === formData.room_id);
      if (room) {
        const amount = hours * room.hourly_rate;
        setFormData(prev => ({ ...prev, total_amount: amount }));
      }
    }
  };

  useEffect(() => {
    calculateAmount();
  }, [formData.start_datetime, formData.end_datetime, formData.room_id]);

  const handleSubmit = async () => {
    try {
      if (editingBooking) {
        const { error } = await supabase
          .from("bookings")
          .update(formData)
          .eq("id", editingBooking.id);

        if (error) throw error;
        toast({ title: "Agendamento atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("bookings")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Agendamento criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingBooking(null);
      resetForm();
      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      room_id: "",
      start_datetime: "",
      end_datetime: "",
      total_amount: 0,
      status: "pending",
      payment_status: "pending",
      notes: "",
    });
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      client_id: booking.client_id,
      room_id: booking.room_id,
      start_datetime: booking.start_datetime.slice(0, 16),
      end_datetime: booking.end_datetime.slice(0, 16),
      total_amount: booking.total_amount,
      status: booking.status,
      payment_status: booking.payment_status,
      notes: booking.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Erro ao excluir agendamento",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Agendamento excluído com sucesso!" });
        fetchBookings();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      confirmed: { label: "Confirmado", variant: "default" as const },
      completed: { label: "Concluído", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config?.variant}>{config?.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      paid: { label: "Pago", variant: "default" as const },
      partial: { label: "Parcial", variant: "outline" as const },
      refunded: { label: "Reembolsado", variant: "destructive" as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config?.variant}>{config?.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Agendamentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBooking(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_id">Sala *</Label>
                <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} - R$ {room.hourly_rate}/h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_datetime">Data/Hora Início *</Label>
                <Input
                  id="start_datetime"
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_datetime">Data/Hora Fim *</Label>
                <Input
                  id="end_datetime"
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_amount">Valor Total</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Status Pagamento</Label>
                <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingBooking ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.clients?.name}</TableCell>
                  <TableCell>{booking.rooms?.name}</TableCell>
                  <TableCell>
                    {format(new Date(booking.start_datetime), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>R$ {booking.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(booking.payment_status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(booking)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};