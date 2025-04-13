'use client'

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import type { Comment } from '@/types/supabase'
import { MessageSquare, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mapeamento de IDs de ícones para emojis
const iconMap: Record<string, string> = {
  'racer': '🏎️',
  'trophy': '🏆',
  'helmet': '⛑️',
  'rocket': '🚀',
  'star': '⭐'
};

export default function CommentsList() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar comentários:', error)
      setError('Erro ao carregar comentários')
      setLoading(false)
      return
    }

    setComments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()

    // Configurar um canal de tempo real para atualizações de comentários
    // Desativando temporariamente o canal realtime para evitar erros de conexão
    /*
    const channel = supabase
      .channel('comments-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments' 
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    */
    
    // Em vez de escutar atualizações em tempo real, vamos fazer polling a cada 30 segundos
    const interval = setInterval(() => {
      fetchComments()
    }, 30000) // 30 segundos
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR
      })
    } catch (e) {
      return 'data desconhecida'
    }
  }

  return (
    <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-white">Comentários</h2>
          </div>
          {comments.length > 0 && (
            <span className="bg-green-600/30 text-green-300 text-sm px-3 py-1 rounded-full">
              {comments.length}
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin mb-3" />
            <p className="text-gray-400">Carregando comentários...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-gray-700/50 rounded-lg p-6 text-center">
            <MessageSquare className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum comentário ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 transition-all duration-300 hover:bg-gray-700/80"
              >
                <div className="flex items-start mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-xl">{iconMap[comment.profile_icon] || '👤'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{comment.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                <div className="pl-[52px]">
                  <p className="text-gray-300 whitespace-pre-wrap break-words">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 