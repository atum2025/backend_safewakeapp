import type { AlarmConfig } from "@shared/schema";

// Format time string to display format
export const formatTime = (time: string): string => {
  return time;
};

// Format interval to display text
export const formatInterval = (hours: number): string => {
  return hours === 1 ? `${hours} hora` : `${hours} horas`;
};

// Calculate next alarm time based on current time and interval
export const calculateNextAlarmTime = (time: string, intervalHours: number): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  
  const now = new Date();
  const alarmTime = new Date();
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If alarm time is in the past, add interval hours
  if (alarmTime < now) {
    alarmTime.setTime(alarmTime.getTime() + (intervalHours * 60 * 60 * 1000));
  }
  
  return alarmTime;
};

// Ringtone options for the alarm
export const RINGTONE_OPTIONS = [
  { value: "alarme1", label: "Alarme 1" },
  { value: "alarme2", label: "Alarme 2" },
  { value: "alarme3", label: "Alarme 3" },
  { value: "vibrate", label: "Apenas Vibração" },
];

// Get default message for emergency contact
export const getDefaultEmergencyMessage = (userName: string): string => {
  return `🚨 ALERTA DE SEGURANÇA - SAFEWAKE 🚨\n\nOlá, meu nome é ${userName}. Este é um alerta de segurança automático enviado pelo aplicativo SafeWake. Não consegui desativar meu alarme de segurança pessoal no tempo previsto.\n\nPor favor, entre em contato comigo.\n\n⚠️ Esta é uma mensagem automática de emergência.`;
};

// Check if alarm should be triggered
export const shouldTriggerAlarm = (alarmConfig: AlarmConfig | null): boolean => {
  if (!alarmConfig || !alarmConfig.isActive || !alarmConfig.nextAlarm) {
    return false;
  }
  
  const nextAlarm = new Date(alarmConfig.nextAlarm);
  const now = new Date();
  
  // Trigger alarm if current time is past next alarm time
  return now >= nextAlarm;
};
