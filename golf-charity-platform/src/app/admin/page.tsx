'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Profile, Charity, Draw, Winner } from '@/types'

export default function AdminDashboard() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<Profile[]>([])
  const [charities, setCharities] = useState<Charity[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPrizePool: 0,
    charityContributions: 0,
  })

  useEffect(() => {
    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchAdminData()
  }, [profile])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [usersRes, charitiesRes, drawsRes, winnersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/charities'),
        fetch('/api/draws'),
        fetch('/api/winners'),
      ])

      const usersData = await usersRes.json()
      const charitiesData = await charitiesRes.json()
      const drawsData = await drawsRes.json()
      const winnersData = await winnersRes.json()

      setUsers(usersData)
      setCharities(charitiesData)
      setDraws(drawsData)
      setWinners(winnersData)

      // Calculate stats
      const activeSubs = usersData.filter((u: any) => u.subscriptions?.[0]?.status === 'active').length
      setStats({
        totalUsers: usersData.length,
        totalPrizePool: drawsData.reduce((sum: number, d: Draw) => sum + d.prize_pool_amount, 0),
        charityContributions: activeSubs * 19.99 * 0.1,
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('draws')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'draws'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Draws
          </button>
          <button
            onClick={() => setActiveTab('charities')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'charities'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Charities
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'winners'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Winners
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab users={users} />}
        {activeTab === 'draws' && <DrawsTab draws={draws} onRefresh={fetchAdminData} />}
        {activeTab === 'charities' && <CharitiesTab charities={charities} onRefresh={fetchAdminData} />}
        {activeTab === 'winners' && <WinnersTab winners={winners} onRefresh={fetchAdminData} />}
      </div>
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
        <p className="text-4xl font-bold text-purple-600">{stats.totalUsers}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Prize Pool</h3>
        <p className="text-4xl font-bold text-green-600">${stats.totalPrizePool.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Charity Contributions</h3>
        <p className="text-4xl font-bold text-pink-600">${stats.charityContributions.toFixed(2)}</p>
      </div>
    </div>
  )
}

function UsersTab({ users }: { users: Profile[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.full_name || '-'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DrawsTab({ draws, onRefresh }: { draws: Draw[]; onRefresh: () => void }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ drawMonth: '', drawType: 'random' })

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (response.ok) {
      setShowCreateModal(false)
      onRefresh()
    }
  }

  const handlePublishDraw = async (drawId: string) => {
    const response = await fetch(`/api/draws/${drawId}/publish`, { method: 'POST' })
    if (response.ok) {
      onRefresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Draw Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Create Draw
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-4">
          {draws.map((draw) => (
            <div key={draw.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(draw.draw_month).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {draw.draw_type} | Subscribers: {draw.total_subscribers}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pool: ${draw.prize_pool_amount.toFixed(2)} | Jackpot Rollover: ${draw.jackpot_rollover_amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      draw.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : draw.status === 'simulated'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {draw.status}
                  </span>
                  {draw.status === 'pending' && (
                    <button
                      onClick={() => handlePublishDraw(draw.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Winning Numbers: {draw.winning_numbers.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Draw</h3>
            <form onSubmit={handleCreateDraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Draw Month
                </label>
                <input
                  type="month"
                  value={formData.drawMonth}
                  onChange={(e) => setFormData({ ...formData, drawMonth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Draw Type
                </label>
                <select
                  value={formData.drawType}
                  onChange={(e) => setFormData({ ...formData, drawType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="random">Random</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CharitiesTab({ charities, onRefresh }: { charities: Charity[]; onRefresh: () => void }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    websiteUrl: '',
    isFeatured: false,
  })

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (response.ok) {
      setShowCreateModal(false)
      onRefresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Charity Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Add Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-white rounded-2xl shadow-lg p-6">
            {charity.image_url && (
              <img src={charity.image_url} alt={charity.name} className="w-full h-40 object-cover rounded-lg mb-4" />
            )}
            <h3 className="font-bold text-lg text-gray-900 mb-2">{charity.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{charity.description}</p>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  charity.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {charity.is_active ? 'Active' : 'Inactive'}
              </span>
              {charity.is_featured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  Featured
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Charity</h3>
            <form onSubmit={handleCreateCharity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function WinnersTab({ winners, onRefresh }: { winners: Winner[]; onRefresh: () => void }) {
  const handleVerify = async (winnerId: string, status: 'approved' | 'rejected') => {
    const response = await fetch(`/api/winners/${winnerId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (response.ok) {
      onRefresh()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Winner Verification</h2>
      <div className="space-y-4">
        {winners.map((winner) => (
          <div key={winner.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">${winner.prize_amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{winner.match_type}-Number Match</p>
                {winner.admin_notes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {winner.admin_notes}</p>
                )}
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
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleVerify(winner.id, 'approved')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleVerify(winner.id, 'rejected')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
