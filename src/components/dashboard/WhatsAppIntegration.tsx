import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Plus, Send, ExternalLink } from "lucide-react";

interface WhatsAppConversation {
  id: string;
  client_id: string;
  phone_number: string;
  conversation_data: any;
  last_message_at: string;
  status: string;
  clients?: { name: string };
}

export const WhatsAppIntegration = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [message, setMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("whatsapp_conversations")
      .select(`
        *,
        clients:client_id(name)
      `)
      .order("last_message_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setConversations(data || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativo", variant: "default" as const },
      closed: { label: "Fechado", variant: "secondary" as const },
      archived: { label: "Arquivado", variant: "outline" as const },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge variant={config?.variant}>{config?.label}</Badge>;
  };

  const openWhatsApp = (phoneNumber: string, message?: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    const url = `https://wa.me/55${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
    window.open(url, '_blank');
  };

  const sendQuickMessage = (phone: string, type: 'info' | 'confirmation' | 'reminder') => {
    const messages = {
      info: `Olá! Obrigado pelo interesse em nossas salas de reunião da ACIJ. 

🏢 *Disponibilidade de Salas:*
• Sala Marconi (15 pessoas) - R$ 80/h
• Sala Kennedy (40 pessoas) - R$ 150/h  
• Salão Tigre (100 pessoas) - R$ 300/h

📅 Para agendar ou tirar dúvidas, entre em contato conosco!

*ACIJ - Associação Comercial e Industrial de Joinville*`,
      
      confirmation: `✅ *Agendamento Confirmado!*

Obrigado por escolher a ACIJ para seu evento!

📍 Detalhes do seu agendamento foram enviados por email.
🕒 Chegue 15 minutos antes do horário agendado.
📋 Lembre-se de trazer documento de identificação.

Alguma dúvida? Estamos aqui para ajudar! 😊`,
      
      reminder: `⏰ *Lembrete de Agendamento*

Olá! Este é um lembrete sobre seu agendamento na ACIJ amanhã.

📅 Não esqueça de confirmar sua presença.
📍 Localização: [Endereço da ACIJ]
🚗 Estacionamento disponível no local.

Até amanhã! 👋`
    };
    
    openWhatsApp(phone, messages[type]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integração WhatsApp</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Nova Conversa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número do WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value=""
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem Inicial</Label>
                <Textarea
                  id="message"
                  placeholder="Olá! Como posso ajudar você?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => openWhatsApp("", message)}>
                  <Send className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mensagens Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Informações Gerais</h4>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => sendQuickMessage("", "info")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Informações sobre Salas
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Confirmação</h4>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => sendQuickMessage("", "confirmation")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Confirmação de Agendamento
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Lembrete</h4>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => sendQuickMessage("", "reminder")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Lembrete de Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Conversas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conversa encontrada</p>
                <p className="text-sm">As conversas aparecerão aqui quando criadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.slice(0, 5).map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {conversation.clients?.name || "Cliente não identificado"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {conversation.phone_number}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(conversation.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(conversation.phone_number)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integrações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chatwoot</h3>
              <p className="text-sm text-muted-foreground">
                Integre com Chatwoot para atendimento profissional via WhatsApp
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Configurar Chatwoot
                </Button>
                <p className="text-xs text-muted-foreground">
                  Requer configuração de webhook e token de acesso
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">WhatsApp Business API</h3>
              <p className="text-sm text-muted-foreground">
                Configure a API oficial do WhatsApp Business
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Configurar API
                </Button>
                <p className="text-xs text-muted-foreground">
                  Necessário número comercial verificado
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Status Atual</h4>
            <p className="text-sm text-muted-foreground">
              • WhatsApp Web: Funcional ✅<br/>
              • Mensagens Rápidas: Funcional ✅<br/>
              • Chatwoot: Aguardando configuração ⏳<br/>
              • WhatsApp Business API: Aguardando configuração ⏳
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};