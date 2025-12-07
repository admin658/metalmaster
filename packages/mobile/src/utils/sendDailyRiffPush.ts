import { supabase } from '../api';
import * as Notifications from 'expo-notifications';

export async function sendDailyRiffPush(userId: string, riffTitle: string) {
  // Get user's Expo push token from DB
  const { data } = await supabase.from('users').select('expo_push_token').eq('id', userId).single();
  if (!data?.expo_push_token) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Riff is here! 🎸',
      body: `Today's riff: ${riffTitle}`,
      sound: 'default',
    },
    trigger: null, // send immediately
    to: data.expo_push_token,
  });
}

// Usage: await sendDailyRiffPush(userId, riffTitle)
