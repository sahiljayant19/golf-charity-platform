import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
})

export const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || ''
export const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID || ''

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 19.99,
    priceId: MONTHLY_PRICE_ID,
  },
  yearly: {
    name: 'Yearly',
    price: 199.99,
    priceId: YEARLY_PRICE_ID,
    discount: 'Save 17%',
  },
}
