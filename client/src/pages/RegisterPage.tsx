import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userValidationSchema } from "@/lib/validation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneInput from "@/components/PhoneInput";
import DateInput from "@/components/DateInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type RegisterFormValues = {
  fullName: string;
  email: string;
  whatsapp: string;
  birthdate: string;
  country: string;
  password: string;
  emergencyName: string;
  emergencyWhatsapp: string;
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(
      userValidationSchema.extend({
        emergencyName: userValidationSchema.shape.fullName,
        emergencyWhatsapp: userValidationSchema.shape.whatsapp,
      })
    ),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      birthdate: "",
      country: "Brasil",
      password: "",
      emergencyName: "",
      emergencyWhatsapp: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      // Separar dados do usuário e contato de emergência
      const userData = {
        fullName: data.fullName,
        email: data.email,
        whatsapp: data.whatsapp,
        birthdate: data.birthdate,
        country: data.country,
        password: data.password,
        // Incluir dados do contato de emergência para o backend
        emergencyContact: {
          name: data.emergencyName,
          whatsapp: data.emergencyWhatsapp
        }
      };

      await registerUser(userData);
      toast({
        title: "Cadastro realizado",
        description: "Seu cadastro foi realizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-600">Cadastro de Usuário</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
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

            <DateInput
              control={form.control}
              name="birthdate"
              label="Data de nascimento"
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                      <SelectItem value="Portugal">Portugal</SelectItem>
                      <SelectItem value="Angola">Angola</SelectItem>
                      <SelectItem value="Moçambique">Moçambique</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-neutral-200">
              <h2 className="text-md font-bold text-neutral-600 mb-3">Contato de Emergência</h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyName"
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
                  name="emergencyWhatsapp"
                  label="WhatsApp"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full uppercase tracking-wide mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
