'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './MiniKartGame.module.css'

export default function MiniKartGame({ onClose }: { onClose: () => void }) {
  const [isGyroAvailable, setIsGyroAvailable] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [kartPosition, setKartPosition] = useState({ x: 50, y: 80 })
  const [obstacles, setObstacles] = useState<{x: number, y: number}[]>([])
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
  const [keyboardControls, setKeyboardControls] = useState({ left: false, right: false })
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const lastUpdateTimeRef = useRef<number>(0)
  const obstacleIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobileDevice = useRef<boolean>(false)

  // Verificar o tipo de dispositivo e se o giroscópio está disponível
  useEffect(() => {
    // Detectar se é um dispositivo móvel (heurística simples)
    isMobileDevice.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (window.DeviceOrientationEvent) {
      setIsGyroAvailable(true)
      // Em alguns navegadores (como iOS 13+), o giroscópio precisa de permissão explícita
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setIsGyroAvailable(false) // Precisa de permissão primeiro
      }
    }

    // Recuperar highscore do localStorage
    const savedHighScore = localStorage.getItem('kartHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }

    return () => {
      if (obstacleIntervalRef.current) {
        clearInterval(obstacleIntervalRef.current)
      }
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Solicitar permissão para usar o giroscópio (necessário em alguns navegadores)
  const requestGyroPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setIsGyroAvailable(true)
        } else {
          alert('Precisamos de acesso ao giroscópio para jogar!')
        }
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error)
        alert('Erro ao acessar o giroscópio. Talvez seu dispositivo não suporte esta função.')
      }
    }
  }

  // Lidar com eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        // Iniciar o jogo pressionando Enter ou Espaço se não estiver jogando
        if (e.key === 'Enter' || e.key === ' ') {
          startGame();
          return;
        }
      }
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setKeyboardControls(prev => ({ ...prev, left: true }));
        e.preventDefault(); // Impedir que a página role
        console.log("Tecla esquerda pressionada, controles:", { left: true, right: keyboardControls.right });
      } 
      
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setKeyboardControls(prev => ({ ...prev, right: true }));
        e.preventDefault(); // Impedir que a página role
        console.log("Tecla direita pressionada, controles:", { left: keyboardControls.left, right: true });
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setKeyboardControls(prev => ({ ...prev, left: false }));
        console.log("Tecla esquerda liberada");
      } 
      
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setKeyboardControls(prev => ({ ...prev, right: false }));
        console.log("Tecla direita liberada");
      } 
      
      if (e.key === 'Escape' && isPlaying) {
        // Encerrar o jogo pressionando Escape
        endGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Iniciar o jogo
  const startGame = () => {
    // Se for mobile e o giroscópio não estiver disponível, tentar solicitar permissão
    if (isMobileDevice.current && !isGyroAvailable) {
      requestGyroPermission()
      return
    }

    setIsPlaying(true)
    setScore(0)
    setObstacles([]) // Limpa obstáculos existentes
    setKartPosition({ x: 50, y: 80 })
    lastUpdateTimeRef.current = performance.now()

    // Adicionar listeners para o giroscópio se for dispositivo móvel
    if (isMobileDevice.current) {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    console.log("Iniciando jogo, adicionando obstáculos iniciais");

    // Adicionar vários obstáculos iniciais em diferentes posições
    setObstacles([
      { x: 30, y: -10 },
      { x: 70, y: -30 },
      { x: 50, y: -60 },
      { x: 20, y: -90 }
    ]);

    // Iniciar a geração de obstáculos - mais frequente
    obstacleIntervalRef.current = setInterval(() => {
      console.log("Tentando adicionar novo obstáculo");
      setObstacles(prev => {
        // Adicionar novo obstáculo em posição aleatória na parte superior
        const newObstacle = {
          x: Math.random() * 90 + 5, // entre 5% e 95% da largura
          y: -10 // acima da área visível
        }
        console.log("Adicionando obstáculo:", newObstacle);
        return [...prev, newObstacle]
      })
    }, 800) // Novo obstáculo a cada 800ms (mais frequente)

    // Iniciar loop de animação
    animationRef.current = requestAnimationFrame(updateGameState)
  }

  // Finalizar o jogo
  const endGame = () => {
    setIsPlaying(false)
    if (isMobileDevice.current) {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
    
    if (obstacleIntervalRef.current) {
      clearInterval(obstacleIntervalRef.current)
    }
    
    cancelAnimationFrame(animationRef.current)

    // Atualizar high score se necessário
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('kartHighScore', score.toString())
    }
  }

  // Lidar com a orientação do dispositivo
  const handleOrientation = (event: DeviceOrientationEvent) => {
    // beta é a inclinação frontal (para frente/para trás)
    // gamma é a inclinação lateral (esquerda/direita)
    setOrientation({
      beta: event.beta || 0,
      gamma: event.gamma || 0
    })
  }

  // Atualizar o estado do jogo (loop de animação)
  const updateGameState = (timestamp: number) => {
    if (!isPlaying) return
    
    const deltaTime = timestamp - lastUpdateTimeRef.current
    lastUpdateTimeRef.current = timestamp

    // Console log para debugging
    console.log("Keyboard controls:", keyboardControls);
    console.log("Obstacles:", obstacles.length);

    // Mover o kart com base no controle ativo (giroscópio em mobile, teclado em desktop)
    setKartPosition(prev => {
      // Velocidade base para movimentação do kart
      const baseSpeed = 2.5; // velocidade muito maior
      
      // Calcular a movimentação baseada no controle ativo
      let movement = 0;
      
      if (isMobileDevice.current) {
        // Em dispositivos móveis, usar o giroscópio
        movement = (orientation.gamma || 0) * 0.8 * (deltaTime / 16); // sensibilidade muito maior
      } else {
        // Em desktop, usar as teclas de seta - movimento mais direto
        if (keyboardControls.left) movement = -baseSpeed;
        if (keyboardControls.right) movement = baseSpeed;
      }
      
      // Aplicar o movimento à posição do kart
      let newX = prev.x + movement;
      
      // Limitar o kart à área de jogo
      newX = Math.max(5, Math.min(95, newX)); // entre 5% e 95% da largura
      
      return {
        x: newX,
        y: prev.y
      }
    })

    // Mover obstáculos para baixo - velocidade muito maior
    setObstacles(prev => {
      const obstacleSpeed = 1.0; // Velocidade fixa e muito mais alta
      const updatedObstacles = prev.map(obs => ({
        ...obs,
        y: obs.y + obstacleSpeed
      }))
      
      // Remover obstáculos que saíram da tela
      const filteredObstacles = updatedObstacles.filter(obs => obs.y < 110)
      
      // Para cada obstáculo removido (ultrapassado com sucesso), incrementar pontuação
      const removedCount = updatedObstacles.length - filteredObstacles.length
      if (removedCount > 0) {
        setScore(s => s + removedCount)
      }
      
      return filteredObstacles
    })

    // Verificar colisões
    const kartHitbox = {
      left: kartPosition.x - 5,
      right: kartPosition.x + 5,
      top: kartPosition.y - 8,
      bottom: kartPosition.y + 2
    }

    // Verificar colisão com cada obstáculo
    const collision = obstacles.some(obs => {
      const obsHitbox = {
        left: obs.x - 4,
        right: obs.x + 4,
        top: obs.y - 4,
        bottom: obs.y + 4
      }

      return !(
        kartHitbox.right < obsHitbox.left ||
        kartHitbox.left > obsHitbox.right ||
        kartHitbox.bottom < obsHitbox.top ||
        kartHitbox.top > obsHitbox.bottom
      )
    })

    if (collision) {
      endGame()
      return
    }

    // Continuar o loop de animação
    animationRef.current = requestAnimationFrame(updateGameState)
  }

  // Detectar se está em dispositivo móvel ou desktop para mostrar instruções apropriadas
  const getInstructions = () => {
    if (isMobileDevice.current) {
      return (
        <>
          <p>Incline o celular para mover o kart e desvie dos obstáculos!</p>
          <div className={styles.instructions}>
            <p>Como jogar:</p>
            <ul>
              <li>Incline o celular para os lados para controlar o kart</li>
              <li>Desvie dos cones vermelhos na pista</li>
              <li>A cada obstáculo que você passar, ganha 1 ponto</li>
            </ul>
          </div>
        </>
      );
    } else {
      return (
        <>
          <p>Use as teclas do teclado para mover o kart e desvie dos obstáculos!</p>
          <div className={styles.instructions}>
            <p>Como jogar:</p>
            <ul>
              <li>Use as setas ← → <b>OU</b> as teclas A e D para controlar o kart</li>
              <li>Pressione ESPAÇO ou ENTER para iniciar o jogo</li>
              <li>Pressione ESC para encerrar a partida</li>
              <li>Desvie dos cones vermelhos na pista</li>
              <li>A cada obstáculo que você passar, ganha 1 ponto</li>
            </ul>
          </div>
        </>
      );
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <h2>Mini Kart Race</h2>
        <button onClick={onClose} className={styles.closeButton}><X /></button>
      </div>
      
      <div className={styles.gameArea} ref={gameAreaRef}>
        {isPlaying ? (
          <>
            {/* Pista de corrida com textura */}
            <div className={styles.raceTrack}></div>
            
            {/* Kart do jogador */}
            <div 
              className={styles.kart} 
              style={{ 
                left: `${kartPosition.x}%`, 
                top: `${kartPosition.y}%`,
                transform: keyboardControls.left ? 'rotate(-10deg)' : 
                           keyboardControls.right ? 'rotate(10deg)' : 
                           orientation.gamma ? `rotate(${Math.min(Math.max(orientation.gamma * 0.5, -15), 15)}deg)` : 'rotate(0)'
              }}
            >
              {/* Renderização direta do kart */}
              <div className={styles.kartBody}></div>
              <div className={styles.kartWheelTL}></div>
              <div className={styles.kartWheelTR}></div>
              <div className={styles.kartWheelBL}></div>
              <div className={styles.kartWheelBR}></div>
            </div>
            
            {/* Obstáculos */}
            {obstacles.map((obs, index) => (
              <div 
                key={index}
                className={styles.obstacle}
                style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
              >
                {/* Renderização direta do cone */}
                <div className={styles.coneBody}></div>
              </div>
            ))}
            
            {/* Score */}
            <div className={styles.scoreDisplay}>Score: {score}</div>
            
            {/* Controles na tela para dispositivos móveis sem giroscópio */}
            {isMobileDevice.current && !isGyroAvailable && (
              <div className={styles.touchControls}>
                <button 
                  className={styles.touchButton}
                  onTouchStart={() => setKeyboardControls(prev => ({ ...prev, left: true }))}
                  onTouchEnd={() => setKeyboardControls(prev => ({ ...prev, left: false }))}
                >◀</button>
                <button 
                  className={styles.touchButton}
                  onTouchStart={() => setKeyboardControls(prev => ({ ...prev, right: true }))}
                  onTouchEnd={() => setKeyboardControls(prev => ({ ...prev, right: false }))}
                >▶</button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.menuScreen}>
            <h2>Mini Kart Race</h2>
            <p>Score mais alto: {highScore}</p>
            
            {isMobileDevice.current && !isGyroAvailable ? (
              <div className={styles.errorMessage}>
                <p>Seu dispositivo precisa de giroscópio para melhor experiência.</p>
                <button onClick={requestGyroPermission} className={styles.startButton}>
                  Permitir acesso ao giroscópio
                </button>
              </div>
            ) : (
              <>
                {getInstructions()}
                <button onClick={startGame} className={styles.startButton}>
                  Iniciar corrida
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isPlaying && (
        <div className={styles.gameControls}>
          <button onClick={endGame} className={styles.controlButton}>
            Terminar corrida
          </button>
        </div>
      )}
    </div>
  )
} 