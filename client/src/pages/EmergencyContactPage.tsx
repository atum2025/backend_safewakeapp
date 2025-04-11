import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emergencyContactValidationSchema } from "@/lib/validation";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PhoneInput from "@/components/PhoneInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAlarm } from "@/contexts/AlarmContext";

type EmergencyContactFormValues = {
  name: string;
  whatsapp: string;
};

export default function EmergencyContactPage() {
  const { user, isAuthenticated } = useAuth();
  const { emergencyContact, isLoadingContact, updateEmergencyContact } = useAlarm();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const form = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactValidationSchema),
    defaultValues: {
      name: emergencyContact?.name || "",
      whatsapp: emergencyContact?.whatsapp || "",
    },
  });

  // Update form values when contact is loaded
  useEffect(() => {
    if (emergencyContact) {
      form.reset({
        name: emergencyContact.name,
        whatsapp: emergencyContact.whatsapp,
      });
    }
  }, [emergencyContact, form]);

  const onSubmit = async (data: EmergencyContactFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateEmergencyContact(data);
      
      toast({
        title: "Contato salvo",
        description: "Contato de emergência salvo com sucesso!",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar contato de emergência",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-neutral-800">Contato de Emergência</h1>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto p-4">
        <Card>
          <CardContent className="p-5">
            {emergencyContact ? (
              <p className="text-neutral-700 mb-6 text-center">
                Seu contato de emergência atual receberá uma mensagem <strong>via WhatsApp</strong> caso você não desative seu alarme em 3 minutos. Você pode atualizar essas informações abaixo.
              </p>
            ) : (
              <p className="text-neutral-700 mb-6 text-center">
                Configure um contato de emergência para receber uma mensagem <strong>via WhatsApp</strong> caso você não desative seu alarme em 3 minutos. O aplicativo enviará a mensagem automaticamente do seu número para o contato configurado.
              </p>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <PhoneInput
                  control={form.control}
                  name="whatsapp"
                  label="WhatsApp"
                />
                
                <Button 
                  type="submit" 
                  className="w-full uppercase tracking-wide mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? "Salvando..." 
                    : emergencyContact 
                      ? "Atualizar Contato"
                      : "Salvar Contato"
                  }
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="font-medium text-[var(--color-alert)] mb-2 text-center">Mensagem que será enviada por WhatsApp:</h3>
              <p className="text-sm text-neutral-700 italic bg-[var(--color-secondary)]/50 p-3 rounded-md text-justify">
                {user && `"🚨 ALERTA DE SEGURANÇA - SAFEWAKE 🚨\n\nOlá, meu nome é ${user.fullName}. Este é um alerta de segurança automático enviado pelo aplicativo SafeWake. Não consegui desativar meu alarme de segurança pessoal no tempo previsto.\n\nPor favor, entre em contato comigo.\n\n⚠️ Esta é uma mensagem automática de emergência."`}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
