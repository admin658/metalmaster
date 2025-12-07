import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSubscription } from '../hooks/useSubscription';

export interface SubscriptionGateProps {
  requiredPlan: 'free' | 'pro';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SubscriptionGate component for mobile (React Native / Expo)
 * Wraps premium features and shows upsell if user is on free tier
 * 
 * Usage:
 * <SubscriptionGate requiredPlan="pro">
 *   <StatsScreen />
 * </SubscriptionGate>
 */
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  requiredPlan,
  children,
  fallback
}) => {
  const { status, isPro, isLoading, error, upgradeToPro } = useSubscription();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={{ color: '#999', marginTop: 12 }}>Loading subscription status...</Text>
      </View>
    );
  }

  // Free tier always has access to free content
  if (requiredPlan === 'free') {
    return <>{children}</>;
  }

  // Pro content: user must be pro or lifetime
  if (isPro) {
    return <>{children}</>;
  }

  // User is on free tier but needs pro
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 500 }}>
        <View style={{
          width: '100%',
          backgroundColor: '#2a2a2a',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#dc2626',
          padding: 20
        }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#dc2626', marginBottom: 8 }}>
              🎸 Premium Feature
            </Text>
            <Text style={{ fontSize: 14, color: '#ccc' }}>
              This feature is only available for Metal Master Pro subscribers
            </Text>
          </View>

          {/* Benefits */}
          <View style={{ backgroundColor: '#1a1a1a', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <Text style={{ fontWeight: '600', color: '#fff', marginBottom: 12 }}>
              Pro Membership Includes:
            </Text>
            <View style={{ gap: 10 }}>
              <BenefitRow text="Advanced stats & analytics" />
              <BenefitRow text="Daily riff challenges" />
              <BenefitRow text="AI tone & technique feedback" />
              <BenefitRow text="Unlimited practice sessions" />
              <BenefitRow text="Custom jam track generation" />
            </View>
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            onPress={upgradeToPro}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#555' : '#dc2626',
              borderRadius: 8,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text style={{ color: '#ff6b6b', marginTop: 12, textAlign: 'center', fontSize: 12 }}>
              {error}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const BenefitRow: React.FC<{ text: string }> = ({ text }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ color: '#dc2626', marginRight: 8, fontSize: 16 }}>✓</Text>
    <Text style={{ color: '#ccc', fontSize: 14 }}>{text}</Text>
  </View>
);

export default SubscriptionGate;
