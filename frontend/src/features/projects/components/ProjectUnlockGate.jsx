import { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';
import { portfolioApi } from '../../../services/api';
import { useAbout } from '../../../hooks/usePortfolioData';

function getUnlockErrorMessage(error) {
  if (error?.status === 401) {
    return 'Incorrect PIN';
  }

  if (error?.status === 404) {
    return 'Project not found';
  }

  return error?.message || 'Unable to unlock this project right now.';
}

export default function ProjectUnlockGate({ projectId, onUnlock }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  const { data: about } = useAbout();

  const socialLinks = about?.socials
    ? [
        { icon: FaLinkedin, href: about.socials.linkedin || 'https://www.linkedin.com/', label: 'LinkedIn' },
        { icon: FaGithub, href: about.socials.github || 'https://github.com/', label: 'GitHub' },
        { icon: FaInstagram, href: about.socials.instagram || 'https://instagram.com/', label: 'Instagram' },
        { icon: FaYoutube, href: about.socials.youtube || 'https://www.youtube.com/', label: 'YouTube' },
      ]
    : [
        { icon: FaLinkedin, href: 'https://www.linkedin.com/', label: 'LinkedIn' },
        { icon: FaGithub, href: 'https://github.com/', label: 'GitHub' },
        { icon: FaInstagram, href: 'https://instagram.com/', label: 'Instagram' },
        { icon: FaYoutube, href: 'https://www.youtube.com/', label: 'YouTube' },
      ];

  function focusInput(index) {
    inputRefs.current[index]?.focus();
  }

  function resetPinWithError(message) {
    setError(true);
    setErrorMessage(message);
    setIsShaking(true);

    window.setTimeout(() => {
      setIsShaking(false);
      setPin(['', '', '', '']);
      focusInput(0);
    }, 500);
  }

  async function verifyPin(enteredPin) {
    if (enteredPin.length !== 4 || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await portfolioApi.verifyProjectPin(projectId, enteredPin);

      if (!response?.success || !response?.unlocked) {
        resetPinWithError(response?.message || 'Incorrect PIN');
        return;
      }

      await onUnlock({
        accessToken: response.accessToken || '',
        expiresAt: response.expiresAt || null,
      });
    } catch (requestError) {
      resetPinWithError(getUnlockErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  function handlePinChange(index, rawValue) {
    const value = rawValue.replace(/\D/g, '');

    if (value.length > 1) {
      return;
    }

    const nextPin = [...pin];
    nextPin[index] = value;

    setPin(nextPin);
    setError(false);
    setErrorMessage('');

    if (value && index < nextPin.length - 1) {
      focusInput(index + 1);
    }

    if (nextPin.every(Boolean)) {
      window.setTimeout(() => {
        verifyPin(nextPin.join(''));
      }, 100);
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !pin[index] && index > 0) {
      focusInput(index - 1);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-3 md:px-5 overflow-hidden">
      <div className="mb-4 md:mb-6">
        <Motion.img
          src="/assets/images/woww.svg"
          alt="Locked Project"
          className="w-44 h-44 md:w-52 md:h-52"
          animate={{ y: [0, -25, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="text-center mb-4 md:mb-6">
        <h1
          className="text-2xl md:text-3xl font-black text-primary mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          This project is locked
        </h1>
        <p className="text-base md:text-base text-primary/60">
          Enter the 4-digit PIN to view the protected case study.
        </p>
      </div>

      <div className={`flex gap-3 md:gap-4 mb-4 md:mb-6 ${isShaking ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            type="password"
            inputMode="numeric"
            pattern="\d*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={pin[index]}
            onChange={(event) => handlePinChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            disabled={submitting}
            className={`w-14 h-20 md:w-14 md:h-20 text-center text-2xl md:text-2xl font-bold border-2 rounded-lg outline-none transition-all ${
              error ? 'border-red-500 bg-red-50' : 'border-primary focus:border-primary bg-white'
            } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={{ color: 'var(--color-primary)' }}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm md:text-base mb-3 md:mb-4 font-medium">
          {errorMessage || 'Incorrect PIN. Please try again.'}
        </p>
      )}

      {!error && submitting && (
        <p className="text-primary/60 text-sm md:text-base mb-3 md:mb-4 font-medium">
          Unlocking project...
        </p>
      )}

      <div className="text-center flex flex-col items-center mt-8">
        <h2
          className="text-lg md:text-lg font-bold text-primary leading-snug mb-3 md:mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Need access or want to discuss the work?
        </h2>

        <div className="flex flex-col items-center gap-2 mb-4 md:mb-5">
          <a
            href={`mailto:${about?.email || 'iamvivek.verma@icloud.com'}`}
            className="text-primary/60 text-base md:text-base hover:text-primary transition"
          >
            {about?.email || 'iamvivek.verma@icloud.com'}
          </a>
        </div>

        <div className="flex gap-4 md:gap-4">
          {socialLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
              >
                <Icon className="w-6 h-6 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
