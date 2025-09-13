import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Building2, User, Mail, Phone, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  empresa: string;
  data_agendada: string;
  sala: string;
  sala_link: string;
}

const SALAS = [
  { nome: "Sala Metal Group", link: "https://www.acij.com.br/salas/sala-terreo-2/" },
  { nome: "Porto Itapoá", link: "https://www.acij.com.br/salas/sala-terreo-1/" },
  { nome: "Sala Wetzel", link: "https://www.acij.com.br/salas/sala-wetzel/" },
  { nome: "Sala Henrique Loyola", link: "https://www.acij.com.br/salas/sala-henrique-loyola/" },
  { nome: "Sala Edgard Meister", link: "https://www.acij.com.br/salas/sala-edgard-meister/" },
  { nome: "Sala Nivaldo Nass", link: "https://www.acij.com.br/salas/sala-nivaldo-nass/" },
  { nome: "Sala Moacir Bogo", link: "https://www.acij.com.br/salas/sala-moacir-bogo/" },
  { nome: "Sala Jaime Grasso", link: "https://www.acij.com.br/salas/sala-jaime-grasso/" },
  { nome: "Sala Moacir Thomazi", link: "https://www.acij.com.br/salas/sala-moacir-thomazi/" },
  { nome: "Salão Nobre Schulz", link: "https://www.acij.com.br/salas/salao-nobre-schulz/" },
];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const BookingForm = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    telefone: "",
    email: "",
    empresa: "",
    data_agendada: "",
    sala: "",
    sala_link: "",
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "telefone") {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSalaChange = (salaNome: string) => {
    const sala = SALAS.find(s => s.nome === salaNome);
    if (sala) {
      setFormData(prev => ({
        ...prev,
        sala: sala.nome,
        sala_link: sala.link,
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        data_agendada: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    else if (!validateEmail(formData.email)) newErrors.email = "E-mail inválido";
    if (!formData.empresa.trim()) newErrors.empresa = "Empresa é obrigatória";
    if (!formData.data_agendada) newErrors.data_agendada = "Data é obrigatória";
    if (!formData.sala) newErrors.sala = "Sala é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro na validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const phoneDigits = formData.telefone.replace(/\D/g, "");
      
      // Check if webhook URL is configured
      const WEBHOOK_URL = process.env.VITE_WEBHOOK_URL || null;
      
      if (WEBHOOK_URL) {
        // Send to real webhook
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            telefone: phoneDigits,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha no envio para webhook");
        }
      } else {
        // Simulate success for development
        console.log("Dados do agendamento:", {
          ...formData,
          telefone: phoneDigits,
        });
      }

      toast({
        title: "Agendamento realizado!",
        description: "Você será redirecionado para o WhatsApp para confirmar.",
      });

      // Generate WhatsApp redirect
      const whatsappMessage = `Olá, gostaria de confirmar meu agendamento para a ${formData.data_agendada} na ${formData.sala}. Meu nome é ${formData.nome} da empresa ${formData.empresa}.`;
      const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elegant">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Agendar Sala</CardTitle>
        <CardDescription>
          Preencha os dados abaixo para realizar seu agendamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome completo *
            </Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className={errors.nome ? "border-destructive" : ""}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone com DDD *
            </Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(47) 99999-9999"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
              className={errors.telefone ? "border-destructive" : ""}
              maxLength={15}
            />
            {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa *
            </Label>
            <Input
              id="empresa"
              type="text"
              placeholder="Nome da sua empresa"
              value={formData.empresa}
              onChange={(e) => handleInputChange("empresa", e.target.value)}
              className={errors.empresa ? "border-destructive" : ""}
            />
            {errors.empresa && <p className="text-sm text-destructive">{errors.empresa}</p>}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Data do agendamento *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.data_agendada && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < addDays(new Date(), 1)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.data_agendada && <p className="text-sm text-destructive">{errors.data_agendada}</p>}
          </div>

          {/* Sala */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Sala *
            </Label>
            <Select onValueChange={handleSalaChange} value={formData.sala}>
              <SelectTrigger className={errors.sala ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {SALAS.map((sala) => (
                  <SelectItem key={sala.nome} value={sala.nome}>
                    {sala.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sala && <p className="text-sm text-destructive">{errors.sala}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            variant="hero"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};