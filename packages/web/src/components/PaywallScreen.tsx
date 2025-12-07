import React from 'react';

const TIERS = [
  {
    name: 'Free',
    price: '0',
    features: [
      'Limited riffs',
      'Basic lessons',
      'Community access',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$7/mo',
    features: [
      'Unlimited riffs',
      'All lessons',
      'Jam tracks',
      'XP tracking',
      'Priority support',
    ],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'Elite',
    price: '$15/mo',
    features: [
      'Everything in Pro',
      'AI feedback',
      'Early access',
      'Exclusive tones',
      'Elite badge',
    ],
    cta: 'Go Elite',
    highlight: false,
  },
];

export const PaywallScreen = () => (
  <div style={{ background: '#111', minHeight: '100vh', color: '#fff', padding: 0 }}>
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px' }}>
      <h1 style={{ color: '#FFD700', fontWeight: 900, fontSize: 36, textAlign: 'center', marginBottom: 8 }}>Unlock Your Metal Journey</h1>
      <p style={{ color: '#ccc', textAlign: 'center', marginBottom: 32 }}>Compare tiers and get the most out of Metal Master.</p>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        {TIERS.map(tier => (
          <div
            key={tier.name}
            style={{
              background: tier.highlight ? 'linear-gradient(135deg, #1A1A1A 80%, #D90429 100%)' : '#18181b',
              border: tier.highlight ? '2px solid #FFD700' : '1px solid #333',
              borderRadius: 18,
              boxShadow: tier.highlight ? '0 0 24px #FFD70044' : '0 2px 12px #D9042940',
              padding: 32,
              minWidth: 240,
              flex: 1,
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <h2 style={{ color: tier.highlight ? '#FFD700' : '#fff', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>{tier.name}</h2>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#D90429', marginBottom: 8 }}>{tier.price}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 24px 0', width: '100%' }}>
              {tier.features.map(f => (
                <li key={f} style={{ color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#FFD700', marginRight: 8 }}>•</span> {f}
                </li>
              ))}
            </ul>
            <button
              style={{
                background: tier.highlight ? 'linear-gradient(90deg, #FFD700 60%, #D90429 100%)' : '#222',
                color: tier.highlight ? '#1A1A1A' : '#FFD700',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                marginTop: 8,
                boxShadow: tier.highlight ? '0 0 12px #FFD70088' : 'none',
                cursor: 'pointer',
                transition: 'filter 0.2s',
                filter: tier.highlight ? 'brightness(1.1)' : 'none',
              }}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, textAlign: 'center', color: '#888', fontSize: 15 }}>
        <span>All prices in USD. Cancel anytime. Secure Stripe billing.</span>
      </div>
    </div>
  </div>
);

// Usage: <PaywallScreen />
