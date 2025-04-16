'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  
  // Estados para dispositivo móvel e giroscópio (agora com useState em vez de ref)
  const [isMobile, setIsMobile] = useState(false)
  const [hasGyroscope, setHasGyroscope] = useState(false)
  const [needsGyroscopePermission, setNeedsGyroscopePermission] = useState(false)

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
  const gameTimeRef = useRef(0) // Tempo de jogo em segundos

  // Refs para controle do kart
  const kartRef = useRef({
    x: 50, // Posição X em percentual
    y: 80, // Posição Y em percentual
    width: 10, // Largura em percentual
    height: 16, // Altura em percentual
    speed: 60, // Velocidade em unidades por segundo
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
    height: number,
    pixelX?: number,
    pixelY?: number,
    pixelWidth?: number,
    pixelHeight?: number
  }[]>([])
  
  // Refs para configurações de jogo
  const initialObstacleSpeedRef = useRef(60) // Velocidade inicial
  const obstacleSpeedRef = useRef(60) // Unidades por segundo
  const initialSpawnIntervalRef = useRef(1000) // Intervalo inicial em ms
  const spawnIntervalRef = useRef(1000) // ms
  const obstacleWidthRef = useRef(10)
  const obstacleHeightRef = useRef(16)
  
  // Refs para controle de tempo
  const lastFrameTimeRef = useRef(0)
  const lastSpawnTimeRef = useRef(0)
  const animationFrameRef = useRef(0)
  
  // Ref para área de jogo
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gameAreaSizeRef = useRef({ width: 0, height: 0 })

  // ===== EFEITOS =====
  // Detectar dispositivo móvel e giroscópio
  useEffect(() => {
    // Detectar se é dispositivo móvel
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(isMobileDevice)
    
    // Verificar se o dispositivo suporta orientação
    const hasDeviceOrientationEvent = 'DeviceOrientationEvent' in window
    
    if (hasDeviceOrientationEvent) {
      // Em iOS 13+ precisamos solicitar permissão
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setNeedsGyroscopePermission(true)
      } else {
        // Em outros dispositivos ou versões mais antigas, giroscópio está disponível diretamente
        setHasGyroscope(true)
      }
    }
  }, [])

  // Carregar high score ao iniciar
  useEffect(() => {
    const savedHighScore = localStorage.getItem('kartHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
    }

    // Limpar quando o componente for desmontado
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
    }
  }, [])

  // Atualizar tamanho da área de jogo quando o componente montar ou redimensionar
  useEffect(() => {
    const updateGameAreaSize = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect()
        gameAreaSizeRef.current = { 
          width: rect.width, 
          height: rect.height 
        }
      }
    }
    
    // Atualizar tamanho inicialmente
    updateGameAreaSize()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', updateGameAreaSize)
    
    // Limpar ao desmontar
    return () => {
      window.removeEventListener('resize', updateGameAreaSize)
    }
  }, [])

  // Adicionar listener de redimensionamento para atualizar dimensões do jogo em tempo real
  useEffect(() => {
    const handleResize = () => {
      updateGameDimensions();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Sincronizar refs com estados quando isPlaying muda
  useEffect(() => {
    isPlayingRef.current = isPlaying
    
    // Se o jogo iniciou, começar o loop
    if (isPlaying && !animationFrameRef.current) {
      // Resetar o tempo de jogo
      gameTimeRef.current = 0
      
      // Ativar o giroscópio se for dispositivo móvel e tiver permissão
      if (isMobile && hasGyroscope) {
        window.addEventListener('deviceorientation', handleDeviceOrientation)
      }
      
      // Atualizar o tamanho da área de jogo
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect()
        gameAreaSizeRef.current = { 
          width: rect.width, 
          height: rect.height 
        }
      }
      
      // Iniciar timestamps
      lastFrameTimeRef.current = performance.now()
      lastSpawnTimeRef.current = performance.now()
      
      // Resetar dificuldade
      obstacleSpeedRef.current = initialObstacleSpeedRef.current
      spawnIntervalRef.current = initialSpawnIntervalRef.current
      
      // Iniciar loop do jogo
      gameLoop(performance.now())
    }
    
    // Se o jogo parou, fazer limpeza
    if (!isPlaying && animationFrameRef.current) {
      // Desativar o giroscópio
      window.removeEventListener('deviceorientation', handleDeviceOrientation)
      
      // Cancelar animation frame
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = 0
    }
  }, [isPlaying, isMobile, hasGyroscope])
  
  // Sincronizar gameOver ref com estado
  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  // ===== CALLBACKS =====
  // Controle de orientação do dispositivo (giroscópio)
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Atualizar o estado de orientação
    if (event.gamma !== null) {
      orientationRef.current = {
        gamma: event.gamma, // Inclinação lateral (-90 a 90)
        absolute: event.absolute || false
      }
    }
  }, [])

  // Solicitar permissão para o giroscópio (iOS 13+)
  const requestGyroscopePermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setHasGyroscope(true)
          setNeedsGyroscopePermission(false)
          
          // Se o jogo já estiver rodando, adicionar o listener
          if (isPlayingRef.current) {
            window.addEventListener('deviceorientation', handleDeviceOrientation)
          }
          return true
        }
      } catch (error) {
        // Erro tratado silenciosamente
      }
      return false
    }
    return true // Se não precisar de permissão, retorna true
  }

  // ===== EVENTOS DE TECLADO E TOQUE =====
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
    // Se é mobile com giroscópio que precisa de permissão
    if (isMobile && needsGyroscopePermission && !hasGyroscope) {
      const permissionGranted = await requestGyroscopePermission()
      if (!permissionGranted) {
        // Continua sem giroscópio, usando controles de toque
        setNeedsGyroscopePermission(false)
      }
    }
    
    // Resetar todos os estados e refs
    scoreRef.current = 0
    gameTimeRef.current = 0
    
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
  }

  // Finalizar jogo
  const endGame = (collided: boolean) => {
    // Se já não está jogando, não fazer nada
    if (!isPlayingRef.current) return
    
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

  // ===== FUNÇÕES UTILITÁRIAS DE COLISÃO =====
  // Função utilitária para obter o DOM Element baseado na ref atual
  const getDOMElementByRef = (ref: React.RefObject<HTMLDivElement>): HTMLElement | null => {
    return ref.current;
  };

  // Função utilitária para converter porcentagem para pixels
  const percentToPixel = (percent: number, dimension: number): number => {
    return (percent / 100) * dimension;
  };

  // Função utilitária para converter pixels para porcentagem
  const pixelToPercent = (pixel: number, dimension: number): number => {
    return (pixel / dimension) * 100;
  };

  // Função para atualizar as dimensões da área de jogo
  const updateGameDimensions = () => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      gameAreaSizeRef.current = { 
        width: rect.width, 
        height: rect.height 
      };
      return rect;
    }
    return null;
  };

  // Função para obter a hitbox real de um elemento
  const getElementHitbox = (
    element: HTMLElement, 
    reduceHitbox: number = 0.95 // Buffer para reduzir a hitbox em 5% por padrão
  ): { x: number, y: number, width: number, height: number } => {
    const rect = element.getBoundingClientRect();
    const width = rect.width * reduceHitbox;
    const height = rect.height * reduceHitbox;
    
    // Aplicar o buffer centralmente para manter o posicionamento
    const xOffset = (rect.width - width) / 2;
    const yOffset = (rect.height - height) / 2;
    
    return {
      x: rect.x + xOffset,
      y: rect.y + yOffset,
      width,
      height
    };
  };

  // Função para verificar colisão entre duas hitboxes (AABB)
  const checkAABBCollision = (box1: any, box2: any): boolean => {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  };

  // Função para obter a hitbox do kart compensando as margens e transformações
  const getKartHitbox = (gameArea: DOMRect | null): { x: number, y: number, width: number, height: number } | null => {
    // Obter todos os elementos kart renderizados
    const kartElements = document.querySelectorAll(`.${styles.kart}`);
    if (kartElements.length > 0 && gameArea) {
      const kartElement = kartElements[0] as HTMLElement;
      const kartHitbox = getElementHitbox(kartElement, 0.9); // Reduzir hitbox do kart em 10%
      
      // Retornar hitbox relativa à área do jogo
      return {
        x: kartHitbox.x - gameArea.x,
        y: kartHitbox.y - gameArea.y,
        width: kartHitbox.width,
        height: kartHitbox.height
      };
    }
    return null;
  };

  // Função para obter as hitboxes de todos os obstáculos
  const getObstacleHitboxes = (gameArea: DOMRect | null): Array<{ x: number, y: number, width: number, height: number, element: HTMLElement }> => {
    const hitboxes: Array<{ x: number, y: number, width: number, height: number, element: HTMLElement }> = [];
    
    if (!gameArea) return hitboxes;
    
    // Obter todos os elementos de obstáculos renderizados
    const obstacleElements = document.querySelectorAll(`.${styles.obstacle}`);
    
    obstacleElements.forEach((obstacleElement) => {
      const element = obstacleElement as HTMLElement;
      const obstacleHitbox = getElementHitbox(element, 0.85); // Reduzir hitbox dos obstáculos em 15%
      
      // Adicionar hitbox relativa à área do jogo
      hitboxes.push({
        x: obstacleHitbox.x - gameArea.x,
        y: obstacleHitbox.y - gameArea.y,
        width: obstacleHitbox.width,
        height: obstacleHitbox.height,
        element
      });
    });
    
    return hitboxes;
  };

  // Função para renderizar hitboxes visualmente (útil para depuração)
  const debugRenderHitboxes = (hitboxes: Array<any>, gameArea: DOMRect | null) => {
    // Remover hitboxes de debug anteriores
    const previousDebugBoxes = document.querySelectorAll('.debug-hitbox');
    previousDebugBoxes.forEach(box => box.remove());
    
    if (!gameArea || !gameAreaRef.current) return;
    
    // Criar e posicionar hitboxes de debug
    hitboxes.forEach(hitbox => {
      const debugElement = document.createElement('div');
      debugElement.className = 'debug-hitbox';
      debugElement.style.position = 'absolute';
      debugElement.style.left = `${hitbox.x}px`;
      debugElement.style.top = `${hitbox.y}px`;
      debugElement.style.width = `${hitbox.width}px`;
      debugElement.style.height = `${hitbox.height}px`;
      debugElement.style.border = '1px solid red';
      debugElement.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      debugElement.style.zIndex = '1000';
      debugElement.style.pointerEvents = 'none';
      
      // Verificar novamente se gameAreaRef.current ainda é válido
      if (gameAreaRef.current) {
        gameAreaRef.current.appendChild(debugElement);
      }
    });
  };

  // Loop principal do jogo
  const gameLoop = (timestamp: number) => {
    try {
      // Verificar se o jogo ainda está rodando
      if (!isPlayingRef.current || gameOverRef.current) {
        return;
      }
      
      // Calcular delta time em segundos (para movimento suave)
      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = timestamp;
      
      // Atualizar tempo total de jogo
      gameTimeRef.current += deltaTime;
      
      // Limitar deltaTime para evitar saltos grandes se o jogo ficar em segundo plano
      const cappedDelta = Math.min(deltaTime, 0.1);
      
      // ===== ATUALIZAR JOGO =====
      updateDifficulty();
      updateKart(cappedDelta);
      spawnObstacles(timestamp);
      updateObstacles(cappedDelta);
      checkCollisions();
      
      // ===== ATUALIZAR VISUAIS - AGRUPADO EM UM ÚNICO SETSTATE =====
      setGameView(prevView => ({
        kartX: kartRef.current.x,
        kartY: kartRef.current.y,
        kartRotation: kartRef.current.rotation,
        obstacles: obstaclesRef.current.map(o => ({ x: o.x, y: o.y })),
        score: scoreRef.current
      }));
      
      // Continuar o loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } catch (error) {
      endGame(false);
    }
  };
  
  // Atualizar dificuldade com base no score e tempo
  const updateDifficulty = () => {
    // Aumentar velocidade baseado no score
    const scoreMultiplier = 1 + Math.min(scoreRef.current / 50, 0.5) // +50% no máximo
    
    // Aumentar velocidade baseado no tempo de jogo
    const timeMultiplier = 1 + Math.min(gameTimeRef.current / 60, 0.5) // +50% depois de 60s
    
    // Aplicar multiplicadores
    obstacleSpeedRef.current = initialObstacleSpeedRef.current * scoreMultiplier * timeMultiplier
    
    // Diminuir intervalo de spawn (mais obstáculos)
    const spawnDivider = Math.max(1, 1 + Math.min(scoreRef.current / 30, 0.7)) // -70% no máximo
    spawnIntervalRef.current = initialSpawnIntervalRef.current / spawnDivider
  }
  
  // Atualizar posição do kart
  const updateKart = (deltaTime: number) => {
    // Usar conversão percentagem para pixels para cálculos mais precisos
    const { width: gameWidth } = gameAreaSizeRef.current
    
    // Calcular limites da pista
    const trackWidthPercent = 60 // 60% da largura em percentual
    const trackXPercent = (100 - trackWidthPercent) / 2 // Posição inicial da pista
    
    // Converter percentagem para pixels
    const trackWidthPixels = (trackWidthPercent / 100) * gameWidth
    const trackXPixels = (trackXPercent / 100) * gameWidth
    
    // Largura do kart em pixels
    const kartWidthPixels = (kartRef.current.width / 100) * gameWidth
    
    // Posição atual do kart em pixels
    const kartXPixels = (kartRef.current.x / 100) * gameWidth
    
    // Movimentar com giroscópio ou teclas
    if (isMobile && hasGyroscope) {
      // Em dispositivos móveis, usar o giroscópio para controlar
      const tilt = orientationRef.current.gamma || 0
      
      // Definir limites para a inclinação
      const maxTilt = 30
      const normalizedTilt = Math.max(-maxTilt, Math.min(tilt, maxTilt)) / maxTilt
      
      // Calcular movimento em pixels
      const movePixels = normalizedTilt * kartRef.current.speed * deltaTime * gameWidth / 100 * 1.5
      const newXPixels = kartXPixels + movePixels
      
      // Converter de volta para percentagem
      kartRef.current.x = (newXPixels / gameWidth) * 100
      
      // Definir rotação baseada na inclinação
      kartRef.current.rotation = -normalizedTilt * 25 // -25 a 25 graus
    } else {
      // Em desktop, usar as teclas
      // Atualizar rotação do kart baseado nos controles
      if (keysRef.current.left) {
        kartRef.current.rotation = -15
        
        // Calcular movimento em pixels
        const movePixels = kartRef.current.speed * deltaTime * gameWidth / 100
        const newXPixels = kartXPixels - movePixels
        
        // Mover apenas se estiver dentro dos limites da pista
        if (newXPixels > trackXPixels) {
          kartRef.current.x = (newXPixels / gameWidth) * 100
        }
      } else if (keysRef.current.right) {
        kartRef.current.rotation = 15
        
        // Calcular movimento em pixels
        const movePixels = kartRef.current.speed * deltaTime * gameWidth / 100
        const newXPixels = kartXPixels + movePixels
        
        // Mover apenas se estiver dentro dos limites da pista
        if (newXPixels + kartWidthPixels < trackXPixels + trackWidthPixels) {
          kartRef.current.x = (newXPixels / gameWidth) * 100
        }
      } else {
        kartRef.current.rotation = 0
      }
    }
    
    // Limitar o kart à pista usando valores em pixels para maior precisão
    const kartXPixelsUpdated = (kartRef.current.x / 100) * gameWidth
    if (kartXPixelsUpdated < trackXPixels) {
      kartRef.current.x = (trackXPixels / gameWidth) * 100
    } else if (kartXPixelsUpdated + kartWidthPixels > trackXPixels + trackWidthPixels) {
      kartRef.current.x = ((trackXPixels + trackWidthPixels - kartWidthPixels) / gameWidth) * 100
    }
  }
  
  // Gerar novos obstáculos
  const spawnObstacles = (timestamp: number) => {
    // Verificar se é hora de gerar um novo obstáculo
    if (timestamp - lastSpawnTimeRef.current >= spawnIntervalRef.current) {
      // Atualizar dimensões do jogo
      const gameArea = updateGameDimensions();
      
      if (!gameArea || !gameAreaRef.current) return;
      
      const { width: gameWidth, height: gameHeight } = gameAreaSizeRef.current;
      
      // Calcular limites da pista
      const trackWidthPercent = 60; // 60% da largura
      const trackXPercent = (100 - trackWidthPercent) / 2;
      
      // Converter para pixels para cálculos mais precisos
      const trackWidthPixels = percentToPixel(trackWidthPercent, gameWidth);
      const trackXPixels = percentToPixel(trackXPercent, gameWidth);
      
      // Obter o estilo do obstáculo para determinar suas dimensões reais
      const obstacleStyle = window.getComputedStyle(document.querySelector(`.${styles.obstacle}`) || document.createElement('div'));
      const obstacleWidth = parseFloat(obstacleStyle.width) || 40; // Valor padrão de 40px
      const obstacleHeight = parseFloat(obstacleStyle.height) || 40; // Valor padrão de 40px
      
      // Compensar as margens
      const marginLeft = parseFloat(obstacleStyle.marginLeft) || -20;
      const marginTop = parseFloat(obstacleStyle.marginTop) || -20;
      
      // Calcular largura efetiva considerando margens
      const effectiveObstacleWidth = obstacleWidth - (marginLeft * 2);
      
      // Gerar posição aleatória dentro da pista (em pixels)
      const xPosPixels = trackXPixels + Math.random() * (trackWidthPixels - effectiveObstacleWidth);
      
      // Converter de volta para percentagem
      const xPos = pixelToPercent(xPosPixels, gameWidth);
      
      // Adicionar novo obstáculo com valores precisos
      obstaclesRef.current.push({
        x: xPos,
        y: -pixelToPercent(obstacleHeight, gameHeight), // Começa acima da área visível
        width: pixelToPercent(effectiveObstacleWidth, gameWidth),
        height: pixelToPercent(obstacleHeight, gameHeight),
        pixelX: xPosPixels,
        pixelY: -obstacleHeight,
        pixelWidth: effectiveObstacleWidth,
        pixelHeight: obstacleHeight
      });
      
      // Atualizar timestamp do último spawn
      lastSpawnTimeRef.current = timestamp;
    }
  }
  
  // Atualizar posição dos obstáculos
  const updateObstacles = (deltaTime: number) => {
    // Atualizar dimensões do jogo
    updateGameDimensions();
    
    const { height: gameHeight } = gameAreaSizeRef.current;
    
    // Array temporário para armazenar obstáculos que ainda estão na tela
    const remainingObstacles = [];
    let pointsGained = 0;
    
    // Para cada obstáculo, usar deltaTime para movimento independente de frame rate
    for (const obs of obstaclesRef.current) {
      // Calcular movimento em pixels
      const movePixels = obstacleSpeedRef.current * deltaTime * gameHeight / 100;
      
      // Atualizar posição em pixels
      if (obs.pixelY !== undefined) {
        obs.pixelY += movePixels;
        obs.y = pixelToPercent(obs.pixelY, gameHeight);
      } else {
        // Fallback caso não tenhamos valores em pixels
        obs.y += obstacleSpeedRef.current * deltaTime;
      }
      
      // Se o obstáculo ainda está na tela
      if (obs.y <= 110) { // Usar margem extra para garantir que saia completamente da tela
        remainingObstacles.push(obs);
      } else {
        // Obstáculo saiu da tela sem colidir = ponto
        pointsGained += 1;
      }
    }
    
    // Atualizar pontuação total
    if (pointsGained > 0) {
      scoreRef.current += pointsGained;
    }
    
    // Atualizar lista de obstáculos
    obstaclesRef.current = remainingObstacles;
  }
  
  // Verificar colisões usando hitboxes reais do DOM
  const checkCollisions = () => {
    // Verificar se o jogo está rodando
    if (!isPlayingRef.current || gameOverRef.current) return;
    
    // Atualizar dimensões do jogo
    const gameArea = updateGameDimensions();
    if (!gameArea) return;
    
    // Obter hitbox do kart usando DOM
    const kartHitbox = getKartHitbox(gameArea);
    if (!kartHitbox) return;
    
    // Obter hitboxes dos obstáculos usando DOM
    const obstacleHitboxes = getObstacleHitboxes(gameArea);
    
    // Ativar esta linha para depuração visual das hitboxes
    // debugRenderHitboxes([kartHitbox, ...obstacleHitboxes], gameArea);

    // Verificar colisão com cada obstáculo
    for (const obstacleHitbox of obstacleHitboxes) {
      const collision = checkAABBCollision(kartHitbox, obstacleHitbox);

    if (collision) {
        // Aplicar efeito de colisão no obstáculo
        obstacleHitbox.element.classList.add(styles.tireHit);
        
        // Aplicar efeito de colisão no kart
        const kartElements = document.querySelectorAll(`.${styles.kart}`);
        if (kartElements.length > 0) {
          const kartElement = kartElements[0] as HTMLElement;
          kartElement.classList.add(styles.collisionFlash);
        }
        
        // Terminar jogo
        endGame(true);
        return;
      }
    }
  }

  // ===== COMPONENTES MEMORIZADOS =====
  // Instruções do jogo memorizadas para evitar re-criação a cada render
  const Instructions = useMemo(() => {
    if (isMobile) {
      if (hasGyroscope) {
        // Mobile com giroscópio
        return (
          <>
            <p>Incline seu dispositivo para mover o kart!</p>
            <div className={styles.instructions}>
              <p>Como jogar:</p>
              <ul>
                <li>Incline para os lados para controlar o kart</li>
                <li>Desvie dos cones na pista</li>
                <li>A cada obstáculo que você passar, ganha 1 ponto</li>
                <li>Toque na tela para iniciar</li>
              </ul>
            </div>
          </>
        )
      } else {
        // Mobile sem giroscópio
        return (
          <>
            <p>Use os botões na tela para mover o kart!</p>
            <div className={styles.instructions}>
              <p>Como jogar:</p>
              <ul>
                <li>Toque nos botões de seta para controlar o kart</li>
                <li>Desvie dos pneus na pista</li>
                <li>A cada obstáculo que você passar, ganha 1 ponto</li>
                <li>Toque na tela para iniciar</li>
              </ul>
            </div>
          </>
        )
      }
    } else {
      // Desktop
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
  }, [isMobile, hasGyroscope])

  // ===== MANIPULADORES DE EVENTOS =====
  // Handler para iniciar o jogo tocando na tela inicial (para dispositivos móveis)
  const handleTouchStart = () => {
    if (!isPlaying && !gameOver) {
      startGame()
    }
  }

  // Touch controls for mobile
  const renderTouchControls = () => {
    return (
      <div className={styles.touchControls}>
        <button
          className={styles.touchButton}
          onTouchStart={() => keysRef.current.left = true} 
          onTouchEnd={() => keysRef.current.left = false}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            className={styles.arrowIcon} 
            fill="none" 
            stroke="currentColor"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <button
          className={styles.touchButton}
          onTouchStart={() => keysRef.current.right = true} 
          onTouchEnd={() => keysRef.current.right = false}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" 
            className={styles.arrowIcon} 
            fill="none" 
            stroke="currentColor"
          >
            <polyline points="9,6 15,12 9,18" />
          </svg>
        </button>
      </div>
    );
  };

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
                key={`obs-${index}-${obs.y.toFixed(2)}`}
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
          <div 
            className={styles.gameOverScreen}
            onTouchStart={handleTouchStart}
          >
            <h2>Game Over</h2>
            <p>Seu Score: {gameView.score}</p>
            <button onClick={startGame} className={styles.startButton}>
              Jogar novamente
            </button>
              </div>
            )}
        
        {/* Tela inicial */}
        {!isPlaying && !gameOver && (
          <div 
            className={styles.menuScreen}
            onTouchStart={handleTouchStart}
          >
            <h2>Mini Kart Race</h2>
            <p>Score mais alto: {highScore}</p>
            
            {Instructions}
            
                <button onClick={startGame} className={styles.startButton}>
                  Iniciar corrida
                </button>
            
            {/* Botão especial para permissão de giroscópio no iOS */}
            {isMobile && needsGyroscopePermission && !hasGyroscope && (
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
      {isPlaying && isMobile && !hasGyroscope && renderTouchControls()}
    </div>
  )
} 