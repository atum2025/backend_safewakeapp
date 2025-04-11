import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Clock, Bell, User, Info, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useAlarm } from "@/contexts/AlarmContext";
import { formatInterval } from "@/lib/alarmUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { alarmConfig, isLoadingConfig, activateAlarm, emergencyContact } = useAlarm();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="md" />
          </div>

          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/80">
              <User className="h-6 w-6 text-neutral-800" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Next Alarm Card */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-neutral-800 mb-2">Próximo Alarme</h2>

            {isLoadingConfig ? (
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-9 w-20 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
            ) : alarmConfig ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">{alarmConfig.time}</p>
                  <p className="text-neutral-700 text-sm">
                    Repetição a cada {formatInterval(alarmConfig.repeatInterval)}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    // Verificar se existe um contato de emergência cadastrado
                    if (!emergencyContact) {
                      toast({
                        title: "Contato de emergência necessário",
                        description: "Por favor, cadastre um contato de emergência antes de ativar o alarme.",
                        variant: "destructive",
                      });
                      setLocation('/emergency-contact');
                      return;
                    }

                    activateAlarm();
                  }}
                  variant="ghost"
                  className="bg-[var(--color-alert)]/5 rounded-full p-2 hover:bg-[var(--color-alert)]/10"
                  style={{ width: '65px', height: '65px' }}
                >
                  <Bell style={{ width: '49px', height: '49px' }} className="text-[var(--color-alert)]" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-neutral-700">Nenhum alarme configurado</p>
                <Link href="/alarm-config">
                  <Button variant="link" className="mt-2 text-primary hover:text-primary/80">
                    Configurar alarme
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/alarm-config">
            <Button 
              variant="outline" 
              className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center w-full h-full hover:bg-[var(--color-secondary)] transition"
            >
              <Clock className="h-8 w-8 text-[var(--color-alert)] mb-2" />
              <span className="text-sm font-medium text-neutral-800">Configurar Alarme</span>
            </Button>
          </Link>

          <Link href="/emergency-contact">
            <Button 
              variant="outline" 
              className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center w-full h-full hover:bg-[var(--color-secondary)] transition"
            >
              <User className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium text-neutral-800">Contato WhatsApp</span>
            </Button>
          </Link>
        </div>

        {/* Alarm Status */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-neutral-800 mb-4">Estado do Sistema</h2>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-700">Status</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateAlarmConfig({ isActive: !alarmConfig?.isActive })}
                className={`font-medium ${alarmConfig?.isActive ? 'text-primary' : 'text-neutral-500'}`}
              >
                {alarmConfig?.isActive ? "Ativo" : "Pausado"}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-700">Som</span>
              <span className="text-neutral-800 font-medium">
                {alarmConfig?.ringtone === "vibrate" 
                  ? "Apenas Vibração" 
                  : alarmConfig?.ringtone === "alarme1" 
                    ? "Alarme 1" 
                    : alarmConfig?.ringtone === "alarme2" 
                      ? "Alarme 2" 
                      : "Alarme 3"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-700">Contato de emergência WhatsApp</span>
              <span className="text-neutral-800 font-medium">
                {emergencyContact ? "Configurado" : "Não configurado"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* SafeWake Information */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-bold text-neutral-500 mb-4 text-center">O que é o SafeWake?</h2>
            <div className="flex justify-center mb-3">
              <Info className="h-6 w-6 text-[var(--color-alert)]" />
            </div>
            <p className="text-neutral-700 mb-4 text-center text-sm">
              SafeWake é um aplicativo mobile de alarme com recursos de segurança. Quando o alarme toca, um temporizador de 3 minutos se inicia. Se o usuário não desativar o alarme dentro do tempo, uma mensagem é enviada ao número do contato de emergência por WhatsApp.
            </p>

            <Separator className="my-6" />

            <h2 className="text-lg font-bold text-neutral-500 mb-4 text-center">Por que Contatos de Emergência São Importantes</h2>
            <div className="flex justify-center mb-3">
              <Users className="h-6 w-6 text-[var(--color-alert)]" />
            </div>
            <p className="text-neutral-700 mb-4 text-center text-sm">
              Os contatos de emergência são notificados quando você não responde aos alarmes, garantindo que alguém verifique como você está. Esse recurso é especialmente útil para promover tranquilidade e segurança, principalmente em situações inesperadas.
            </p>

            <Separator className="my-6" />

            <h2 className="text-lg font-bold text-neutral-500 mb-4 text-center">Proteção Contínua</h2>
            <div className="flex justify-center mb-3">
              <Shield className="h-6 w-6 text-[var(--color-alert)]" />
            </div>
            <p className="text-neutral-700 text-center text-sm">
              O sistema pode enviar vários alertas consecutivos, reprogramando automaticamente os alarmes a cada 1 ou até 24 horas. Essa funcionalidade garante que você esteja protegido de forma consistente, oferecendo várias tentativas para notificar seu contato de emergência e atender suas necessidades de segurança.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}