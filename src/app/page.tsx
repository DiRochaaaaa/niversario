'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ConfirmationForm from "@/components/ConfirmationForm"
import ConfirmationsList from "@/components/ConfirmationsList"
import CommentForm from "@/components/CommentForm"
import CommentsList from "@/components/CommentsList"
import { BirthdayBalloons } from "@/components/BirthdayBalloons"
import { ConfirmationBalloons, setConfirmationBalloonsInstance } from "@/components/ConfirmationBalloons"
import { CheckCircle2, MapPin, ExternalLink, Calendar, Clock, AlertCircle, ChevronDown, ChevronUp, Info, User, Map, Check, MessageCircle, Loader2, Users } from 'lucide-react'
import { TextShimmer } from '@/components/ui/text-shimmer'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

// Forçar renderização dinâmica para evitar problemas de pré-renderização com o Supabase
export const dynamic = 'force-dynamic'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshCommentsKey, setRefreshCommentsKey] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [showKartInfo, setShowKartInfo] = useState(false)
  const [confirmations, setConfirmations] = useState<any[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const confirmationBalloonsRef = useRef<{ launchConfirmationBalloons: () => void } | null>(null);

  useEffect(() => {
    setLoaded(true)
    
    // Registrar a instância de balões para uso global
    if (confirmationBalloonsRef.current) {
      setConfirmationBalloonsInstance(confirmationBalloonsRef.current);
    }

    // Carregar confirmações para estatísticas
    fetchConfirmations()
  }, [refreshKey])

  const fetchConfirmations = async () => {
    setLoadingStats(true)
    const { data, error } = await supabase
      .from('confirmations')
      .select('*')

    if (!error && data) {
      setConfirmations(data)
    }
    setLoadingStats(false)
  }

  const getVaiAndarCount = () => {
    return confirmations.filter(c => c.vai_andar).length;
  }

  const handleNewConfirmation = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleNewComment = () => {
    setRefreshCommentsKey(prev => prev + 1)
  }

  const toggleKartInfo = useCallback(() => {
    setShowKartInfo(prev => !prev)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-8 pb-16 relative">
      {/* Background com padrão de quadrados */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header com gradiente */}
        <div className={`py-10 md:py-16 text-center relative ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-green-500/20 to-green-900/20 blur-xl"></div>
          <div className="relative">
            <TextShimmer 
              as="h1" 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3"
              duration={1.5}
              spread={5}
            >
              Aniversário do Diego
              
            </TextShimmer>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Venha comemorar meu aniversário com uma emocionante <span className="text-green-400 font-semibold">corrida de kart</span>!
            </p>
            
            <div className="mt-6">
              <BirthdayBalloons />
            </div>
          </div>
        </div>

        {/* Banner Horizontal */}
        <div className={`mb-10 overflow-hidden rounded-xl relative ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
          <img 
            src="/banner-kart.jpeg" 
            alt="Vamos andar de kart junto no meu aniversário!" 
            className="w-full h-auto object-cover rounded-xl"
          />
        </div>

        {/* Estatísticas de confirmações */}
        <div className={`mb-10 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.18s' }}>
          <div className="relative bg-gray-800/80 backdrop-blur p-3 sm:p-4 rounded-xl border border-gray-700 shadow-xl">
            <div className="absolute -inset-px bg-gradient-to-r from-green-500/30 to-green-400/20 rounded-xl blur opacity-30"></div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:gap-6 px-2 sm:px-4">
                <div className="text-center p-2 sm:p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <p className="text-xs sm:text-sm text-gray-300 mb-1">Total confirmado</p>
                  {loadingStats ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                      <p className="text-xl sm:text-2xl font-bold text-white">{confirmations.length}</p>
                      <p className="text-xs sm:text-sm text-gray-400">pessoas</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center p-2 sm:p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <p className="text-xs sm:text-sm text-gray-300 mb-1">Pilotos confirmados</p>
                  {loadingStats ? (
                    <div className="flex justify-center">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-xl">🏎️</span>
                      <p className="text-xl sm:text-2xl font-bold text-white">{getVaiAndarCount()}</p>
                      <p className="text-xs sm:text-sm text-gray-400">pilotos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do evento */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-10">
          {[
            {
              icon: <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />,
              title: "Data",
              content: "10 de Maio",
              subtext: "Sábado",
              delay: "0.2s"
            },
            {
              icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />,
              title: "Horário",
              content: <div className="flex items-center justify-center"><AlertCircle className="h-4 w-4 text-amber-400 mr-1" /> <span>Pendente</span></div>,
              subtext: "Em breve",
              delay: "0.3s"
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Local",
              content: "Kart Atrium",
              delay: "0.4s"
            }
          ].map((item, index) => (
            <div 
              key={index}
              className={`relative bg-gray-800/80 backdrop-blur p-3 sm:p-6 rounded-lg border border-gray-700 shadow-lg transform transition-all duration-200 hover:scale-[1.02] text-center ${loaded ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ animationDelay: item.delay }}
            >
              <div className="flex flex-col items-center">
                <div className="mb-1 sm:mb-3">{item.icon}</div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-300 mb-1">{item.title}</h3>
                <div className="text-sm sm:text-xl font-semibold text-white">{item.content}</div>
                {item.subtext && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{item.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Localização */}
        <div className={`mb-12 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.45s' }}>
          <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl">
            <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-xl blur opacity-30"></div>
            <div className="relative">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">Localização</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Kart Atrium</h3>
                  <p className="text-gray-300 mb-1">Localizado em: Century Plaza Business (Prédio Comercial)</p>
                  <p className="text-gray-300 mb-4">Av. Alexandre de Gusmão, 291 - Vila Homero Thon, Santo André - SP, 09111-310</p>
                  
                  <a 
                    href="https://www.google.com/maps/place/kart+atrium/data=!4m2!3m1!1s0x94ce69ae2faa9883:0xa3e25c78f3655e52?sa=X&ved=1t:242&ictx=111" 
          target="_blank"
          rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no Google Maps
                  </a>
                </div>
                
                <div className="flex-1 h-64 md:h-auto overflow-hidden rounded-lg border border-gray-600">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.437341413837!2d-46.543331024677556!3d-23.659042678639793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce69ae2faa9883%3A0xa3e25c78f3655e52!2sKart%20atrium!5e0!3m2!1spt-BR!2sbr!4v1699914288487!5m2!1spt-BR!2sbr" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Kartódromo */}
        <div className={`mb-12 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.47s' }}>
          <div className="relative bg-gray-800/80 backdrop-blur p-8 rounded-xl border border-gray-700 shadow-xl">
            <div className="absolute -inset-px bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-xl blur opacity-30"></div>
            <div className="relative">
              <div className="flex items-center mb-6">
                <Info className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">Informações do Kartódromo</h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                Confira abaixo todas as informações importantes sobre o kartódromo, incluindo horários, requisitos, valores e detalhes para nossa corrida. Estas informações ajudarão você a se preparar adequadamente para o evento!
              </p>
              
              <button 
                onClick={toggleKartInfo}
                className="w-full py-3 px-4 mb-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center group animate-pulse-slow"
              >
                {showKartInfo ? (
                  <ChevronUp className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                ) : (
                  <ChevronDown className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                )}
                {showKartInfo ? 'Ocultar informações detalhadas' : 'Clique para ver informações detalhadas'}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showKartInfo ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Localização e Horários</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">📍</span>
                        <span>Estacionamento G2 do Atrium Shopping em Santo André</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">⏰</span>
                        <span>Segunda a sexta: 15h às 22h<br />Sábados, domingos e feriados: 14h às 22h</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Requisitos</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">📏</span>
                        <span>Altura mínima: 1,50m para kart padrão (sem limite máximo)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">⚠️</span>
                        <span>Restrições: Gestantes, pessoas descalças ou com sapato aberto</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">👶</span>
                        <span>Menores de idade devem estar acompanhados pelos pais/responsáveis e portar documento de identidade</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Preços e Pagamento</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">💰</span>
                        <span>30 minutos: R$ 89,00 (todos os dias)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">🧤</span>
                        <span>Luvas e balaclavas são obrigatórios (R$ 12,00 na recepção ou traga o seu)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">💳</span>
                        <span>Pagamento na recepção antes da corrida: dinheiro, débito, crédito à vista ou PIX</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Informações do Grupo</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">👥</span>
                        <span>16+ pilotos: pista exclusiva para o grupo</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">👥</span>
                        <span>15 pilotos ou menos: corrida poderá ser integrada com outros pilotos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">📝</span>
                        <span>Não é necessário adiantar pagamento para fazer a reserva</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className={`md:col-span-2 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <ConfirmationForm onSuccess={handleNewConfirmation} />
          </div>
          <div className={`md:col-span-3 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <ConfirmationsList key={refreshKey} />
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className={`mt-16 mb-16 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.65s' }}>
          <h2 className="text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
            Compartilhe sua empolgação!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <CommentForm onSuccess={handleNewComment} />
            </div>
            <div className="md:col-span-3">
              <CommentsList key={refreshCommentsKey} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex flex-col items-center mt-16 pt-6 border-t border-gray-800 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center text-green-400 mb-3">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <span className="font-medium">Aniversário do Diego</span>
          </div>
          <p className="text-gray-400 text-sm">Esperamos você lá! 🏎️</p>
        </div>
      </div>
      
      {/* Componente de balões invisível para celebrar as confirmações */}
      <ConfirmationBalloons ref={confirmationBalloonsRef} />
    </main>
  )
}
