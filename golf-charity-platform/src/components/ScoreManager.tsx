'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Score } from '@/types'

export default function ScoreManager() {
  const { user } = useAuth()
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [formData, setFormData] = useState({
    score: '',
    scoreDate: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchScores()
    }
  }, [user])

  const fetchScores = async () => {
    if (!user) return

    setLoading(true)
    const response = await fetch(`/api/scores?userId=${user.id}`)
    const data = await response.json()
    setScores(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const scoreValue = parseInt(formData.score)

    if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    if (!formData.scoreDate) {
      setError('Please select a date')
      return
    }

    const url = editingScore
      ? `/api/scores?scoreId=${editingScore.id}`
      : '/api/scores'
    const method = editingScore ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user?.id,
        score: scoreValue,
        scoreDate: formData.scoreDate,
        scoreId: editingScore?.id,
      }),
    })

    if (response.ok) {
      setFormData({ score: '', scoreDate: '' })
      setShowForm(false)
      setEditingScore(null)
      fetchScores()
    } else {
      const data = await response.json()
      setError(data.error || 'Failed to save score')
    }
  }

  const handleEdit = (score: Score) => {
    setEditingScore(score)
    setFormData({
      score: score.score.toString(),
      scoreDate: score.score_date,
    })
    setShowForm(true)
  }

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return

    const response = await fetch(`/api/scores?scoreId=${scoreId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      fetchScores()
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingScore(null)
    setFormData({ score: '', scoreDate: '' })
    setError('')
  }

  if (loading) {
    return <div className="text-center py-12">Loading scores...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Scores</h2>
          <p className="text-gray-600 mt-1">Last 5 scores (Stableford format)</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Add Score
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {editingScore ? 'Edit Score' : 'Add New Score'}
          </h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (1-45)
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your Stableford score"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.scoreDate}
                onChange={(e) => setFormData({ ...formData, scoreDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                {editingScore ? 'Update Score' : 'Save Score'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {scores.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No scores recorded yet. Add your first score!</p>
          </div>
        ) : (
          scores.map((score) => (
            <div
              key={score.id}
              className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{score.score}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Stableford Score</p>
                    <p className="text-gray-600">
                      {new Date(score.score_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(score)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(score.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
