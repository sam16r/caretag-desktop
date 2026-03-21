import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'appointment' | 'vital' | 'prescription' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
  patientId?: string;
  patientName?: string;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    
    // Show toast for important notifications
    if (notification.type === 'emergency') {
      toast.error(notification.title, { description: notification.message });
    } else if (notification.type === 'vital') {
      toast.warning(notification.title, { description: notification.message });
    } else {
      toast.info(notification.title, { description: notification.message });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to emergency records
    const emergencyChannel = supabase
      .channel('emergency-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_records'
        },
        async (payload) => {
          console.log('New emergency:', payload);
          
          const { data: patient } = await supabase
            .from('patients')
            .select('full_name')
            .eq('id', payload.new.patient_id)
            .single();

          addNotification({
            title: '🚨 Emergency Alert',
            message: `${payload.new.severity.toUpperCase()} severity emergency for ${patient?.full_name || 'Unknown patient'}`,
            type: 'emergency',
            patientId: payload.new.patient_id,
            patientName: patient?.full_name
          });
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('Emergency channel error:', err.message);
      });

    // Subscribe to critical vitals
    const vitalsChannel = supabase
      .channel('vitals-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vitals'
        },
        async (payload) => {
          const vitals = payload.new;
          
          // Check for critical values
          const isCritical = 
            (vitals.heart_rate && (vitals.heart_rate < 50 || vitals.heart_rate > 120)) ||
            (vitals.spo2 && vitals.spo2 < 90) ||
            (vitals.blood_pressure_systolic && (vitals.blood_pressure_systolic > 180 || vitals.blood_pressure_systolic < 90));

          if (isCritical) {
            const { data: patient } = await supabase
              .from('patients')
              .select('full_name')
              .eq('id', vitals.patient_id)
              .single();

            let message = 'Abnormal vital signs detected: ';
            if (vitals.heart_rate && (vitals.heart_rate < 50 || vitals.heart_rate > 120)) {
              message += `HR ${vitals.heart_rate} bpm, `;
            }
            if (vitals.spo2 && vitals.spo2 < 90) {
              message += `SpO2 ${vitals.spo2}%, `;
            }
            if (vitals.blood_pressure_systolic && (vitals.blood_pressure_systolic > 180 || vitals.blood_pressure_systolic < 90)) {
              message += `BP ${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}, `;
            }

            addNotification({
              title: '⚠️ Critical Vitals Alert',
              message: `${patient?.full_name}: ${message.slice(0, -2)}`,
              type: 'vital',
              patientId: vitals.patient_id,
              patientName: patient?.full_name
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('Vitals channel error:', err.message);
      });

    // Subscribe to appointments (upcoming reminders)
    const appointmentsChannel = supabase
      .channel('appointment-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: patient } = await supabase
              .from('patients')
              .select('full_name')
              .eq('id', payload.new.patient_id)
              .single();

            addNotification({
              title: '📅 New Appointment',
              message: `Appointment scheduled with ${patient?.full_name || 'patient'}`,
              type: 'appointment',
              patientId: payload.new.patient_id,
              patientName: patient?.full_name
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('Appointments channel error:', err.message);
      });

    return () => {
      supabase.removeChannel(emergencyChannel);
      supabase.removeChannel(vitalsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [user, addNotification]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification
  };
}
