export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'subscriber'
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  website_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  description: string | null
  event_date: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  charity_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'lapsed'
  contribution_percentage: number
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  score_date: string
  created_at: string
  updated_at: string
}

export interface Draw {
  id: string
  draw_month: string
  draw_type: 'random' | 'algorithmic'
  status: 'pending' | 'simulated' | 'published'
  winning_numbers: number[]
  jackpot_rollover_amount: number
  total_subscribers: number
  prize_pool_amount: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  user_numbers: number[]
  match_type: '5' | '4' | '3' | '0'
  prize_amount: number
  is_paid: boolean
  created_at: string
}

export interface Winner {
  id: string
  draw_entry_id: string
  user_id: string
  match_type: '5' | '4' | '3'
  prize_amount: number
  verification_status: 'pending' | 'approved' | 'rejected'
  proof_image_url: string | null
  admin_notes: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  user_id: string
  charity_id: string
  amount: number
  created_at: string
}
