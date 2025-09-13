import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Users, MessageCircle, Calendar } from "lucide-react";

const SALAS = [
  { 
    nome: "Sala Hall 3", 
    link: "https://www.acij.com.br/salas/sala-terreo-3/",
    capacidade: "7 pessoas",
    valorAssociado: "R$ 160,00",
    valorNaoAssociado: "R$ 320,00",
    descricao: "Mesa com TV 55\" ideal para pequenas reuniões"
  },
  { 
    nome: "Sala Metal Group", 
    link: "https://www.acij.com.br/salas/sala-terreo-2/",
    capacidade: "12 pessoas",
    valorAssociado: "R$ 180,00",
    valorNaoAssociado: "R$ 360,00",
    descricao: "Sala moderna com equipamentos audiovisuais completos"
  },
  { 
    nome: "Porto Itapoá", 
    link: "https://www.acij.com.br/salas/sala-terreo-1/",
    capacidade: "20 pessoas",
    valorAssociado: "R$ 220,00",
    valorNaoAssociado: "R$ 440,00",
    descricao: "Amplo espaço para reuniões e apresentações"
  },
  { 
    nome: "Sala Carlos R. Schneider", 
    link: "https://www.acij.com.br/salas/sala-carlos-r-schneider/",
    capacidade: "7 pessoas",
    valorAssociado: "R$ 250,00",
    valorNaoAssociado: "R$ 500,00",
    descricao: "Mesa com TV 55\" no 2º andar, ambiente executivo"
  },
  { 
    nome: "Sala João Martinelli", 
    link: "https://www.acij.com.br/salas/sala-martinelli/",
    capacidade: "70 pessoas",
    valorAssociado: "R$ 400,00",
    valorNaoAssociado: "R$ 800,00",
    descricao: "Auditório amplo no 2º andar para grandes apresentações"
  },
  { 
    nome: "Sala Wetzel", 
    link: "https://www.acij.com.br/salas/sala-wetzel/",
    capacidade: "8 pessoas",
    valorAssociado: "R$ 150,00",
    valorNaoAssociado: "R$ 300,00",
    descricao: "Ideal para reuniões executivas e conferências"
  },
  { 
    nome: "Sala Henrique Loyola", 
    link: "https://www.acij.com.br/salas/sala-henrique-loyola/",
    capacidade: "15 pessoas",
    valorAssociado: "R$ 200,00",
    valorNaoAssociado: "R$ 400,00",
    descricao: "Sala de reuniões com mesa de conferência e projetor"
  },
  { 
    nome: "Sala Edgard Meister", 
    link: "https://www.acij.com.br/salas/sala-edgard-meister/",
    capacidade: "10 pessoas",
    valorAssociado: "R$ 170,00",
    valorNaoAssociado: "R$ 340,00",
    descricao: "Ambiente aconchegante para pequenas reuniões"
  },
  { 
    nome: "Sala Nivaldo Nass", 
    link: "https://www.acij.com.br/salas/sala-nivaldo-nass/",
    capacidade: "25 pessoas",
    valorAssociado: "R$ 280,00",
    valorNaoAssociado: "R$ 560,00",
    descricao: "Sala ampla para eventos e treinamentos"
  },
  { 
    nome: "Sala Moacir Bogo", 
    link: "https://www.acij.com.br/salas/sala-moacir-bogo/",
    capacidade: "18 pessoas",
    valorAssociado: "R$ 230,00",
    valorNaoAssociado: "R$ 460,00",
    descricao: "Espaço versátil com layout flexível"
  },
  { 
    nome: "Sala Jaime Grasso", 
    link: "https://www.acij.com.br/salas/sala-jaime-grasso/",
    capacidade: "14 pessoas",
    valorAssociado: "R$ 190,00",
    valorNaoAssociado: "R$ 380,00",
    descricao: "Sala equipada com sistema de som e vídeo"
  },
  { 
    nome: "Sala Moacir Thomazi", 
    link: "https://www.acij.com.br/salas/sala-moacir-thomazi/",
    capacidade: "16 pessoas",
    valorAssociado: "R$ 210,00",
    valorNaoAssociado: "R$ 420,00",
    descricao: "Ambiente profissional para reuniões corporativas"
  },
  { 
    nome: "Salão Tigre", 
    link: "https://www.acij.com.br/salas/salao-tigre/",
    capacidade: "72-230 pessoas",
    valorAssociado: "R$ 995,00",
    valorNaoAssociado: "R$ 1.990,00",
    descricao: "Salão para grandes eventos com telão e projetor inclusos"
  },
  { 
    nome: "Salão Nobre Schulz", 
    link: "https://www.acij.com.br/salas/salao-nobre-schulz/",
    capacidade: "50 pessoas",
    valorAssociado: "R$ 400,00",
    valorNaoAssociado: "R$ 800,00",
    descricao: "Salão principal para grandes eventos e cerimônias"
  },
];

export const RoomsSection = () => {
  const handleWhatsApp = (sala: any) => {
    const message = `Olá! Gostaria de mais informações sobre a ${sala.nome}. Capacidade: ${sala.capacidade}. Valores: Associados ${sala.valorAssociado} | Não associados ${sala.valorNaoAssociado}`;
    const whatsappUrl = `https://wa.me/5547999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleWebhook = async (sala: any) => {
    try {
      // Webhook URL mascarado por segurança
      const WEBHOOK_URL = "https://webhook.neurozappro.com/webhook/agendamento";
      
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "consulta_sala",
          sala: sala.nome,
          capacidade: sala.capacidade,
          valorAssociado: sala.valorAssociado,
          valorNaoAssociado: sala.valorNaoAssociado,
          link: sala.link,
          timestamp: new Date().toISOString()
        }),
      });
      
      // Redirect to booking form (agenda)
      const formElement = document.getElementById("booking-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  return (
    <section id="salas-disponiveis" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nossas Salas Disponíveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha a sala perfeita para sua reunião, evento ou apresentação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SALAS.map((sala, index) => (
            <Card 
              key={index} 
              className="shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-105 border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{sala.nome}</CardTitle>
                <Badge variant="outline" className="mx-auto">
                  <Users className="w-3 h-3 mr-1" />
                  {sala.capacidade}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {sala.descricao}
                </p>
                
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      VALORES PARA ASSOCIADOS COM 50% OFF
                    </Badge>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Manhã ou tarde: </span>
                      <span className="font-semibold text-primary">{sala.valorAssociado}</span>
                    </p>
                  </div>
                  
                  <div className="text-center border-t pt-3">
                    <Badge variant="outline" className="mb-2">
                      VALOR PARA NÃO ASSOCIADOS
                    </Badge>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Manhã ou tarde: </span>
                      <span className="font-semibold text-foreground">{sala.valorNaoAssociado}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(sala.link, "_blank")}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Detalhes Completos
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleWhatsApp(sala)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                    
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleWebhook(sala)}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Reservar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};