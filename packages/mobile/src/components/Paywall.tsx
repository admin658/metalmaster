import React, { createContext, useContext, useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

// RevenueCat API keys (replace with your own)
const REVENUECAT_API_KEY = 'public_sdk_key_here';
const PRO_PRODUCT_ID = 'pro_tier';
const ELITE_PRODUCT_ID = 'elite_tier';

// Subscription Context
const SubscriptionContext = createContext({
  isPro: false,
  isElite: false,
  loading: true,
  restore: async () => {},
  purchase: async (tier: 'pro' | 'elite') => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPro, setIsPro] = useState(false);
  const [isElite, setIsElite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    const checkStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPro(!!customerInfo.activeSubscriptions?.includes(PRO_PRODUCT_ID));
        setIsElite(!!customerInfo.activeSubscriptions?.includes(ELITE_PRODUCT_ID));
      } catch (e) {
        setIsPro(false);
        setIsElite(false);
      }
      setLoading(false);
    };
    checkStatus();
  }, []);

  const restore = async () => {
    setLoading(true);
    await Purchases.restorePurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    setIsPro(!!customerInfo.activeSubscriptions?.includes(PRO_PRODUCT_ID));
    setIsElite(!!customerInfo.activeSubscriptions?.includes(ELITE_PRODUCT_ID));
    setLoading(false);
  };

  const purchase = async (tier: 'pro' | 'elite') => {
    setLoading(true);
    const productId = tier === 'elite' ? ELITE_PRODUCT_ID : PRO_PRODUCT_ID;
    try {
      await Purchases.purchaseProduct(productId);
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPro(!!customerInfo.activeSubscriptions?.includes(PRO_PRODUCT_ID));
      setIsElite(!!customerInfo.activeSubscriptions?.includes(ELITE_PRODUCT_ID));
    } catch (e) {}
    setLoading(false);
  };

  return (
    <SubscriptionContext.Provider value={{ isPro, isElite, loading, restore, purchase }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Paywall Component
export const Paywall = () => {
  const { isPro, isElite, loading, purchase, restore } = useSubscription();
  if (loading) return <ActivityIndicator color="#D90429" style={{ margin: 32 }} />;
  return (
    <View style={{ backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, margin: 16 }}>
      <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>Unlock Premium</Text>
      <Text style={{ color: '#fff', marginBottom: 18 }}>Go Pro or Elite for exclusive features, unlimited riffs, and more.</Text>
      <TouchableOpacity
        style={{ backgroundColor: isPro ? '#444' : '#D90429', borderRadius: 8, padding: 14, marginBottom: 10 }}
        disabled={isPro}
        onPress={() => purchase('pro')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Unlock Pro {isPro && '(Active)'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: isElite ? '#444' : '#FFD700', borderRadius: 8, padding: 14, marginBottom: 10 }}
        disabled={isElite}
        onPress={() => purchase('elite')}
      >
        <Text style={{ color: '#1A1A1A', fontWeight: 'bold', fontSize: 16 }}>Unlock Elite {isElite && '(Active)'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={restore} style={{ marginTop: 8 }}>
        <Text style={{ color: '#D90429', textAlign: 'center', textDecorationLine: 'underline' }}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
};

// Usage:
// <SubscriptionProvider>
//   <Paywall />
//   ...rest of app
// </SubscriptionProvider>
