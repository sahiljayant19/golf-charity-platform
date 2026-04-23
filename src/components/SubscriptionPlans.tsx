'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PLANS } from '@/lib/stripe/config'
import { Charity } from '@/types'

interface SubscriptionPlansProps {
  charities: Charity[]
}

export default function SubscriptionPlans({ charities }: SubscriptionPlansProps) {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedCharity, setSelectedCharity] = useState<string>('')
  const [contributionPercentage, setContributionPercentage] = useState(10)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user || !selectedCharity) return

    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planType === 'monthly' ? PLANS.monthly.priceId : PLANS.yearly.priceId,
          userId: user.id,
          charityId: selectedCharity,
          contributionPercentage,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600">Support a charity while you play</p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              selectedPlan === 'yearly'
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-pink-500 text-white px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Charity Selection */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Your Charity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {charities.map((charity) => (
            <div
              key={charity.id}
              onClick={() => setSelectedCharity(charity.id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedCharity === charity.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {charity.image_url && (
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h4 className="font-bold text-lg text-gray-900">{charity.name}</h4>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{charity.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Percentage */}
      <div className="mb-12 max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Charity Contribution: {contributionPercentage}%
        </h3>
        <input
          type="range"
          min="10"
          max="100"
          value={contributionPercentage}
          onChange={(e) => setContributionPercentage(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>10%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`p-8 rounded-2xl transition-all ${
              selectedPlan === key
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className={selectedPlan === key ? 'text-purple-200' : 'text-gray-600'}>
                /{key === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Track 5 golf scores
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Monthly prize draws
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Support your chosen charity
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe(key as 'monthly' | 'yearly')}
              disabled={!selectedCharity || loading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                selectedPlan === key
                  ? 'bg-white text-purple-600 hover:bg-gray-100'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
