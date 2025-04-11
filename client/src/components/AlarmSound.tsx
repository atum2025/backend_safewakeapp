import React, { useRef, useEffect, useState } from 'react';
import { isNativePlatform, vibrateAlarm } from '../lib/capacitor';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';

interface AlarmSoundProps {
  sound: string;
  isPlaying: boolean;
}

// Map of ringtone names to URLs
const RINGTONES = {
  alarme1: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
  alarme2: "https://assets.mixkit.co/active_storage/sfx/1794/1794-preview.mp3",
  alarme3: "https://assets.mixkit.co/active_storage/sfx/1062/1062-preview.mp3",
  vibrate: ""
};

const AlarmSound: React.FC<AlarmSoundProps> = ({ sound, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up previous audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    // Create new audio element if sound isn't "vibrate"
    if (sound !== 'vibrate' && RINGTONES[sound as keyof typeof RINGTONES]) {
      const audio = new Audio(RINGTONES[sound as keyof typeof RINGTONES]);
      audio.loop = true;
      audioRef.current = audio;

      audio.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
      });

      return () => {
        audio.pause();
        audio.src = "";
      };
    } else if (sound === 'vibrate') {
      // Handle vibration if available
      if ('vibrate' in navigator || isNativePlatform()) {
        audioRef.current = null;
        setAudioLoaded(true);
      }
    }
  }, [sound]);

  // Configurar notificações nativas quando o componente é montado
  useEffect(() => {
    // Só configura se estiver em plataforma nativa
    if (isNativePlatform()) {
      // Configurar listener para ações em notificações
      let cleanup: (() => void) | undefined;
      
      LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notification: ActionPerformed) => {
          console.log('Ação na notificação:', notification);
        }
      ).then(listener => {
        cleanup = () => listener.remove();
      });

      return () => {
        // Limpar listener quando o componente é desmontado
        if (cleanup) cleanup();
      };
    }
  }, []);

  // Efeito para mostrar notificação quando o alarme está ativo
  useEffect(() => {
    if (isPlaying && isNativePlatform()) {
      const scheduleNotification = async () => {
        try {
          const notificationId = new Date().getTime();
          notificationIdRef.current = notificationId;
          
          await LocalNotifications.schedule({
            notifications: [
              {
                id: notificationId,
                title: 'SafeWake - Alarme Ativo!',
                body: 'Toque para desativar o alarme de segurança',
                sound: '',
                actionTypeId: 'ALARM_ACTION',
                extra: { alarmActive: true }
              }
            ]
          });
        } catch (error) {
          console.error('Erro ao mostrar notificação:', error);
        }
      };

      scheduleNotification();

      return () => {
        // Cancelar notificação quando o alarme é desativado
        if (notificationIdRef.current !== null) {
          LocalNotifications.cancel({
            notifications: [{ id: notificationIdRef.current }]
          });
          notificationIdRef.current = null;
        }
      };
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioLoaded) return;

    if (isPlaying) {
      if (sound === 'vibrate') {
        // Usar vibração nativa se disponível
        if (isNativePlatform()) {
          // Iniciar vibração repetida a cada 3 segundos
          vibrationIntervalRef.current = setInterval(() => {
            vibrateAlarm();
          }, 3000);
        } else if ('vibrate' in navigator) {
          // Usar API de vibração da web se disponível
          navigator.vibrate([500, 200, 500, 200, 500]);
        }
      } else if (audioRef.current) {
        // Reproduzir áudio
        audioRef.current.play().catch(e => {
          console.error("Não foi possível reproduzir áudio:", e);
        });
        
        // Se estivermos em plataforma nativa, também vibramos junto com o som
        if (isNativePlatform()) {
          vibrationIntervalRef.current = setInterval(() => {
            vibrateAlarm();
          }, 3000);
        }
      }
    } else {
      // Parar reprodução
      if (sound === 'vibrate') {
        if (isNativePlatform() && vibrationIntervalRef.current) {
          clearInterval(vibrationIntervalRef.current);
          vibrationIntervalRef.current = null;
        } else if ('vibrate' in navigator) {
          navigator.vibrate(0); // Parar vibração
        }
      } else if (audioRef.current) {
        audioRef.current.pause();
        
        // Parar vibração nativa também
        if (isNativePlatform() && vibrationIntervalRef.current) {
          clearInterval(vibrationIntervalRef.current);
          vibrationIntervalRef.current = null;
        }
      }
    }

    // Limpar recursos ao desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Limpar vibração
      if (isNativePlatform() && vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      } else if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [isPlaying, audioLoaded, sound]);

  return null; // Este componente não renderiza nada visualmente
};

export default AlarmSound;
