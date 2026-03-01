import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, BarChart3, BookOpen } from 'lucide-react';
import BitcoinPrice from './BitcoinPrice';

function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header({
  protocolName,
  setProtocolName,
  wallet,
  walletLoading,
  onConnectWallet,
  onDisconnectWallet,
  onGoToDashboard,
  onShowGuide,
  activeView,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Track user interaction
    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Try to play after user interaction
      if (!isPlaying && !isMuted) {
        audio.play().catch(console.log);
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add multiple interaction listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Try immediate autoplay (will likely be blocked)
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay blocked, waiting for user interaction');
        setIsPlaying(false);
      }
    };

    playAudio();

    // Handle audio events
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Loop the audio
      audio.currentTime = 0;
      audio.play();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isMuted, isPlaying]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
      // Try to play if not playing
      if (!isPlaying && userInteracted) {
        audio.play().catch(console.log);
      }
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-btc-border">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 flex items-center justify-center overflow-visible relative">
            <img 
              src="/images/logo.png" 
              alt="BlockForge Logo" 
              className="w-full h-full object-contain scale-[3.4] cursor-pointer hover:scale-[3.6] transition-transform duration-200 relative z-10 translate-y-[10%]"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        {/* Center Bitcoin Price */}
        <div className="flex items-center">
          <BitcoinPrice />
        </div>

        {/* Bitcoin Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Guide button */}
          <button
            onClick={onShowGuide}
            className="px-3 py-1.5 rounded-full border border-neon-blue bg-neon-blue/10 text-xs font-mono text-neon-blue hover:bg-neon-blue/20 hover:border-neon-purple transition-all duration-200"
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
            Guide
          </button>

          {/* Dashboard button - only show on builder view */}
          {activeView === 'builder' && onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="px-3 py-1.5 rounded-full border border-neon-purple bg-neon-purple/10 text-xs font-mono text-neon-purple hover:bg-neon-purple/20 hover:border-neon-blue transition-all duration-200"
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
              Dashboard
            </button>
          )}
          
          {wallet?.connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-btc-border bg-btc-surface">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs font-mono text-gray-400">{shortAddress(wallet.address)}</span>
              <button
                onClick={onDisconnectWallet}
                disabled={walletLoading}
                className="text-[10px] text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={walletLoading}
              className="px-3 py-1.5 rounded-full border border-btc-border bg-btc-surface text-xs font-mono text-gray-300 hover:text-white hover:border-btc-orange disabled:opacity-50"
            >
              {walletLoading ? 'Connecting...' : 'Connect OP_NET'}
            </button>
          )}

          {/* Audio Control */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-lg border border-btc-border bg-btc-surface flex items-center justify-center hover:bg-btc-card transition-all duration-200 group"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-500 group-hover:text-btc-orange transition-colors" />
            ) : (
              <Volume2 className="w-4 h-4 text-btc-orange group-hover:text-white transition-colors" />
            )}
            
            {/* Playing indicator */}
            {isPlaying && !isMuted && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        loop
        muted={isMuted}
        preload="auto"
      />
    </header>
  );
}
