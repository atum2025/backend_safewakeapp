import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import type { AlarmConfig, EmergencyContact } from '@shared/schema';
import { 
  isNativePlatform, 
  scheduleNotification, 
  cancelNotifications,
  vibrate,
  openWhatsApp,
  setupAppLifecycleListeners
} from '@/lib/capacitor';
import { getDefaultEmergencyMessage } from '@/lib/alarmUtils';

interface AlarmContextType {
  alarmConfig: AlarmConfig | null;
  emergencyContact: EmergencyContact | null;
  isLoadingConfig: boolean;
  isLoadingContact: boolean;
  updateAlarmConfig: (configData: Partial<AlarmConfig>) => Promise<void>;
  updateEmergencyContact: (contactData: any) => Promise<void>;
  activateAlarm: () => void;
  deactivateAlarm: () => void;
  isAlarmActive: boolean;
  sendEmergencyMessage: () => Promise<void>;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa listeners para ciclo de vida do app em plataformas nativas
  useEffect(() => {
    if (isNativePlatform()) {
      setupAppLifecycleListeners(
        // Função executada quando o app volta ao primeiro plano
        () => {
          console.log('App retornou ao primeiro plano');
          // Recarregar dados importantes quando o app voltar
          if (user) {
            fetchAlarmConfig();
            fetchEmergencyContact();
          }
        },
        // Função executada quando o app vai para segundo plano
        () => {
          console.log('App foi para segundo plano');
          // Não desative alarmes aqui - eles devem continuar em segundo plano
        }
      );
    }
  }, [user]);

  // Load alarm config when user changes
  useEffect(() => {
    if (user) {
      fetchAlarmConfig();
      fetchEmergencyContact();
    } else {
      setAlarmConfig(null);
      setEmergencyContact(null);
    }
  }, [user]);

  // Limpar recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current);
      }
      
      // Cancelar todas as notificações pendentes
      if (isNativePlatform()) {
        cancelNotifications();
      }
    };
  }, []);

  const fetchAlarmConfig = async () => {
    if (!user) return;
    
    setIsLoadingConfig(true);
    try {
      const res = await fetch(`/api/alarm-config/${user.id}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const config = await res.json();
        setAlarmConfig(config);
      }
    } catch (error) {
      console.error('Erro ao buscar configuração de alarme:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const fetchEmergencyContact = async () => {
    if (!user) return;
    
    setIsLoadingContact(true);
    try {
      const res = await fetch(`/api/emergency-contact/${user.id}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const contact = await res.json();
        setEmergencyContact(contact);
      }
    } catch (error) {
      console.error('Erro ao buscar contato de emergência:', error);
    } finally {
      setIsLoadingContact(false);
    }
  };

  const updateAlarmConfig = async (configData: Partial<AlarmConfig>) => {
    if (!user || !alarmConfig) return;
    
    try {
      const res = await apiRequest('PUT', `/api/alarm-config/${alarmConfig.id}`, configData);
      const updatedConfig = await res.json();
      setAlarmConfig(updatedConfig);
      
      // Feedback tátil ao atualizar configuração (se em dispositivo)
      if (isNativePlatform()) {
        vibrate();
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração de alarme:', error);
      throw error;
    }
  };

  const updateEmergencyContact = async (contactData: any) => {
    if (!user) return;
    
    try {
      if (emergencyContact) {
        // Update existing contact
        const res = await apiRequest('PUT', `/api/emergency-contact/${emergencyContact.id}`, contactData);
        const updatedContact = await res.json();
        setEmergencyContact(updatedContact);
      } else {
        // Create new contact
        const newContactData = {
          ...contactData,
          userId: user.id,
        };
        const res = await apiRequest('POST', '/api/emergency-contact', newContactData);
        const newContact = await res.json();
        setEmergencyContact(newContact);
      }
      
      // Feedback tátil ao atualizar contato (se em dispositivo)
      if (isNativePlatform()) {
        vibrate();
      }
    } catch (error) {
      console.error('Erro ao atualizar contato de emergência:', error);
      throw error;
    }
  };

  const activateAlarm = () => {
    // Verificar se contato de emergência está configurado
    if (!emergencyContact) {
      console.error('Não foi possível ativar o alarme: Contato de emergência não configurado');
      return;
    }
    
    setIsAlarmActive(true);
    setLocation('/alarm-active');
    
    // Em dispositivos, agendar uma notificação para lembrar sobre o alarme
    if (isNativePlatform()) {
      scheduleNotification({
        notifications: [
          {
            id: 1,
            title: 'SafeWake - Alarme Ativo',
            body: 'Seu alarme de segurança está ativo. Lembre-se de desativá-lo.',
            schedule: { at: new Date(Date.now() + 60000) }, // 1 minuto após a ativação
            sound: '',
            actionTypeId: 'ALARM_REMINDER',
          }
        ]
      });
      
      // Feedback tátil ao ativar alarme
      vibrate();
    }
    
    // Configurar timeout para enviar mensagem de emergência automaticamente após 3 minutos
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
    }
    
    alarmTimeoutRef.current = setTimeout(() => {
      if (isAlarmActive) {
        sendEmergencyMessage();
      }
    }, 180000); // 3 minutos = 180000ms
  };

  const deactivateAlarm = () => {
    setIsAlarmActive(false);
    setLocation('/dashboard');
    
    // Cancelar timeout para mensagem de emergência
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    
    // Em dispositivos, cancelar notificações e dar feedback
    if (isNativePlatform()) {
      cancelNotifications();
      vibrate(); // Feedback tátil ao desativar alarme
    }
  };

  const sendEmergencyMessage = async () => {
    // Verificar se usuário e contato de emergência existem
    if (!user) return;
    
    // Se não houver contato de emergência, não pode enviar mensagem
    if (!emergencyContact) {
      console.error('Não foi possível enviar mensagem de emergência: Contato de emergência não configurado');
      return;
    }
    
    try {
      // Enviar mensagem pelo servidor (backup para web)
      const res = await apiRequest('POST', '/api/send-emergency', { userId: user.id });
      
      // Em dispositivos, usar a integração direta com WhatsApp
      if (isNativePlatform()) {
        const userName = user.fullName || 'Usuário';
        const message = getDefaultEmergencyMessage(userName);
        const phoneNumber = emergencyContact.whatsapp;
        
        // Abrir WhatsApp diretamente com a mensagem
        openWhatsApp(phoneNumber, message);
      }
      
      return res.json();
    } catch (error) {
      console.error('Erro ao enviar mensagem de emergência:', error);
      
      // Tentar abertura direta mesmo se o servidor falhar
      if (isNativePlatform() && emergencyContact) {
        try {
          const userName = user.fullName || 'Usuário';
          const message = getDefaultEmergencyMessage(userName);
          const phoneNumber = emergencyContact.whatsapp;
          
          // Abrir WhatsApp diretamente com a mensagem
          openWhatsApp(phoneNumber, message);
        } catch (whatsappError) {
          console.error('Erro ao abrir WhatsApp:', whatsappError);
        }
      }
      
      throw error;
    }
  };

  return (
    <AlarmContext.Provider
      value={{
        alarmConfig,
        emergencyContact,
        isLoadingConfig,
        isLoadingContact,
        updateAlarmConfig,
        updateEmergencyContact,
        activateAlarm,
        deactivateAlarm,
        isAlarmActive,
        sendEmergencyMessage,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (context === undefined) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
};
