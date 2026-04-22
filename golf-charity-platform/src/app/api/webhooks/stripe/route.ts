import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createServiceClient } from '@/lib/supabase/client'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const { userId, charityId, contributionPercentage } = session.metadata || {}

      if (!userId || !charityId || !contributionPercentage) {
        console.error('Missing metadata in checkout session')
        break
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      const sub = subscription as any
      const currentPeriodStart = sub.current_period_start || 0
      const currentPeriodEnd = sub.current_period_end || 0

      // Create or update subscription in database
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        charity_id: charityId,
        plan_type: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
        status: 'active',
        contribution_percentage: parseInt(contributionPercentage),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: session.customer as string,
        current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
        current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end || false,
      })

      if (error) {
        console.error('Failed to create subscription:', error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any
      const customerId = subscription.customer as string
      const sub = subscription as any

      // Get user_id from customer metadata
      const customer = await stripe.customers.retrieve(customerId) as any
      const userId = customer.metadata?.userId

      if (!userId) {
        console.error('Missing userId in customer metadata')
        break
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'cancelled' : 'lapsed',
          current_period_start: new Date((sub.current_period_start || 0) * 1000).toISOString(),
          current_period_end: new Date((sub.current_period_end || 0) * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end || false,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Failed to update subscription:', error)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('Failed to delete subscription:', error)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any
      const subscriptionId = invoice.subscription as string

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
        })
        .eq('stripe_subscription_id', subscriptionId)

      if (error) {
        console.error('Failed to update subscription status:', error)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any
      const subscriptionId = invoice.subscription as string

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'lapsed',
        })
        .eq('stripe_subscription_id', subscriptionId)

      if (error) {
        console.error('Failed to update subscription status:', error)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
