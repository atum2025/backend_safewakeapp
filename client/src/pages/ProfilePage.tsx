import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, UserCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateValidationSchema, passwordChangeValidationSchema } from "@/lib/validation";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhoneInput from "@/components/PhoneInput";
import DateInput from "@/components/DateInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

type ProfileFormValues = {
  fullName: string;
  whatsapp: string;
  birthdate: string;
  country: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateValidationSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      whatsapp: user?.whatsapp || "",
      birthdate: user?.birthdate || "",
      country: user?.country || "Brasil",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordChangeValidationSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when user is loaded
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        whatsapp: user.whatsapp,
        birthdate: user.birthdate,
        country: user.country,
      });
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      await apiRequest('PUT', `/api/user/${user.id}`, data);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    if (!user) return;
    
    setIsChangingPassword(true);
    try {
      await apiRequest('PUT', `/api/user/${user.id}`, { 
        password: data.newPassword 
      });
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

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
          <h1 className="text-xl font-bold text-[var(--color-alert)]">Perfil do Usuário</h1>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto p-4">
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 rounded-full p-4 mr-4">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-600">{user.fullName}</h2>
                <p className="text-neutral-400 text-sm">{user.email}</p>
              </div>
            </div>
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <PhoneInput
                  control={profileForm.control}
                  name="whatsapp"
                  label="WhatsApp"
                />
                
                <DateInput
                  control={profileForm.control}
                  name="birthdate"
                  label="Data de nascimento"
                />
                
                <FormField
                  control={profileForm.control}
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
                
                <Button 
                  type="submit" 
                  className="w-full uppercase tracking-wide mt-2"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Atualizando..." : "Atualizar Perfil"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Security Section */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-neutral-600 mb-4">Segurança</h2>
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha atual</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full uppercase tracking-wide"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive uppercase tracking-wide"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
