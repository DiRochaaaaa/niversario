'use client'

import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import type { Confirmation } from '@/types/supabase'
import { Users, Loader2, UserCheck2, Flag, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ConfirmationsList() {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfirmations = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('confirmations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching confirmations:', error)
      setError('Erro ao carregar confirmações')
      setLoading(false)
      return
    }

    setConfirmations(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchConfirmations()
  }, [])

  const getInterestBadge = (interesse: string) => {
    switch (interesse) {
      case 'baixo':
        return <span className="bg-yellow-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center"><span className="mr-1">😐</span> Baixo</span>;
      case 'medio':
        return <span className="bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center"><span className="mr-1">😊</span> Médio</span>;
      case 'alto':
        return <span className="bg-green-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center"><span className="mr-1">🔥</span> Alto</span>;
      default:
        return null;
    }
  };

  const getKartBadge = (vaiAndar: boolean) => {
    if (vaiAndar) {
      return <span className="bg-green-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center"><span className="mr-1">🏎️</span> Vai andar</span>;
    }
    return <span className="bg-red-600/80 text-white text-xs px-2 py-1 rounded-full flex items-center"><span className="mr-1">👋</span> Não vai andar</span>;
  };

  const getVaiAndarCount = () => {
    return confirmations.filter(c => c.vai_andar).length;
  };

  return (
    <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl h-full">
      {/* Efeito de brilho */}
      <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-xl blur opacity-30"></div>
      <div className="relative">
        <div className="flex items-center mb-6">
          <Users className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Confirmados</h2>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin mb-3" />
            <p className="text-gray-400">Carregando confirmações...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : confirmations.length === 0 ? (
          <div className="bg-gray-700/50 rounded-lg p-6 text-center">
            <Users className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma confirmação ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Seja o primeiro a confirmar!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {confirmations.map((confirmation) => (
                <div
                  key={confirmation.id}
                  className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center transform transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/80 gap-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                      <UserCheck2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="font-medium text-white">{confirmation.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-11 sm:ml-0">
                    {getKartBadge(confirmation.vai_andar)}
                    {getInterestBadge(confirmation.nivel_interesse)}
                    <div className="bg-green-600/60 text-white text-xs px-2 py-1 rounded-full">
                      Confirmado
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Total confirmado</p>
                <p className="bg-green-600/30 text-green-300 font-medium text-sm px-3 py-1 rounded-full">
                  {confirmations.length} {confirmations.length === 1 ? 'pessoa' : 'pessoas'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Vão andar de kart</p>
                <p className="bg-green-600/30 text-green-300 font-medium text-sm px-3 py-1 rounded-full">
                  {getVaiAndarCount()} {getVaiAndarCount() === 1 ? 'pessoa' : 'pessoas'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 