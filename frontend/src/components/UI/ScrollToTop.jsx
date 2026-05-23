import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tokens } from '../../styles/tokens';
import { ArrowUp } from '@phosphor-icons/react';
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCatalog, setIsCatalog] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === '/' || path === '/catalog') {
      setIsCatalog(true);
    } else {
      setIsCatalog(false);
    }
  }, [location]);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility, {
      passive: true,
    });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (
    <>
      <button
        onClick={scrollToTop}
        aria-label="Повернутися вгору"
        className={`adoptify-scroll-top ${isVisible ? 'is-visible' : ''} ${isCatalog ? 'is-catalog' : ''}`}
        style={{
          position: 'fixed',
          width: '48px',
          height: '48px',
          borderRadius: tokens.radiusMd,
          backgroundColor: tokens.brandPrimary,
          color: tokens.bgWhite,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
          zIndex: 999999,
          isolation: 'isolate',
          boxSizing: 'border-box',
        }}
      >
        <ArrowUp size={24} weight="bold" />
      </button>

      <style>{`

        .adoptify-scroll-top {
          bottom: 32px !important;
          right: 32px !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(12px) !important;
          transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) !important;
          -webkit-tap-highlight-color: transparent;
        }

        .adoptify-scroll-top.is-visible {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }

        @media (hover: hover) {
          .adoptify-scroll-top:hover {
            background-color: ${tokens.brandHover || '#C2410C'} !important;
            transform: translateY(-4px) !important;
            box-shadow: 0 8px 24px rgba(234, 88, 12, 0.45) !important;
          }
        }

        .adoptify-scroll-top:active {
          transform: scale(0.95) !important;
        }


        @media (max-width: 480px) {

          .adoptify-scroll-top {
            bottom: 16px !important;
            right: 16px !important;
            width: 42px !important;
            height: 42px !important;
          }

          .adoptify-scroll-top svg {
            width: 20px !important;
            height: 20px !important;
          }



          .adoptify-scroll-top.is-catalog {
            right: 16px !important;
            bottom: 16px !important;
          }
        }
      `}</style>
    </>
  );
};
export default ScrollToTop;
