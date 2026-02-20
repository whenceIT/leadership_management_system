export const TIER_FALLBACK_DATA = {
  user_id: 123,
  current_tier: {
    id: 2,
    name: 'K50K+',
    description: 'Intermediate tier for consistently performing consultants',
    tier_range: 'K50K+',
    minimum_portfolio_value: 50000,
    badge_color: 'blue',
    text_color: 'white'
  },
  next_tier: {
    id: 3,
    name: 'K80K+',
    description: 'Advanced tier for high-performing consultants',
    tier_range: 'K80K+',
    minimum_portfolio_value: 80000,
    badge_color: 'purple',
    text_color: 'white'
  },
  portfolio_summary: {
    current_value: 2300000,
    current_formatted: 'K2.3M',
    required_for_next_tier: 2500000,
    required_formatted: 'K2.5M',
    progress_percentage: 92
  },
  benefits: [
    {
      benefit_type: 'commission_rate',
      description: 'Commission on loans',
      value: '4.5%'
    },
    {
      benefit_type: 'support_level',
      description: 'Dedicated support',
      value: 'Standard'
    }
  ],
  historical_tiers: [
    {
      tier_id: 1,
      tier_name: 'Base',
      effective_from: '2023-01-15',
      effective_to: '2023-03-20'
    },
    {
      tier_id: 2,
      tier_name: 'K50K+',
      effective_from: '2023-03-20',
      effective_to: null
    }
  ]
};

export function createFallbackResponse() {
  return {
    success: true,
    data: TIER_FALLBACK_DATA
  };
}

export function isFallbackData(data: any): boolean {
  return data?.current_tier?.name === TIER_FALLBACK_DATA.current_tier.name;
}
