import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import { useAuth } from "@/contexts/AuthContext";
import { useAlarm } from "@/contexts/AlarmContext";
import { getDefaultEmergencyMessage } from "@/lib/alarmUtils";
import AlarmSound from "@/components/AlarmSound";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { Bell, AlertTriangle } from "lucide-react";

export default function AlarmActivePage() {
  const { user, isAuthenticated } = useAuth();
  const { alarmConfig, deactivateAlarm, sendEmergencyMessage } = useAlarm();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isTimeout, setIsTimeout] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  // Handle timeout
  const handleTimeout = async () => {
    setIsTimeout(true);
    
    try {
      await sendEmergencyMessage();
      toast({
        title: "Mensagem enviada",
        description: "Mensagem de emergência enviada com sucesso!",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem de emergência",
        variant: "destructive",
      });
    }
  };

  // Get the message to be sent
  const emergencyMessage = user ? getDefaultEmergencyMessage(user.fullName) : "";

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bell className="h-6 w-6 text-[var(--color-alert)] animate-pulse" />
          <h1 className="text-3xl font-bold text-white text-center">Alarme Ativado</h1>
          <Bell className="h-6 w-6 text-[var(--color-alert)] animate-pulse" />
        </div>
        
        <div className="my-8 flex flex-col items-center">
          {/* Countdown Timer */}
          <CountdownTimer 
            onTimeout={handleTimeout} 
            isActive={!isTimeout} 
          />
          
          <div className="flex items-center mt-4 mb-6 bg-[var(--color-alert)]/20 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-[var(--color-alert)] mr-2 flex-shrink-0" />
            <p className="text-gray-300 text-center text-sm">
              {isTimeout 
                ? "A mensagem de emergência foi enviada automaticamente via WhatsApp para seu contato de emergência." 
                : "Desative o alarme ou uma mensagem de emergência será enviada automaticamente via WhatsApp em 3 minutos."
              }
            </p>
          </div>
          
          {isTimeout ? (
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-xl shadow-lg hover:bg-green-700 transition-colors"
            >
              VOLTAR AO INÍCIO
            </Button>
          ) : (
            <Button 
              onClick={deactivateAlarm}
              className="w-full bg-[var(--color-alert)] text-white py-4 px-6 rounded-lg font-bold text-xl shadow-lg hover:bg-[var(--color-alert)]/80 transition-colors"
            >
              DESATIVAR ALARME
            </Button>
          )}
        </div>
        
        <div className="bg-neutral-700/50 rounded-lg p-4 mt-4 border border-[var(--color-alert)]/30">
          <p className="text-sm text-white flex items-center">
            <AlertTriangle className="h-4 w-4 text-[var(--color-alert)] mr-2" />
            {isTimeout ? "Mensagem enviada por WhatsApp:" : "Mensagem que será enviada por WhatsApp:"}
          </p>
          <p className="text-sm text-gray-300 mt-2 italic bg-neutral-800/50 p-3 rounded border border-neutral-700">
            "{emergencyMessage}"
          </p>
        </div>
      </div>

      {/* Play alarm sound */}
      {alarmConfig && <AlarmSound sound={alarmConfig.ringtone} isPlaying={!isTimeout} />}
    </div>
  );
}
