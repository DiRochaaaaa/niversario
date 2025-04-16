'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './MiniKartGame.module.css'

// Tipo para estados visuais agrupados
interface GameView {
  kartX: number;
  kartY: number;
  kartRotation: number;
  obstacles: Array<{x: number, y: number}>;
  score: number;
}

export default function MiniKartGame({ onClose }: { onClose: () => void }) {
  // ===== ESTADOS DO REACT (para rendering) =====
  const [highScore, setHighScore] = useState(0) // High score armazenado
  const [isPlaying, setIsPlaying] = useState(false) // Estado de jogo para renderização
  const [gameOver, setGameOver] = useState(false) // Estado de game over para renderização
  
  // Estados visuais agrupados para minimizar re-renders
  const [gameView, setGameView] = useState<GameView>({
    kartX: 50,
    kartY: 80,
    kartRotation: 0,
    obstacles: [],
    score: 0
  })

  // ===== REFS (para lógica do jogo) =====
  // Refs principais para estado do jogo (independente do ciclo de renderização)
  const isPlayingRef = useRef(false) // Estado de jogo real
  const gameOverRef = useRef(false) // Estado de game over real
  const scoreRef = useRef(0) // Score real

  // Detect mobile device
  const isMobileRef = useRef(false)
  const hasGyroscopeRef = useRef(false)

  // Refs para controle do kart
  const kartRef = useRef({
    x: 50, // Posição X em percentual
    y: 80, // Posição Y em percentual
    width: 10, // Largura em percentual
    height: 16, // Altura em percentual
    speed: 60, // Velocidade em unidades por segundo (não por frame)
    rotation: 0 // Rotação atual
  })
  
  // Refs para controles
  const keysRef = useRef({
    left: false,
    right: false
  })

  // Refs para orientação do dispositivo (giroscópio)
  const orientationRef = useRef({
    gamma: 0, // Inclinação lateral (-90 a 90)
    absolute: false
  })
  
  // Refs para obstáculos
  const obstaclesRef = useRef<{
    x: number,
    y: number,
    width: number,
    height: number
  }[]>([])
  
  // Refs para configurações de jogo
  const obstacleSpeedRef = useRef(60) // Unidades por segundo
  const obstacleWidthRef = useRef(10)
  const obstacleHeightRef = useRef(16)
  const spawnIntervalRef = useRef(1000) // ms
  
  // Refs para controle de tempo
  const lastFrameTimeRef = useRef(0)
  const lastSpawnTimeRef = useRef(0)
  const animationFrameRef = useRef(0)
  
  // Ref para área de jogo
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // ===== EFEITOS =====
  // Detectar dispositivo móvel e giroscópio
  useEffect(() => {
    // Detectar se é dispositivo móvel
    isMobileRef.current = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    // Verificar se o dispositivo suporta orientação
    if (window.DeviceOrientationEvent) {
      hasGyroscopeRef.current = true
      
      // Em iOS 13+ precisamos solicitar permissão
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        hasGyroscopeRef.current = false // Precisa de permissão explícita
      }
    }
  }, [])

  // Carregar high score ao iniciar
  useEffect(() => {
    const savedHighScore = localStorage.getItem('kartHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Remover listener de orientação ao desmontar
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [])
  
  // Sincronizar refs com estados quando isPlaying muda
  useEffect(() => {
    isPlayingRef.current = isPlaying
    
    // Se o jogo iniciou, começar o loop
    if (isPlaying && !animationFrameRef.current) {
      // Ativar o giroscópio se for dispositivo móvel e tiver permissão
      if (isMobileRef.current && hasGyroscopeRef.current) {
        window.addEventListener('deviceorientation', handleDeviceOrientation)
      }
      
      lastFrameTimeRef.current = performance.now()
      lastSpawnTimeRef.current = performance.now()
      gameLoop(performance.now())
    }
    
    // Se o jogo parou, cancelar o loop
    if (!isPlaying && animationFrameRef.current) {
      // Desativar o giroscópio
      if (isMobileRef.current) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
      }
      
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = 0
    }
  }, [isPlaying])
  
  // Sincronizar gameOver ref com estado
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  // ===== EVENTOS =====
  // Controle de orientação do dispositivo (giroscópio)
  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    // Atualizar o estado de orientação
    if (event.gamma !== null) {
      orientationRef.current = {
        gamma: event.gamma, // Inclinação lateral (-90 a 90)
        absolute: event.absolute || false
      }
    }
  }

  // Solicitar permissão para o giroscópio (iOS 13+)
  const requestGyroscopePermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          hasGyroscopeRef.current = true
          // Se o jogo já estiver rodando, adicionar o listener
          if (isPlayingRef.current) {
            window.addEventListener('deviceorientation', handleDeviceOrientation)
          }
          return true
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão para o giroscópio:', error)
      }
      return false
    }
    return true // Se não precisar de permissão, retorna true
  }

  // ===== EVENTOS DE TECLADO =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Controles de movimento
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keysRef.current.left = true
        e.preventDefault()
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keysRef.current.right = true
        e.preventDefault()
      }
      
      // Iniciar jogo
      if (!isPlayingRef.current && (e.key === 'Enter' || e.key === ' ')) {
        startGame()
      }
      
      // Terminar jogo
      if (isPlayingRef.current && e.key === 'Escape') {
        endGame(false)
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keysRef.current.left = false
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keysRef.current.right = false
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // ===== FUNÇÕES DO JOGO =====
  // Iniciar jogo
  const startGame = async () => {
    // Se é mobile com giroscópio mas precisa de permissão
    if (isMobileRef.current && !hasGyroscopeRef.current) {
      const permissionGranted = await requestGyroscopePermission()
      if (!permissionGranted) {
        alert("Precisamos de acesso ao giroscópio para jogar! Por favor, permita o acesso.")
        return
      }
    }
    
    // Resetar todos os estados e refs
    scoreRef.current = 0
    
    // Resetar posição do kart
    kartRef.current = {
      x: 50,
      y: 80,
      width: 10,
      height: 16,
      speed: 60, // Velocidade em unidades por segundo
      rotation: 0
    }
    
    // Limpar obstáculos
    obstaclesRef.current = []
    
    // Resetar controles
    keysRef.current = { left: false, right: false }
    
    // Resetar estado de jogo
    gameOverRef.current = false
    setGameOver(false)
    
    // Atualizar estado visual agrupado
    setGameView({
      kartX: kartRef.current.x,
      kartY: kartRef.current.y,
      kartRotation: 0,
      obstacles: [],
      score: 0
    })
    
    // Iniciar o jogo
    setIsPlaying(true)
    isPlayingRef.current = true
    
    // Inicializar timestamps
    lastFrameTimeRef.current = performance.now()
    lastSpawnTimeRef.current = performance.now()
  }

  // Finalizar jogo
  const endGame = (collided: boolean) => {
    // Atualizar estado de jogo
    isPlayingRef.current = false
    setIsPlaying(false)
    
    // Atualizar estado de game over
    gameOverRef.current = collided
    setGameOver(collided)
    
    // Cancelar animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = 0
    }
    
    // Atualizar high score se necessário
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current)
      localStorage.setItem('kartHighScore', scoreRef.current.toString())
    }
  }

  // Loop principal do jogo
  const gameLoop = (timestamp: number) => {
    try {
      // Verificar se o jogo ainda está rodando
      if (!isPlayingRef.current || gameOverRef.current) {
        return
      }
      
      // Calcular delta time em segundos (para movimento suave)
      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000
      lastFrameTimeRef.current = timestamp
      
      // Limitar deltaTime para evitar saltos grandes se o jogo ficar em segundo plano
      const cappedDelta = Math.min(deltaTime, 0.1)
      
      // ===== ATUALIZAR JOGO =====
      updateKart(cappedDelta)
      spawnObstacles(timestamp)
      updateObstacles(cappedDelta)
      checkCollisions()
      
      // ===== ATUALIZAR VISUAIS - AGRUPADO EM UM ÚNICO SETSTATE =====
      setGameView(prevView => ({
        kartX: kartRef.current.x,
        kartY: kartRef.current.y,
        kartRotation: kartRef.current.rotation,
        obstacles: obstaclesRef.current.map(o => ({ x: o.x, y: o.y })),
        score: scoreRef.current
      }))
      
      // Continuar o loop
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    } catch (error) {
      console.error("Erro no loop do jogo:", error)
      endGame(false)
    }
  }
  
  // Atualizar posição do kart
  const updateKart = (deltaTime: number) => {
    // Calcular limites da pista
    const gameWidth = 100 // Largura percentual
    const trackWidth = gameWidth * 0.6
    const trackX = (gameWidth - trackWidth) / 2
    
    // Movimentar com giroscópio ou teclas
    if (isMobileRef.current && hasGyroscopeRef.current) {
      // Em dispositivos móveis, usar o giroscópio para controlar
      // gamma varia de -90 a 90, normalizar para movimento
      const tilt = orientationRef.current.gamma || 0
      
      // Definir limites para a inclinação
      const maxTilt = 30
      const normalizedTilt = Math.max(-maxTilt, Math.min(tilt, maxTilt)) / maxTilt
      
      // Aplicar movimento baseado na inclinação
      kartRef.current.x += normalizedTilt * kartRef.current.speed * deltaTime * 1.5
      
      // Definir rotação baseada na inclinação
      kartRef.current.rotation = -normalizedTilt * 25 // -25 a 25 graus
    } else {
      // Em desktop, usar as teclas
      // Atualizar rotação do kart baseado nos controles
      if (keysRef.current.left) {
        kartRef.current.rotation = -15
        // Mover para a esquerda
        if (kartRef.current.x > trackX) {
          kartRef.current.x -= kartRef.current.speed * deltaTime;
        }
      } else if (keysRef.current.right) {
        kartRef.current.rotation = 15
        // Mover para a direita
        if (kartRef.current.x + kartRef.current.width < trackX + trackWidth) {
          kartRef.current.x += kartRef.current.speed * deltaTime;
        }
      } else {
        kartRef.current.rotation = 0
      }
    }
    
    // Limitar o kart à pista (independente do controle usado)
    kartRef.current.x = Math.max(
      trackX, 
      Math.min(
        kartRef.current.x, 
        trackX + trackWidth - kartRef.current.width
      )
    )
  }
  
  // Gerar novos obstáculos
  const spawnObstacles = (timestamp: number) => {
    // Verificar se é hora de gerar um novo obstáculo
    if (timestamp - lastSpawnTimeRef.current >= spawnIntervalRef.current) {
      // Calcular limites da pista
      const gameWidth = 100
      const trackWidth = gameWidth * 0.6
      const trackX = (gameWidth - trackWidth) / 2
      
      // Gerar obstáculo em posição aleatória na pista
      const xPos = trackX + Math.random() * (trackWidth - obstacleWidthRef.current)
      
      // Adicionar novo obstáculo
      obstaclesRef.current.push({
        x: xPos,
        y: -obstacleHeightRef.current, // Começa acima da área visível
        width: obstacleWidthRef.current,
        height: obstacleHeightRef.current
      })
      
      // Atualizar timestamp do último spawn
      lastSpawnTimeRef.current = timestamp
    }
  }
  
  // Atualizar posição dos obstáculos
  const updateObstacles = (deltaTime: number) => {
    // Array temporário para armazenar obstáculos que ainda estão na tela
    const remainingObstacles = []
    let pointsGained = 0;
    
    // Para cada obstáculo, usar deltaTime para movimento independente de frame rate
    for (const obs of obstaclesRef.current) {
      // Mover obstáculo para baixo (baseado em deltaTime)
      obs.y += obstacleSpeedRef.current * deltaTime
      
      // Se o obstáculo ainda está na tela
      if (obs.y <= 110) {
        remainingObstacles.push(obs)
      } else {
        // Obstáculo saiu da tela sem colidir = ponto
        pointsGained += 1
      }
    }
    
    // Atualizar pontuação total
    if (pointsGained > 0) {
      scoreRef.current += pointsGained;
    }
    
    // Atualizar lista de obstáculos
    obstaclesRef.current = remainingObstacles
  }
  
  // Verificar colisões
  const checkCollisions = () => {
    // Para cada obstáculo
    for (const obs of obstaclesRef.current) {
      // Verificar colisão (AABB - Axis-Aligned Bounding Box)
      const collision = 
        kartRef.current.x < obs.x + obs.width &&
        kartRef.current.x + kartRef.current.width > obs.x &&
        kartRef.current.y < obs.y + obs.height &&
        kartRef.current.y + kartRef.current.height > obs.y
      
      // Se houve colisão
      if (collision) {
        endGame(true)
        return
      }
    }
  }

  // Instruções do jogo
  const getInstructions = () => {
    if (isMobileRef.current) {
      return (
        <>
          <p>Incline seu dispositivo para mover o kart!</p>
          <div className={styles.instructions}>
            <p>Como jogar:</p>
            <ul>
              <li>Incline para os lados para controlar o kart</li>
              <li>Desvie dos cones!</li>
              <li>Toque na tela para iniciar</li>
            </ul>
          </div>
        </>
      )
    }
    
    return (
      <>
        <p>Use as teclas do teclado para mover o kart!</p>
        <div className={styles.instructions}>
          <p>Como jogar:</p>
          <ul>
            <li>←/A: Mover para Esquerda</li>
            <li>→/D: Mover para Direita</li>
            <li>Espaço/Enter: Iniciar Jogo</li>
            <li>ESC: Terminar Partida</li>
            <li>Desvie dos cones!</li>
          </ul>
        </div>
      </>
    )
  }

  // ===== RENDERIZAÇÃO =====
  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h2>Mini Kart Race</h2>
        <button onClick={onClose} className={styles.closeButton}><X /></button>
      </div>
      
      <div className={styles.gameArea} ref={gameAreaRef}>
        {/* Pista de corrida sempre visível */}
        <div className={styles.raceTrack}></div>
        
        {/* Jogo em andamento */}
        {isPlaying && (
          <>
            {/* Kart do jogador */}
            <div 
              className={styles.kart} 
              style={{ 
                left: `${gameView.kartX}%`, 
                top: `${gameView.kartY}%`,
                transform: `rotate(${gameView.kartRotation}deg)`
              }}
            >
              <div className={styles.kartBody}></div>
              <div className={styles.kartWheelTL}></div>
              <div className={styles.kartWheelTR}></div>
              <div className={styles.kartWheelBL}></div>
              <div className={styles.kartWheelBR}></div>
            </div>
            
            {/* Obstáculos (cones) */}
            {gameView.obstacles.map((obs, index) => (
              <div 
                key={`obs-${index}-${obs.y}`}
                className={styles.obstacle}
                style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
              >
                <div className={styles.coneBody}></div>
              </div>
            ))}
            
            {/* Pontuação atual */}
            <div className={styles.scoreDisplay}>Score: {gameView.score}</div>
          </>
        )}
        
        {/* Tela de Game Over */}
        {!isPlaying && gameOver && (
          <div className={styles.gameOverScreen}>
            <h2>Game Over</h2>
            <p>Seu Score: {gameView.score}</p>
            <button onClick={startGame} className={styles.startButton}>
              Jogar novamente
            </button>
          </div>
        )}
        
        {/* Tela inicial */}
        {!isPlaying && !gameOver && (
          <div className={styles.menuScreen}>
            <h2>Mini Kart Race</h2>
            <p>Score mais alto: {highScore}</p>
            {getInstructions()}
            <button onClick={startGame} className={styles.startButton}>
              Iniciar corrida
            </button>
            
            {/* Botão especial para permissão de giroscópio no iOS */}
            {isMobileRef.current && !hasGyroscopeRef.current && (
              <button 
                onClick={requestGyroscopePermission} 
                className={styles.startButton}
                style={{ marginTop: '10px' }}
              >
                Permitir Giroscópio
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Botão para terminar o jogo */}
      {isPlaying && (
        <div className={styles.gameControls}>
          <button onClick={() => endGame(false)} className={styles.controlButton}>
            Terminar corrida
          </button>
        </div>
      )}
      
      {/* Controles na tela para dispositivos móveis sem giroscópio */}
      {isPlaying && isMobileRef.current && !hasGyroscopeRef.current && (
        <div className={styles.touchControls}>
          <button 
            className={styles.touchButton}
            onTouchStart={() => { keysRef.current.left = true }}
            onTouchEnd={() => { keysRef.current.left = false }}
          >
            ◀
          </button>
          <button 
            className={styles.touchButton}
            onTouchStart={() => { keysRef.current.right = true }}
            onTouchEnd={() => { keysRef.current.right = false }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  )
} 