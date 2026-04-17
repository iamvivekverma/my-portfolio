import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';
import { portfolioApi } from '../services/api';
import { useAbout } from '../hooks/usePortfolioData';

export default function LockedProject() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(['', '', '', '']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const projectId = searchParams.get('id');
  const { data: about } = useAbout();

  const socialLinks = about?.socials
    ? [
        { icon: FaLinkedin,  href: about.socials.linkedin || "https://www.linkedin.com/",  label: "LinkedIn" },
        { icon: FaGithub,    href: about.socials.github || "https://github.com/",       label: "GitHub" },
        { icon: FaInstagram, href: about.socials.instagram || "https://instagram.com/",    label: "Instagram" },
        { icon: FaYoutube,   href: about.socials.youtube || "https://www.youtube.com/",  label: "YouTube" },
      ]
    : [
        { icon: FaLinkedin,  href: "https://www.linkedin.com/", label: "LinkedIn" },
        { icon: FaGithub,    href: "https://github.com/",       label: "GitHub" },
        { icon: FaInstagram, href: "https://instagram.com/",    label: "Instagram" },
        { icon: FaYoutube,   href: "https://www.youtube.com/",  label: "YouTube" },
      ];

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);
    setErrorMessage('');

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verify when all 4 digits are entered
    if (value && index === 3) {
      const completePin = [...newPin];
      completePin[3] = value;
      setTimeout(() => verifyPin(completePin.join('')), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyPin = async (enteredPin) => {
    const pinToVerify = enteredPin || pin.join('');
    if (!pinToVerify || pinToVerify.length < 4) {
      return;
    }

    try {
      const response = await portfolioApi.verifyProjectPin(projectId, pinToVerify);
      
      if (response.success && response.unlocked) {
        setIsUnlocked(true);
        // Navigate to actual project detail page
        navigate(`/project/${projectId}`);
      } else {
        setError(true);
        setErrorMessage(response.message || 'Incorrect PIN');
        
        // Shake animation
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        
        // Clear PIN after shake
        setTimeout(() => {
          setPin(['', '', '', '']);
          const firstInput = document.getElementById('pin-0');
          if (firstInput) firstInput.focus();
        }, 500);
      }
    } catch {
      setError(true);
      setErrorMessage('incorrect pin');
      
      // Shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      // Clear PIN after shake
      setTimeout(() => {
        setPin(['', '', '', '']);
        const firstInput = document.getElementById('pin-0');
        if (firstInput) firstInput.focus();
      }, 500);
    } 
  };

  if (isUnlocked) {
    return null; // Will navigate away
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-[var(--color-bg)] flex flex-col items-center justify-center px-3 md:px-5 overflow-hidden">
      
      {/* Central Illustration */}
      <div className="mb-4 md:mb-6">
        <Motion.img
          src="/assets/images/woww.svg"
          alt="Locked Project"
          className="w-44 h-44 md:w-52 md:h-52"
          animate={{ y: [0, -25, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Locked Message */}
      <div className="text-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          This project is locked
        </h1>
        <p className="text-base md:text-base text-primary/60">
          Please enter the PIN or contact me for more information.
        </p>
      </div>

      {/* PIN Input Fields */}
      {!isUnlocked && (
        <div className={`flex gap-3 md:gap-4 mb-4 md:mb-6 ${isShaking ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              maxLength={1}
              value={pin[index]}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-20 md:w-14 md:h-20 text-center text-2xl md:text-2xl font-bold border-2 rounded-lg outline-none transition-all ${
                error 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-primary focus:border-primary bg-white'
              }`}
              style={{ color: 'var(--color-primary)' }}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm md:text-base mb-3 md:mb-4 font-medium">{errorMessage || 'Incorrect PIN. Please try again.'}</p>
      )}

      {/* Contact Section */}
      <div className="text-center flex flex-col items-center mt-8">
        <h2 className="text-lg md:text-lg font-bold text-primary leading-snug mb-3 md:mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Ready to turn ideas into<br />scalable web solutions?
        </h2>

        <div className="flex flex-col items-center gap-2 mb-4 md:mb-5">
          <a href="mailto:iamvivek.verma@icloud.com" className="text-primary/60 text-base md:text-base hover:text-primary transition">
            iamvivek.verma@icloud.com
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4 md:gap-4">
          {socialLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" title={item.label}
                 className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group">
                <Icon className="w-6 h-6 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
