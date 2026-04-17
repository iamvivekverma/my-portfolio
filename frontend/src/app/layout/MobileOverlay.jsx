import { useState, useEffect } from 'react';
import { Monitor, Smartphone, RotateCcw } from 'lucide-react';

export default function MobileOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth <= 500);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleRotate = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {
        console.log('Orientation lock not supported');
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 max-w-sm mx-4 text-white shadow-2xl transform transition-all duration-500 animate-slide-up">
        {/* Content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-white/80 animate-pulse" />
              <Monitor className="w-10 h-10 text-white absolute -bottom-2 -right-2 bg-primary rounded-lg p-1" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold font-baloo">
            Better on Desktop! 🖥️
          </h2>

          {/* Description */}
          <p className="text-white/90 text-sm leading-relaxed">
            Hey there! This portfolio looks amazing on larger screens. 
            For the best experience with all the cool animations and interactions, 
            try viewing it on a desktop or tablet.
          </p>

          {/* Tips */}
          <div className="space-y-3 text-left bg-white/10 rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-2">💡 Quick Tips:</h3>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Rotate your device for a better view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Use desktop mode in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>Visit on a computer for full experience</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={handleRotate}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              Try Landscape Mode
            </button>
          </div>

          {/* Current Screen Info */}
          <div className="text-xs text-white/60 pt-2 border-t border-white/20">
            Current screen: {window.innerWidth}px × {window.innerHeight}px
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full animate-pulse-slow delay-1000"></div>
        </div>
      </div>
    </div>
  );
}

// Add custom animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.5s ease-out 0.2s both;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  
  .delay-1000 {
    animation-delay: 1s;
  }
`;
document.head.appendChild(style);
