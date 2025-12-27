/**
 * INTEGRATION GUIDE: Using SubscriptionGate in Your Mobile Screens
 * 
 * Pattern: Wrap premium screens with <SubscriptionGate requiredTier="pro">
 */

// ============================================================================
// 0. ENVIRONMENT SETUP (packages/mobile/app.json)
// ============================================================================
// 
// Ensure your app.json has the API URL configured in extras:
// 
// {
//   "expo": {
//     "name": "MetalMaster",
//     "slug": "metalmaster",
//     "extra": {
//       "apiUrl": "https://your-api-domain.com/api"  // or http://localhost:3000/api for dev
//     }
//   }
// }
//
// Then in your environment files, set:
// REACT_APP_API_URL=http://localhost:3000/api  (for dev)
// 
// The useSubscription hook will automatically use SecureStore for auth tokens
// and Linking.openURL to open Stripe checkout URLs in the native browser.
// It uses proper type safety with ApiResponse<UserStats> and instanceof Error handling.
//

// ============================================================================
// 1. STATS SCREEN (packages/mobile/src/screens/StatsScreen.tsx)
// ============================================================================

import React from 'react';
import { View, ScrollView } from 'react-native';
import { SubscriptionGate } from '../components/SubscriptionGate';
import HeatmapGrid from '../components/stats/HeatmapGrid';
import SkillProgressBars from '../components/stats/SkillProgressBars';

export default function StatsScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <View style={{ padding: 16 }}>
          <HeatmapGrid />
          <SkillProgressBars />
        </View>
      </ScrollView>
    </SubscriptionGate>
  );
}

// ============================================================================
// 2. SPEED TRAINER SCREEN (packages/mobile/src/screens/SpeedTrainerScreen.tsx)
// ============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { SubscriptionGate } from '../components/SubscriptionGate';

export default function SpeedTrainerScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          ⚡ Speed Trainer
        </Text>
        {/* Speed trainer UI */}
      </View>
    </SubscriptionGate>
  );
}

// ============================================================================
// 3. DAILY RIFF SCREEN (packages/mobile/src/screens/DailyRiffScreen.tsx)
// ============================================================================

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SubscriptionGate } from '../components/SubscriptionGate';

export default function DailyRiffScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            📅 Daily Riff Challenge
          </Text>
          {/* Daily riff UI */}
        </View>
      </ScrollView>
    </SubscriptionGate>
  );
}

// ============================================================================
// 4. AI TONE ASSISTANT SCREEN (NEW - packages/mobile/src/screens/AIToneScreen.tsx)
// ============================================================================

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SubscriptionGate } from '../components/SubscriptionGate';

export default function AIToneScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            🎛️ AI Tone Assistant
          </Text>
          {/* AI tone UI */}
        </View>
      </ScrollView>
    </SubscriptionGate>
  );
}

// ============================================================================
// 5. AI FEEDBACK SCREEN (NEW - packages/mobile/src/screens/AIFeedbackScreen.tsx)
// ============================================================================

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SubscriptionGate } from '../components/SubscriptionGate';

export default function AIFeedbackScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
            🎸 AI Technique Feedback
          </Text>
          {/* AI feedback UI */}
        </View>
      </ScrollView>
    </SubscriptionGate>
  );
}

// ============================================================================
// ALTERNATIVE: Conditional Rendering (for mixed free/pro features)
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';

export default function FeatureScreen() {
  const { status } = useSubscription();

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 16 }}>
      {/* Free section - always visible */}
      <View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
          📚 Lessons
        </Text>
        {/* Free lessons UI */}
      </View>

      {/* Pro section - conditional */}
      {status === 'pro' ? (
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: '#dc2626', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            ✨ Premium Lessons
          </Text>
          {/* Premium lessons UI */}
        </View>
      ) : (
        <View style={{ marginTop: 24, padding: 16, backgroundColor: '#2a2a2a', borderRadius: 8, borderWidth: 1, borderColor: '#dc2626' }}>
          <Text style={{ color: '#ccc', marginBottom: 12 }}>
            Premium lessons are available for Pro members.
          </Text>
          <TouchableOpacity style={{ backgroundColor: '#dc2626', padding: 12, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              Upgrade Now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// REGISTER SCREENS IN APP.TSX
// ============================================================================

// In packages/mobile/src/App.tsx, add tabs for premium screens:

import StatsScreen from './screens/StatsScreen';
import SpeedTrainerScreen from './screens/SpeedTrainerScreen';
import DailyRiffScreen from './screens/DailyRiffScreen';
import AIToneScreen from './screens/AIToneScreen';

// In your bottom tab navigator:

<Tab.Screen
  name="Stats"
  component={StatsScreen}
  options={{
    title: '📊 Stats',
    tabBarIcon: ({ color }) => <Icon name="bar-chart" color={color} />
  }}
/>

<Tab.Screen
  name="SpeedTrainer"
  component={SpeedTrainerScreen}
  options={{
    title: '⚡ Speed Trainer',
    tabBarIcon: ({ color }) => <Icon name="zap" color={color} />
  }}
/>

<Tab.Screen
  name="DailyRiff"
  component={DailyRiffScreen}
  options={{
    title: '📅 Daily Riff',
    tabBarIcon: ({ color }) => <Icon name="calendar" color={color} />
  }}
/>

<Tab.Screen
  name="AITone"
  component={AIToneScreen}
  options={{
    title: '🎛️ AI Tone',
    tabBarIcon: ({ color }) => <Icon name="sliders" color={color} />
  }}
/>
