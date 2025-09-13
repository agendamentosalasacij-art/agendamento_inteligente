import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Shield, Clock, Users, Wifi } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agendamento Fácil",
    description: "Sistema simples e intuitivo para reservar sua sala em poucos cliques"
  },
  {
    icon: MapPin,
    title: "Localização Privilegiada",
    description: "Salas localizadas em pontos estratégicos com fácil acesso"
  },
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Ambientes seguros com controle de acesso e monitoramento"
  },
  {
    icon: Clock,
    title: "Disponibilidade 24/7",
    description: "Acesse nossas salas quando precisar, com flexibilidade total"
  },
  {
    icon: Users,
    title: "Diferentes Capacidades",
    description: "Salas para pequenas reuniões até grandes eventos corporativos"
  },
  {
    icon: Wifi,
    title: "Totalmente Equipadas",
    description: "Wi-Fi, projetor, som e tudo que você precisa para sua reunião"
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Por que escolher nossas salas?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor infraestrutura e experiência para seus eventos empresariais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-soft hover:shadow-elegant transition-all duration-300 hover:scale-105 border-0 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};