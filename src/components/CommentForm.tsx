'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Send, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { launchConfirmationBalloons } from '@/components/ConfirmationBalloons'

// Ícones de perfil disponíveis
const profileIcons = [
  { id: 'racer', emoji: '🏎️', label: 'Piloto' },
  { id: 'trophy', emoji: '🏆', label: 'Campeão' },
  { id: 'helmet', emoji: '⛑️', label: 'Capacete' },
  { id: 'rocket', emoji: '🚀', label: 'Veloz' },
  { id: 'star', emoji: '⭐', label: 'Estrela' }
];

export default function CommentForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [profileIcon, setProfileIcon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Por favor, digite seu nome')
      setLoading(false)
      return
    }

    if (!comment.trim()) {
      setError('Por favor, escreva um comentário')
      setLoading(false)
      return
    }

    if (!profileIcon) {
      setError('Por favor, selecione um ícone')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ 
        name, 
        comment, 
        profile_icon: profileIcon
      }])

    if (error) {
      console.error('Erro ao salvar comentário:', error)
      setError('Erro ao salvar comentário. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setName('')
    setComment('')
    setProfileIcon('')
    setLoading(false)
    
    // Lançar balões para celebrar o comentário
    launchConfirmationBalloons()
    
    onSuccess()
  }

  return (
    <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl">
      <div className="absolute -inset-px bg-gradient-to-r from-green-500/30 to-green-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative">
        <div className="flex items-center mb-6">
          <MessageSquare className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Deixe seu comentário</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Digite seu nome"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seu comentário
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
              placeholder="Compartilhe seus pensamentos sobre o evento..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Escolha seu ícone
            </label>
            <div className="grid grid-cols-5 gap-2">
              {profileIcons.map((icon) => (
                <label 
                  key={icon.id}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border 
                  ${profileIcon === icon.id ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-700/60 border-gray-600 text-gray-300'} 
                  cursor-pointer transition-all duration-200 hover:bg-gray-700/90`}
                >
                  <input
                    type="radio"
                    name="profile_icon"
                    value={icon.id}
                    checked={profileIcon === icon.id}
                    onChange={() => setProfileIcon(icon.id)}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{icon.emoji}</span>
                  <span className="text-xs">{icon.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Comentário publicado com sucesso!
            </div>
          )}
          
          <Button 
            className="w-full py-6 text-base transition-all duration-150 hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Publicar comentário
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 