'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ScoreManager from '@/components/ScoreManager'
import { Subscription, Charity, Winner, Draw } from '@/types'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [charity, setCharity] = useState<Charity | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    setLoading(true)

    // Fetch subscription
    const subResponse = await fetch(`/api/subscriptions?userId=${user.id}`)
    const subData = await subResponse.json()
    setSubscription(subData[0] || null)

    // Fetch charity if subscription exists
    if (subData[0]?.charity_id) {
      const charityResponse = await fetch(`/api/charities/${subData[0].charity_id}`)
      const charityData = await charityResponse.json()
      setCharity(charityData)
    }

    // Fetch winners
    const winnersResponse = await fetch(`/api/winners?userId=${user.id}`)
    const winnersData = await winnersResponse.json()
    setWinners(winnersData)

    // Fetch published draws
    const drawsResponse = await fetch('/api/draws?status=published')
    const drawsData = await drawsResponse.json()
    setDraws(drawsData)

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{profile?.full_name || user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'scores'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scores
          </button>
          <button
            onClick={() => setActiveTab('winnings')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'winnings'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Winnings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            subscription={subscription}
            charity={charity}
            winners={winners}
            draws={draws}
          />
        )}
        {activeTab === 'scores' && <ScoreManager />}
        {activeTab === 'winnings' && <WinningsTab winners={winners} />}
      </div>
    </div>
  )
}

function OverviewTab({
  subscription,
  charity,
  winners,
  draws,
}: {
  subscription: Subscription | null
  charity: Charity | null
  winners: Winner[]
  draws: Draw[]
}) {
  const totalWon = winners.reduce((sum, w) => sum + w.prize_amount, 0)
  const pendingPayouts = winners.filter((w) => w.verification_status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Status</h2>
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {subscription.plan_type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p
                className={`text-lg font-semibold ${
                  subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {subscription.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Renewal Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No active subscription</p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
              Subscribe Now
            </button>
          </div>
        )}
      </div>

      {/* Charity Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Charity</h2>
        {charity ? (
          <div className="flex items-center gap-4">
            {charity.image_url && (
              <img src={charity.image_url} alt={charity.name} className="w-20 h-20 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900">{charity.name}</p>
              <p className="text-gray-600">
                Contribution: {subscription?.contribution_percentage}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No charity selected</p>
        )}
      </div>

      {/* Winnings Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Winnings Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Won</p>
            <p className="text-3xl font-bold text-green-600">${totalWon.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Verification</p>
            <p className="text-3xl font-bold text-purple-600">{pendingPayouts}</p>
          </div>
        </div>
      </div>

      {/* Recent Draws */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Draws</h2>
        {draws.length === 0 ? (
          <p className="text-gray-600">No draws published yet</p>
        ) : (
          <div className="space-y-3">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(draw.draw_month).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Winning Numbers: {draw.winning_numbers.join(', ')}
                  </p>
                </div>
                <span className="text-sm font-medium text-purple-600">
                  ${draw.prize_pool_amount.toFixed(2)} Pool
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WinningsTab({ winners }: { winners: Winner[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Winnings</h2>
      {winners.length === 0 ? (
        <p className="text-gray-600">No winnings yet</p>
      ) : (
        <div className="space-y-4">
          {winners.map((winner) => (
            <div key={winner.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">${winner.prize_amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{winner.match_type}-Number Match</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    winner.verification_status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : winner.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {winner.verification_status}
                </span>
              </div>
              {winner.verification_status === 'pending' && (
                <button className="text-purple-600 font-medium hover:text-purple-700">
                  Upload Proof
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
