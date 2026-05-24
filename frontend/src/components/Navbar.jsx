import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../hooks/usePWA';
import {
  Heart,
  User,
  UserCircle,
  ChartBar,
  Tray,
  HandHeart,
  ShieldCheck,
  SignOut,
  PawPrint,
  ClipboardText,
  List,
  SignIn,
  DownloadSimple,
  ChartLineUp,
  Storefront,
  ShieldWarning,
  UsersThree,
  TerminalWindow,
} from '@phosphor-icons/react';
import { tokens } from '../styles/tokens';
import { getStoredFavoriteIds } from '../utils/favoritesStorage';
const Navbar = () => {
  const { user, logout, role } = useAuth();
  const { isInstallable, promptInstall } = usePWA();
  const location = useLocation();
  const navigate = useNavigate();
  const roleUpper = role ? role.toUpperCase() : '';
  const isAdmin = roleUpper === 'ADMIN';
  const isVolunteer = roleUpper === 'VOLUNTEER';
  const isShelterManager = roleUpper === 'SHELTER_MANAGER';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [favCount, setFavCount] = useState(0);
  const menuRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const updateFavCount = () => {
    const favs = getStoredFavoriteIds(user);
    setFavCount(favs.length);
  };
  useEffect(() => {
    updateFavCount();
    window.addEventListener('favoritesUpdated', updateFavCount);
    return () => window.removeEventListener('favoritesUpdated', updateFavCount);
  }, [user]);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, role, user?.email]);
  const getActiveIndex = () => {
    if (location.pathname === '/' || location.pathname === '/catalog') return 0;
    if (location.pathname.startsWith('/questionnaire')) return 1;
    return -1;
  };
  const activeIndex = getActiveIndex();
  const getDisplayUsername = () => {
    if (!user) return 'Користувач';
    const nameFromProfile = user.name || user.first_name || user.profile?.first_name;
    const finalName =
      nameFromProfile && nameFromProfile.trim() !== ''
        ? nameFromProfile
        : user.email && typeof user.email === 'string'
          ? user.email.split('@')[0]
          : '';
    if (!finalName) {
      return 'Користувач';
    }
    return finalName.length > 22 ? finalName.substring(0, 20) + '...' : finalName;
  };
  const displayName = getDisplayUsername();
  const avatarContent =
    displayName !== 'Користувач' ? (
      displayName.charAt(0).toUpperCase()
    ) : (
      <User size={16} weight="bold" />
    );
  const dropdownItemClassName = 'adoptify-dropdown-item';
  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    margin: '4px 8px',
    borderRadius: '8px',
    color: '#F8FAFC',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    width: 'calc(100% - 16px)',
    boxSizing: 'border-box',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  };
  const navPadding = isMobile ? '0 16px' : windowWidth <= 1024 ? '0 24px' : '0 40px';
  const adminColor = '#EF4444';
  const shelterColor = '#A855F7';
  const volunteerColor = '#06B6D4';
  const systemColor = '#10B981';
  const isLinkActive = (path) => location.pathname === path;
  return (
    <>
      <nav
        className="nav-container"
        aria-label="Головна навігація"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: navPadding,
          height: '64px',
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
          boxShadow: lastScrollYRef.current > 20 ? '0 8px 25px rgba(0, 0, 0, 0.15)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Link
              to="/"
              aria-label="На головну сторінку Adoptify"
              className="nav-logo"
              style={{
                textDecoration: 'none',
                fontSize: isMobile ? '20px' : '22px',
                fontWeight: '900',
                color: tokens.bgWhite,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'center',
                transition: 'font-size 0.3s',
              }}
            >
              Adoptify
            </Link>
          </div>

          {!isMobile && (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '14px',
                width: '280px',
                margin: '0 20px',
              }}
            >
              {activeIndex !== -1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    bottom: '4px',
                    left: '4px',
                    width: 'calc(50% - 4px)',
                    background: tokens.brandPrimary,
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
                    transform: `translateX(${activeIndex * 100}%)`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              )}
              <Link
                to="/"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '50%',
                  textAlign: 'center',
                  padding: '8px 0',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  color: activeIndex === 0 ? tokens.bgWhite : '#F1F5F9',
                  transition: 'color 0.3s',
                }}
              >
                Каталог
              </Link>

              <Link
                to="/questionnaire"
                onClick={(e) => {
                  if (!user?.isAuthenticated) {
                    e.preventDefault();
                    setIsAuthModalOpen(true);
                  }
                }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '50%',
                  textAlign: 'center',
                  padding: '8px 0',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  color: activeIndex === 1 ? tokens.bgWhite : '#F1F5F9',
                  transition: 'color 0.3s',
                }}
              >
                Анкета
              </Link>
            </div>
          )}

          <div
            className="nav-right-actions"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: isMobile ? '12px' : '16px',
              transition: 'gap 0.3s',
            }}
          >
            <Link
              to="/favorites"
              aria-label="Перейти до обраних тварин"
              className="nav-btn-heart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            >
              <Heart
                size={20}
                weight={favCount > 0 ? 'fill' : 'bold'}
                color={favCount > 0 ? tokens.brandPrimary : '#CBD5E1'}
              />
              {favCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: tokens.brandPrimary,
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0F172A',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {favCount}
                </div>
              )}
            </Link>

            {user?.isAuthenticated ? (
              <div
                style={{
                  position: 'relative',
                }}
                ref={menuRef}
              >
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="Меню профілю"
                  className="user-menu-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '35px',
                    padding: '4px 12px 4px 4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isMenuOpen) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = isMenuOpen
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent')
                  }
                >
                  <div
                    className="user-avatar"
                    style={{
                      background: isAdmin
                        ? `linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)`
                        : `linear-gradient(135deg, ${tokens.brandHover} 0%, ${tokens.brandPrimary} 100%)`,
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '900',
                      boxShadow: isAdmin
                        ? '0 2px 8px rgba(239, 68, 68, 0.4)'
                        : '0 2px 8px rgba(234, 88, 12, 0.3)',
                      transition: 'all 0.3s',
                    }}
                  >
                    {avatarContent}
                  </div>
                  {!isMobile && (
                    <span
                      style={{
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '600',
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isAdmin ? 'Адміністратор' : displayName}
                    </span>
                  )}
                  <span
                    style={{
                      color: '#94A3B8',
                      fontSize: '10px',
                      transition: '0.3s',
                      transform: isMenuOpen ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    ▼
                  </span>
                </button>

                {isMenuOpen && (
                  <div
                    className="adoptify-nav-dropdown"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: 0,
                      width: isMobile ? '230px' : '260px',
                      background: '#1E293B',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                      padding: '8px 0',
                      maxHeight: 'calc(100dvh - 88px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      animation: 'fadeIn 0.15s ease-out',
                      zIndex: 10000,
                    }}
                  >
                    {isMobile && (
                      <>
                        <div
                          style={{
                            padding: '10px 20px 6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#94A3B8',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Навігація
                        </div>
                        <Link
                          to="/"
                          className={dropdownItemClassName}
                          style={{
                            ...dropdownItemStyle,
                            color: isLinkActive('/') ? tokens.brandPrimary : '#F8FAFC',
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <PawPrint
                            size={18}
                            color={isLinkActive('/') ? tokens.brandPrimary : '#94A3B8'}
                            weight={isLinkActive('/') ? 'fill' : 'duotone'}
                          />
                          Каталог тварин
                        </Link>
                        <Link
                          to="/questionnaire"
                          className={dropdownItemClassName}
                          style={{
                            ...dropdownItemStyle,
                            color: isLinkActive('/questionnaire') ? tokens.brandPrimary : '#F8FAFC',
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ClipboardText
                            size={18}
                            color={isLinkActive('/questionnaire') ? tokens.brandPrimary : '#94A3B8'}
                            weight={isLinkActive('/questionnaire') ? 'fill' : 'duotone'}
                          />
                          Анкета підбору
                        </Link>
                        <div
                          style={{
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            margin: '8px',
                          }}
                        ></div>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <div
                          style={{
                            padding: '10px 20px 6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: adminColor,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Адмін-панель
                        </div>
                        <Link
                          to="/admin/dashboard"
                          className="adoptify-dropdown-item admin-item"
                          style={{
                            ...dropdownItemStyle,
                            color: adminColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShieldWarning
                            size={18}
                            color={adminColor}
                            weight={isLinkActive('/admin/dashboard') ? 'fill' : 'duotone'}
                          />
                          Глобальна аналітика
                        </Link>
                        <Link
                          to="/admin/shelters"
                          className="adoptify-dropdown-item admin-item"
                          style={{
                            ...dropdownItemStyle,
                            color: adminColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Storefront
                            size={18}
                            color={adminColor}
                            weight={isLinkActive('/admin/shelters') ? 'fill' : 'duotone'}
                          />
                          Реєстр притулків
                        </Link>
                        <Link
                          to="/admin/users"
                          className="adoptify-dropdown-item admin-item"
                          style={{
                            ...dropdownItemStyle,
                            color: adminColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UsersThree
                            size={18}
                            color={adminColor}
                            weight={isLinkActive('/admin/users') ? 'fill' : 'duotone'}
                          />
                          Користувачі та Ролі
                        </Link>
                        <Link
                          to="/admin/logs"
                          className="adoptify-dropdown-item admin-item"
                          style={{
                            ...dropdownItemStyle,
                            color: adminColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <TerminalWindow
                            size={18}
                            color={adminColor}
                            weight={isLinkActive('/admin/logs') ? 'fill' : 'duotone'}
                          />
                          Логи та Помилки
                        </Link>
                        <div
                          style={{
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            margin: '8px',
                          }}
                        ></div>
                      </>
                    )}

                    <div
                      style={{
                        padding: '10px 20px 6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#94A3B8',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Особисті дані
                    </div>
                    <Link
                      to="/profile"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/profile') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle
                        size={18}
                        color={isLinkActive('/profile') ? tokens.brandPrimary : '#94A3B8'}
                        weight={isLinkActive('/profile') ? 'fill' : 'duotone'}
                      />
                      Мій профіль
                    </Link>
                    <Link
                      to="/my-results"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/my-results') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ChartBar
                        size={18}
                        color={isLinkActive('/my-results') ? tokens.brandPrimary : '#94A3B8'}
                        weight={isLinkActive('/my-results') ? 'fill' : 'duotone'}
                      />
                      Мої результати
                    </Link>
                    <Link
                      to="/my-requests"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/my-requests') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Tray
                        size={18}
                        color={isLinkActive('/my-requests') ? tokens.brandPrimary : '#94A3B8'}
                        weight={isLinkActive('/my-requests') ? 'fill' : 'duotone'}
                      />
                      Мої заявки
                    </Link>

                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        margin: '8px',
                      }}
                    ></div>

                    {!isVolunteer && !isShelterManager && !isAdmin && (
                      <div
                        style={{
                          padding: '4px 0',
                        }}
                      >
                        <div
                          style={{
                            padding: '4px 20px 6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#94A3B8',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Партнерство
                        </div>

                        <Link
                          to="/become-volunteer"
                          className={dropdownItemClassName}
                          style={{
                            ...dropdownItemStyle,
                            color: isLinkActive('/become-volunteer')
                              ? tokens.brandPrimary
                              : '#F8FAFC',
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <HandHeart
                            size={18}
                            color={
                              isLinkActive('/become-volunteer') ? tokens.brandPrimary : '#94A3B8'
                            }
                            weight={isLinkActive('/become-volunteer') ? 'fill' : 'duotone'}
                          />
                          Стати волонтером
                        </Link>

                        <Link
                          to="/register-shelter"
                          className={dropdownItemClassName}
                          style={{
                            ...dropdownItemStyle,
                            color: isLinkActive('/register-shelter')
                              ? tokens.brandPrimary
                              : '#F8FAFC',
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Storefront
                            size={18}
                            color={
                              isLinkActive('/register-shelter') ? tokens.brandPrimary : '#94A3B8'
                            }
                            weight={isLinkActive('/register-shelter') ? 'fill' : 'duotone'}
                          />
                          Зареєструвати притулок
                        </Link>

                        <div
                          style={{
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            margin: '8px',
                          }}
                        ></div>
                      </div>
                    )}

                    {isShelterManager && (
                      <>
                        <div
                          style={{
                            padding: '10px 20px 6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: shelterColor,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Кабінет Притулку
                        </div>
                        <Link
                          to="/shelter/dashboard"
                          className="adoptify-dropdown-item shelter-item"
                          style={{
                            ...dropdownItemStyle,
                            color: shelterColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ChartLineUp
                            size={18}
                            color={shelterColor}
                            weight={isLinkActive('/shelter/dashboard') ? 'fill' : 'duotone'}
                          />
                          Аналітика
                        </Link>
                        <Link
                          to="/shelter/pets"
                          className="adoptify-dropdown-item shelter-item"
                          style={{
                            ...dropdownItemStyle,
                            color: shelterColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Storefront
                            size={18}
                            color={shelterColor}
                            weight={isLinkActive('/shelter/pets') ? 'fill' : 'duotone'}
                          />
                          Управління тваринами
                        </Link>
                        <Link
                          to="/shelter/team"
                          className="adoptify-dropdown-item shelter-item"
                          style={{
                            ...dropdownItemStyle,
                            color: shelterColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User
                            size={18}
                            color={shelterColor}
                            weight={isLinkActive('/shelter/team') ? 'fill' : 'duotone'}
                          />
                          Управління командою
                        </Link>
                        <Link
                          to="/shelter/applications"
                          className="adoptify-dropdown-item shelter-item"
                          style={{
                            ...dropdownItemStyle,
                            color: shelterColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ClipboardText
                            size={18}
                            color={shelterColor}
                            weight={isLinkActive('/shelter/applications') ? 'fill' : 'duotone'}
                          />
                          Заявки на волонтерство
                        </Link>
                        <div
                          style={{
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            margin: '8px',
                          }}
                        ></div>
                      </>
                    )}

                    {isVolunteer && (
                      <>
                        <div
                          style={{
                            padding: '10px 20px 6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: volunteerColor,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Панель волонтера
                        </div>

                        <Link
                          to="/volunteer/pets"
                          className="adoptify-dropdown-item volunteer-item"
                          style={{
                            ...dropdownItemStyle,
                            color: volunteerColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <PawPrint
                            size={18}
                            color={volunteerColor}
                            weight={isLinkActive('/volunteer/pets') ? 'fill' : 'duotone'}
                          />
                          Мої підопічні
                        </Link>

                        <Link
                          to="/volunteer/adoptions"
                          className="adoptify-dropdown-item volunteer-item"
                          style={{
                            ...dropdownItemStyle,
                            color: volunteerColor,
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShieldCheck
                            size={18}
                            color={volunteerColor}
                            weight={isLinkActive('/volunteer/adoptions') ? 'fill' : 'duotone'}
                          />
                          Заявки на адаптацію
                        </Link>
                        <div
                          style={{
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            margin: '8px',
                          }}
                        ></div>
                      </>
                    )}

                    <div
                      style={{
                        padding: '10px 20px 6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#64748B',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Система та сесія
                    </div>

                    {isInstallable && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          promptInstall();
                        }}
                        className="adoptify-dropdown-item pwa-item"
                        style={{
                          ...dropdownItemStyle,
                          color: systemColor,
                        }}
                      >
                        <DownloadSimple size={18} color={systemColor} weight="bold" />
                        Встановити додаток
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="adoptify-dropdown-item logout-item"
                      style={{
                        ...dropdownItemStyle,
                        color: '#F87171',
                      }}
                    >
                      <SignOut size={18} color="#F87171" weight="duotone" />
                      Вийти з акаунту
                    </button>
                  </div>
                )}
              </div>
            ) : isMobile ? (
              <div
                style={{
                  position: 'relative',
                }}
                ref={menuRef}
              >
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="Головне меню"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isMenuOpen
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <List size={20} weight="bold" />
                </button>

                {isMenuOpen && (
                  <div
                    className="adoptify-nav-dropdown"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      right: 0,
                      width: '230px',
                      background: '#1E293B',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                      padding: '8px 0',
                      maxHeight: 'calc(100dvh - 88px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      animation: 'fadeIn 0.15s ease-out',
                      zIndex: 10000,
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 20px 6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#94A3B8',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Навігація
                    </div>
                    <Link
                      to="/"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PawPrint
                        size={18}
                        color={isLinkActive('/') ? tokens.brandPrimary : '#94A3B8'}
                        weight={isLinkActive('/') ? 'fill' : 'duotone'}
                      />
                      Каталог тварин
                    </Link>

                    <Link
                      to="/questionnaire"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/questionnaire') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        if (!user?.isAuthenticated) {
                          e.preventDefault();
                          setIsAuthModalOpen(true);
                        }
                      }}
                    >
                      <ClipboardText
                        size={18}
                        color={isLinkActive('/questionnaire') ? tokens.brandPrimary : '#94A3B8'}
                        weight={isLinkActive('/questionnaire') ? 'fill' : 'duotone'}
                      />
                      Анкета підбору
                    </Link>

                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        margin: '8px',
                      }}
                    ></div>

                    <div
                      style={{
                        padding: '10px 20px 6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#64748B',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Система
                    </div>

                    {isInstallable && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          promptInstall();
                        }}
                        className="adoptify-dropdown-item pwa-item"
                        style={{
                          ...dropdownItemStyle,
                          color: systemColor,
                        }}
                      >
                        <DownloadSimple size={18} color={systemColor} weight="bold" />
                        Встановити Adoptify
                      </button>
                    )}

                    <Link
                      to="/login"
                      className={dropdownItemClassName}
                      style={{
                        ...dropdownItemStyle,
                        color: isLinkActive('/login') ? tokens.brandPrimary : '#F8FAFC',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <SignIn
                        size={18}
                        color={isLinkActive('/login') ? tokens.brandPrimary : '#94A3B8'}
                        weight="bold"
                      />
                      Увійти
                    </Link>
                    <Link
                      to="/register"
                      className="adoptify-dropdown-item register-item"
                      style={{
                        ...dropdownItemStyle,
                        color: tokens.brandPrimary,
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={18} color={tokens.brandPrimary} weight="bold" />
                      Реєстрація
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="nav-guest-menu"
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <Link
                  to="/login"
                  className="nav-btn-login"
                  style={{
                    textDecoration: 'none',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                    padding: '6px',
                  }}
                  onMouseOver={(e) => (e.target.style.color = tokens.brandPrimary)}
                  onMouseOut={(e) => (e.target.style.color = '#FFFFFF')}
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="nav-btn-register"
                  style={{
                    textDecoration: 'none',
                    background: tokens.brandPrimary,
                    color: tokens.bgWhite,
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '8px 24px',
                    borderRadius: '100px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = tokens.brandHover;
                    e.target.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = tokens.brandPrimary;
                    e.target.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.25)';
                  }}
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isAuthModalOpen && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card">
            <div className="auth-modal-icon">
              <PawPrint size={32} weight="fill" color={tokens.brandPrimary} />
            </div>

            <h3 className="auth-modal-title">Вхід до акаунту</h3>
            <p className="auth-modal-text">
              Щоб заповнити анкету та підібрати ідеальну тваринку, будь ласка, авторизуйтеся. Це
              необхідно для збереження ваших відповідей та результатів системи підтримки прийняття
              рішень (СППР).
            </p>

            <div
              className="auth-modal-btn-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  navigate('/login', {
                    state: {
                      from: '/questionnaire',
                    },
                  });
                }}
                style={{
                  background: tokens.brandPrimary,
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = tokens.brandHover;
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = tokens.brandPrimary;
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.25)';
                }}
              >
                Увійти до акаунту
              </button>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                style={{
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
         @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        html, body {
          -webkit-text-size-adjust: 100%;
        }

        .nav-container {
          will-change: transform;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .adoptify-dropdown-item {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          touch-action: manipulation;
        }

        @media (hover: hover) {
          .adoptify-dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          .adoptify-dropdown-item.admin-item:hover {
            background-color: rgba(239, 68, 68, 0.12) !important;
          }
          .adoptify-dropdown-item.pwa-item:hover {
            background-color: rgba(16, 185, 129, 0.15) !important;
          }
          .adoptify-dropdown-item.register-item:hover {
            background-color: rgba(234, 88, 12, 0.1) !important;
          }
          .adoptify-dropdown-item.volunteer-item:hover {
            background-color: rgba(6, 182, 212, 0.12) !important;
          }
          .adoptify-dropdown-item.shelter-item:hover {
            background-color: rgba(168, 85, 247, 0.15) !important;
          }
          .adoptify-dropdown-item.logout-item:hover {
            background-color: rgba(239, 68, 68, 0.1) !important;
          }
        }

        .adoptify-dropdown-item:active {
          background-color: rgba(255, 255, 255, 0.1) !important;
          transform: scale(0.98);
        }

        .adoptify-nav-dropdown {
          max-width: calc(100vw - 24px) !important;
          max-height: calc(100vh - 85px) !important;
          overflow-y: auto !important;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-btn-heart, .user-menu-btn, .nav-logo, .auth-modal-btn-group button {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .auth-modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(15, 23, 42, 0.4) !important;
          backdrop-filter: blur(6px) !important;
          -webkit-backdrop-filter: blur(6px) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          box-sizing: border-box !important;
          padding: 16px !important;
          z-index: 99999 !important;
        }

        .auth-modal-card {
          background: #FFFFFF !important;
          border-radius: 24px !important;
          border: 1px solid #E2E8F0 !important;
          padding: 32px !important;
          width: 100% !important;
          max-width: 400px !important;
          text-align: center !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-sizing: border-box !important;
          max-height: 85dvh !important;
          overflow-y: auto !important;
          margin: 0 auto !important;
        }

        .auth-modal-icon {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 64px;
          height: 64px;
          margin: 0 auto 16px auto !important;
          background: rgba(234, 88, 12, 0.1);
          border-radius: 16px;
        }

        @media (max-width: 480px) {
          .auth-modal-card {
            padding: 24px 20px !important;
            border-radius: 20px !important;
          }
          .auth-modal-title { font-size: 19px !important; margin-bottom: 8px !important; letter-spacing: -0.02em !important; }
          .auth-modal-text { font-size: 13.5px !important; line-height: 1.5 !important; margin-bottom: 24px !important; word-break: break-word !important; }
        }


        @media (max-width: 350px), (max-height: 600px) {
          .nav-container { padding: 0 8px !important; }
          .nav-logo { font-size: 17px !important; letter-spacing: -0.5px !important; }
          .nav-right-actions { gap: 6px !important; }

          .nav-btn-heart { width: 34px !important; height: 34px !important; }

          .nav-guest-menu { gap: 4px !important; }
          .nav-btn-login { font-size: 12px !important; padding: 4px !important; }
          .nav-btn-register { font-size: 12px !important; padding: 6px 12px !important; letter-spacing: -0.5px !important; }

          .user-menu-btn { padding: 2px 8px 2px 2px !important; gap: 4px !important; }
          .user-avatar { width: 28px !important; height: 28px !important; font-size: 12px !important; }

          .auth-modal-card {
            padding: 20px 16px !important;
            border-radius: 16px !important;
            max-height: 82dvh !important;
          }
          .auth-modal-icon {
            width: 48px !important;
            height: 48px !important;
            margin-bottom: 12px !important;
          }
          .auth-modal-icon svg {
            width: 24px !important;
            height: 24px !important;
          }
          .auth-modal-title {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .auth-modal-text {
            font-size: 13px !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
          }
          .auth-modal-btn-group {
            gap: 8px !important;
          }
          .auth-modal-btn-group button {
            padding: 12px !important;
            font-size: 14px !important;
            border-radius: 10px !important;
          }
        }
      `}</style>
    </>
  );
};
export default Navbar;
