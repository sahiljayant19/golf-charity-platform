'use client'

import { useState, useEffect } from 'react'
import { Charity } from '@/types'

export default function CharityDirectory() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)

  useEffect(() => {
    fetchCharities()
  }, [])

  const fetchCharities = async (search?: string) => {
    setLoading(true)
    let url = '/api/charities'
    if (search) {
      url += `?search=${search}`
    }
    const response = await fetch(url)
    const data = await response.json()
    setCharities(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCharities(searchTerm)
  }

  if (loading) {
    return <div className="text-center py-12">Loading charities...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Partner Charities</h2>
        <p className="text-xl text-gray-600">Support causes that matter to you</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search charities..."
            className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Search
          </button>
        </div>
      </form>

      {/* Featured Charities */}
      {charities.filter((c) => c.is_featured).length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Featured Charities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charities
              .filter((c) => c.is_featured)
              .map((charity) => (
                <CharityCard
                  key={charity.id}
                  charity={charity}
                  onClick={() => setSelectedCharity(charity)}
                />
              ))}
          </div>
        </div>
      )}

      {/* All Charities */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">All Charities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              onClick={() => setSelectedCharity(charity)}
            />
          ))}
        </div>
      </div>

      {/* Charity Detail Modal */}
      {selectedCharity && (
        <CharityDetailModal
          charity={selectedCharity}
          onClose={() => setSelectedCharity(null)}
        />
      )}
    </div>
  )
}

function CharityCard({ charity, onClick }: { charity: Charity; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
    >
      {charity.image_url && (
        <img
          src={charity.image_url}
          alt={charity.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h4>
        <p className="text-gray-600 line-clamp-3">{charity.description}</p>
        <button className="mt-4 text-purple-600 font-medium hover:text-purple-700">
          Learn More →
        </button>
      </div>
    </div>
  )
}

function CharityDetailModal({
  charity,
  onClose,
}: {
  charity: Charity
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{charity.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {charity.image_url && (
            <img src={charity.image_url} alt={charity.name} className="w-full h-64 object-cover rounded-lg mb-4" />
          )}
          <p className="text-gray-600 mb-4">{charity.description}</p>
          {charity.website_url && (
            <a
              href={charity.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
