import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alarmConfigValidationSchema } from "@/lib/validation";
import { RINGTONE_OPTIONS } from "@/lib/alarmUtils";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAlarm } from "@/contexts/AlarmContext";
import AlarmSound from "@/components/AlarmSound";

type AlarmConfigFormValues = {
  time: string;
  repeatInterval: number;
  ringtone: string;
};

export default function AlarmConfigPage() {
  const { user, isAuthenticated } = useAuth();
  const { alarmConfig, isLoadingConfig, updateAlarmConfig } = useAlarm();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSound, setPreviewSound] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const form = useForm<AlarmConfigFormValues>({
    resolver: zodResolver(alarmConfigValidationSchema),
    defaultValues: {
      time: alarmConfig?.time || "08:00",
      repeatInterval: alarmConfig?.repeatInterval || 12,
      ringtone: alarmConfig?.ringtone || "alarme1",
    },
  });

  // Update form values when alarm config is loaded
  useEffect(() => {
    if (alarmConfig) {
      form.reset({
        time: alarmConfig.time,
        repeatInterval: alarmConfig.repeatInterval,
        ringtone: alarmConfig.ringtone,
      });
    }
  }, [alarmConfig, form]);

  const onSubmit = async (data: AlarmConfigFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Calculate next alarm time
      const [hours, minutes] = data.time.split(':').map(Number);
      const nextAlarm = new Date();
      nextAlarm.setHours(hours, minutes, 0, 0);
      
      // If time is in the past, set to tomorrow
      if (nextAlarm < new Date()) {
        nextAlarm.setDate(nextAlarm.getDate() + 1);
      }

      await updateAlarmConfig({
        ...data,
        isActive: true,
        nextAlarm,
      });
      
      toast({
        title: "Alarme configurado",
        description: "As configurações do alarme foram salvas com sucesso!",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do alarme",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sound preview
  const handleSoundPreview = (sound: string) => {
    setPreviewSound(sound);
    
    // Stop preview after 3 seconds
    setTimeout(() => {
      setPreviewSound(null);
    }, 3000);
  };

  // Get interval display value
  const intervalValue = form.watch("repeatInterval");
  
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
          <h1 className="text-xl font-bold text-neutral-800">Configurar Alarme</h1>
        </div>
      </header>
      
      <main className="max-w-lg mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-5 space-y-6">
            <div className="bg-[var(--color-secondary)]/50 p-3 rounded-md mb-4">
              <p className="text-sm text-center">
                <strong className="text-[var(--color-alert)]">Aviso de segurança:</strong> Este alarme, quando não desativado dentro de 3 minutos, enviará automaticamente uma mensagem via WhatsApp para seu contato de emergência, diretamente do seu número.
              </p>
            </div>
            {/* Time Selection */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-neutral-800 mb-3">Horário do Alarme</FormLabel>
                  <div className="flex items-center justify-center">
                    <FormControl>
                      <Input
                        type="time"
                        className="text-3xl text-center p-4 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 text-center">Formato 24h</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Repeat Interval */}
            <FormField
              control={form.control}
              name="repeatInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-neutral-800 mb-3">Intervalo de Repetição</FormLabel>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <FormControl>
                      <Slider
                        min={1}
                        max={24}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <span className="ml-3 text-lg font-bold text-primary min-w-[3rem] text-center">
                      {intervalValue}h
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">Repetir automaticamente de 1 a 24 horas</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Ringtone Selection */}
            <FormField
              control={form.control}
              name="ringtone"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-lg font-medium text-neutral-800">Som do Alarme</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      {RINGTONE_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="ml-2 flex-1 cursor-pointer">
                            {option.label}
                          </Label>
                          {option.value !== "vibrate" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-primary"
                              onClick={() => handleSoundPreview(option.value)}
                            >
                              <Play className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full uppercase tracking-wide"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alarme"}
            </Button>
          </form>
        </Form>
      </main>

      {/* Sound preview component */}
      {previewSound && <AlarmSound sound={previewSound} isPlaying={true} />}
    </div>
  );
}
