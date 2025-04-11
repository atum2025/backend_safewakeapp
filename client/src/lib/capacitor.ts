import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Verifica se o app está rodando no ambiente do Capacitor (iOS/Android nativo)
export const isNativePlatform = (): boolean => {
  return 'Capacitor' in window;
};

// Funções para notificações
export const scheduleNotification = async (options: ScheduleOptions): Promise<void> => {
  if (!isNativePlatform()) {
    console.log('Notificações só funcionam em dispositivos nativos');
    return;
  }

  try {
    await LocalNotifications.schedule(options);
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
  }
};

export const cancelNotifications = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
};

// Funções de feedback tátil (vibração)
export const vibrate = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.error('Erro ao gerar vibração:', error);
  }
};

export const vibrateAlarm = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  // Padrão de vibração de alarme (vibração longa)
  try {
    // Repetir várias vezes para criar um padrão de alarme
    for (let i = 0; i < 5; i++) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('Erro ao gerar vibração de alarme:', error);
  }
};

// Manipulação de eventos do ciclo de vida da aplicação
export const setupAppLifecycleListeners = (
  onResume?: () => void,
  onPause?: () => void
): void => {
  if (!isNativePlatform()) return;
  
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      onResume?.();
    } else {
      onPause?.();
    }
  });
};

// Função para abrir links externos
export const openExternalUrl = async (url: string): Promise<void> => {
  if (!isNativePlatform()) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    await Browser.open({ url });
  } catch (error) {
    console.error('Erro ao abrir URL:', error);
    window.open(url, '_blank');
  }
};

// Função para abrir WhatsApp
export const openWhatsApp = async (phoneNumber: string, message: string): Promise<void> => {
  // Formata número de telefone (removendo caracteres não numéricos)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Encode da mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  // URL do WhatsApp
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  
  await openExternalUrl(whatsappUrl);
};

// Adicionar listeners para eventos de voltar no Android
export const setupBackButtonHandler = (customHandler?: () => boolean): void => {
  if (!isNativePlatform()) return;
  
  App.addListener('backButton', ({ canGoBack }) => {
    // Se o handler customizado retornar true, não faça mais nada
    if (customHandler && customHandler()) {
      return;
    }
    
    // Comportamento padrão: se puder voltar, volta. Senão, minimiza o app
    if (canGoBack) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  });
};

// Inicialização do Capacitor
export const initCapacitor = (): void => {
  if (!isNativePlatform()) {
    console.log('Executando no ambiente web, recursos nativos não estarão disponíveis');
    return;
  }
  
  // Solicitar permissão para notificações
  LocalNotifications.requestPermissions().then(result => {
    console.log('Permissão de notificações:', result);
  });
  
  // Configurar manipulador de notificações
  LocalNotifications.addListener('localNotificationReceived', notification => {
    console.log('Notificação recebida:', notification);
  });
  
  LocalNotifications.addListener('localNotificationActionPerformed', notification => {
    console.log('Ação em notificação:', notification);
  });
  
  console.log('Capacitor inicializado com sucesso');
};