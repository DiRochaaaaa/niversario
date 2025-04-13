'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Send, UserCheck, Loader2, Flag, ThumbsUp, AlertCircle } from 'lucide-react'
import { launchConfirmationBalloons } from '@/components/ConfirmationBalloons'

export default function ConfirmationForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [vaiAndar, setVaiAndar] = useState<boolean | null>(null)
  const [nivelInteresse, setNivelInteresse] = useState<'baixo' | 'medio' | 'alto' | ''>('')
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

    if (vaiAndar === null) {
      setError('Por favor, indique se vai andar de kart')
      setLoading(false)
      return
    }

    if (!nivelInteresse) {
      setError('Por favor, selecione seu nível de interesse')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('confirmations')
      .insert([{ 
        name, 
        vai_andar: vaiAndar, 
        nivel_interesse: nivelInteresse, 
        status: 'confirmed' 
      }])

    if (error) {
      console.error('Error saving confirmation:', error)
      setError('Erro ao salvar confirmação. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setName('')
    setVaiAndar(null)
    setNivelInteresse('')
    setLoading(false)
    
    // Lançar balões para celebrar a confirmação
    launchConfirmationBalloons()
    
    onSuccess()
  }

  return (
    <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl">
      {/* Efeito de brilho */}
      <div className="absolute -inset-px bg-gradient-to-r from-green-500/30 to-green-400/30 rounded-xl blur opacity-30"></div>
      <div className="relative">
        <div className="flex items-center mb-6">
          <UserCheck className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-2xl font-semibold text-white">Confirme sua presença</h2>
        </div>
        
        <div className="mb-6 bg-amber-900/30 border border-amber-800 text-amber-300 px-4 py-3 rounded-lg text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>A data e horário exatos serão informados em breve. Confirme seu interesse para receber atualizações!</p>
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
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Vai andar de kart?
            </label>
            <div className="flex space-x-4">
              <label className={`flex items-center justify-center px-4 py-3 rounded-lg border ${vaiAndar === true ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-700/60 border-gray-600 text-gray-300'} cursor-pointer transition-all duration-200 hover:bg-gray-700/90 flex-1`}>
                <input
                  type="radio"
                  name="vai_andar"
                  checked={vaiAndar === true}
                  onChange={() => setVaiAndar(true)}
                  className="sr-only"
                />
                <span className="text-xl mr-2">🏎️</span>
                Sim
              </label>
              <label className={`flex items-center justify-center px-4 py-3 rounded-lg border ${vaiAndar === false ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-700/60 border-gray-600 text-gray-300'} cursor-pointer transition-all duration-200 hover:bg-gray-700/90 flex-1`}>
                <input
                  type="radio"
                  name="vai_andar"
                  checked={vaiAndar === false}
                  onChange={() => setVaiAndar(false)}
                  className="sr-only"
                />
                <span className="text-xl mr-2">👋</span>
                Não
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Qual seu nível de interesse?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'baixo', label: 'Baixo', bgColor: 'bg-yellow-600', borderColor: 'border-yellow-500', emoji: '😐' },
                { value: 'medio', label: 'Médio', bgColor: 'bg-blue-600', borderColor: 'border-blue-500', emoji: '😊' },
                { value: 'alto', label: 'Alto', bgColor: 'bg-green-600', borderColor: 'border-green-500', emoji: '🔥' }
              ].map((option) => (
                <label 
                  key={option.value}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg border 
                  ${nivelInteresse === option.value ? `${option.bgColor} ${option.borderColor} text-white` : 'bg-gray-700/60 border-gray-600 text-gray-300'} 
                  cursor-pointer transition-all duration-200 hover:bg-gray-700/90`}
                >
                  <input
                    type="radio"
                    name="nivel_interesse"
                    value={option.value}
                    checked={nivelInteresse === option.value}
                    onChange={() => setNivelInteresse(option.value as 'baixo' | 'medio' | 'alto')}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{option.emoji}</span>
                  {option.label}
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
              <UserCheck className="h-4 w-4 mr-2" />
              Presença confirmada com sucesso!
            </div>
          )}
          
          <Button 
            className="w-full py-6 text-base transition-all duration-150 hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Confirmar presença
              </>
            )}
          </Button>
          
          <p className="text-center text-gray-400 text-sm italic">
            Esperamos você no Kart Atrium para o aniversário do Diego!
          </p>
        </form>
      </div>
    </div>
  )
} 