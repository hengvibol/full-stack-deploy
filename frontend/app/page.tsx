'use client'

import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface Item {
  id: number
  name: string
  description: string
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

interface BackendValidationError {
  message?: string
  data?: Record<string, string>
}

interface BackendErrorResponse {
  message?: string
}

export default function Home() {
  const [newItem, setNewItem] = useState({ name: '', description: '' })
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editItem, setEditItem] = useState({ name: '', description: '' })
  const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const backendUrl = rawBackendUrl.replace(/\/$/, '').replace(/\/api$/, '')
  const queryClient = useQueryClient()

  // Fetch items
  const { data, isLoading, error } = useQuery<{ items: Item[]; timestamp: string }>({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<Item[]>>(`${backendUrl}/api/items`)
      return {
        items: response.data.data ?? [],
        timestamp: response.data.timestamp,
      }
    },
  })

  const items = data?.items ?? []
  const backendTimestamp = data?.timestamp

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const response = await axios.post<ApiResponse<Item>>(`${backendUrl}/api/items`, {
        name: item.name.trim(),
        description: item.description.trim(),
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setNewItem({ name: '', description: '' })
    },
  })

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete<ApiResponse<null>>(`${backendUrl}/api/items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name: string; description: string } }) => {
      const response = await axios.put<ApiResponse<Item>>(`${backendUrl}/api/items/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setEditingItemId(null)
      setEditItem({ name: '', description: '' })
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createMutation.mutate({
      name: newItem.name.trim(),
      description: newItem.description.trim(),
    })
  }

  const startEdit = (item: Item) => {
    setEditingItemId(item.id)
    setEditItem({ name: item.name, description: item.description || '' })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditItem({ name: '', description: '' })
  }

  const saveEdit = (id: number) => {
    updateMutation.mutate({
      id,
      payload: {
        name: editItem.name.trim(),
        description: editItem.description.trim(),
      },
    })
  }

  const createErrorMessage = (() => {
    if (!createMutation.error) {
      return null
    }
    if (axios.isAxiosError<BackendValidationError>(createMutation.error)) {
      const validationErrors = createMutation.error.response?.data?.data
      const firstValidationError = validationErrors ? Object.values(validationErrors)[0] : null
      return firstValidationError || createMutation.error.response?.data?.message || createMutation.error.message
    }
    return 'Failed to create item'
  })()

  const loadErrorMessage = (() => {
    if (!error) {
      return null
    }
    if (axios.isAxiosError<BackendErrorResponse>(error)) {
      const status = error.response?.status
      const backendMessage = error.response?.data?.message
      return backendMessage || (status ? `Failed to load items (HTTP ${status})` : error.message)
    }
    return 'Error loading items'
  })()

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Next.js + Spring Boot CI/CD Demo
          </h1>
          <p className="text-xl text-white/90">
            Full Stack Application with Automated Deployments
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Frontend</h3>
            <p className="text-green-600 font-medium">✅ Next.js on Vercel</p>
            <p className="text-sm text-gray-500 mt-2">Auto-deployed via GitHub Actions</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Backend</h3>
            <p className="text-green-600 font-medium">✅ Spring Boot on Render</p>
            <p className="text-sm text-gray-500 mt-2">With PostgreSQL database</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">CI/CD</h3>
            <p className="text-green-600 font-medium">✅ GitHub Actions</p>
            <p className="text-sm text-gray-500 mt-2">Automated build & deploy</p>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {createErrorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                {createErrorMessage}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Items List</h2>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading items...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {loadErrorMessage}. Request URL: {backendUrl}/api/items
            </div>
          )}
          
          {items.length === 0 && (
            <p className="text-center text-gray-500 py-8">No items yet. Add your first item!</p>
          )}
          
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <textarea
                      value={editItem.description}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(item.id)}
                        disabled={updateMutation.isPending || !editItem.name.trim()}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={updateMutation.isPending}
                        className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Created: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        disabled={deleteMutation.isPending}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 transition duration-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Info */}
        <div className="mt-8 text-center text-white/80 text-sm">
          <p>Last deployed: {new Date().toLocaleString()}</p>
          <p className="mt-1">
            Backend time: {backendTimestamp ? new Date(backendTimestamp).toLocaleString() : 'Not available'}
          </p>
          <p className="mt-1">
            Backend API: {backendUrl}
          </p>
        </div>
      </div>
    </main>
  )
}