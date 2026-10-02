import { Order } from '../types';
import { supabase } from './supabase';

export const sendTelegramNotification = async (order: Order) => {
  try {
    const { error } = await supabase.functions.invoke('telegram-notify', {
      body: { order },
    });

    if (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  } catch (error) {
    console.error('Error invoking Telegram Edge Function:', error);
  }
};
