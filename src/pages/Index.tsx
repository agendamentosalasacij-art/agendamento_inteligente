import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { RoomsSection } from "@/components/RoomsSection";
import { BookingForm } from "@/components/BookingForm";
import { Footer } from "@/components/Footer";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <Link to="/auth">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Acesso CRM
          </Button>
        </Link>
      </div>
      <Hero />
      <Features />
      <RoomsSection />
      <section id="booking-form" className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Faça seu Agendamento
          </h2>
          <p className="text-lg text-muted-foreground">
            Preencha o formulário abaixo e garante sua sala ideal
          </p>
        </div>
        <BookingForm />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
