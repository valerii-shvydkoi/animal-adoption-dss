import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PetCard from '../components/UI/PetCard';
import {
  HeartBreak,
  ArrowLeft,
  MagicWand,
  Sparkle,
  ArrowsDownUp,
  PawPrint,
  SignIn,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getStoredFavoriteIds } from '../utils/favoritesStorage';
const tokens = {
  brandPrimary: '#EA580C',
  brandHover: '#C2410C',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  bgWhite: '#FFFFFF',
  bgSurface: '#F8FAFC',
  borderDefault: '#E2E8F0',
  brandPrimaryLight: '#FFF7ED',
  brandPrimaryBorder: '#FFEDD5',
};
const Favorites = () => {
  const [favoritePets, setFavoritePets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = String(role || user?.role || 'USER').toUpperCase();
  const hasQuestionnaireResult = currentRole === 'USER' && !!user?.has_questionnaire_result;
  const shouldGateFavorites =
    user?.isAuthenticated && (currentRole !== 'USER' || !hasQuestionnaireResult);
  const fetchFavorites = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    if (shouldGateFavorites) {
      setFavoritePets([]);
      setLoading(false);
      return;
    }
    const savedIds = getStoredFavoriteIds(user);
    if (savedIds.length === 0) {
      setFavoritePets([]);
      setLoading(false);
      return;
    }
    try {
      const ordering = hasQuestionnaireResult ? '-compatibility_score' : '-created_at';
      const response = await api.get(
        `/pets/batch/?ids=${savedIds.join(',')}&ordering=${ordering}`
      );
      const data = response.data;
      let petsData = data.results ? data.results : data;
      if (hasQuestionnaireResult) {
        petsData.sort((a, b) => {
          const scoreA = a.compatibility_score || 0;
          const scoreB = b.compatibility_score || 0;
          return scoreB - scoreA;
        });
      }
      setFavoritePets(petsData);
    } catch (err) {
      console.error('Не вдалося завантажити обраних тварин:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };
  useEffect(() => {
    fetchFavorites(true);
    const handleUpdate = () => {
      fetchFavorites(false);
    };
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, [user, hasQuestionnaireResult, shouldGateFavorites]);
  const handleCheckCompatibility = () => {
    if (user?.isAuthenticated) {
      navigate('/questionnaire', {
        state: {
          from: '/favorites',
        },
      });
    } else {
      navigate('/login', {
        state: {
          from: location.pathname,
        },
      });
    }
  };
  const isListEmpty = !loading && favoritePets.length === 0;
  const setHasScores = favoritePets.some(
    (pet) => pet.compatibility_score !== undefined && pet.compatibility_score !== null
  );
  return (
    <div
      style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: isListEmpty ? '24px 16px 0px 16px' : '24px 16px 10px 16px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .pet-cards-grid-animated {
          animation: favoritesFadeIn 0.35s ease-out forwards;
        }
        @keyframes favoritesFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .favorites-banner { padding: 24px 20px !important; }
        }

        @media (max-width: 576px) {
          .favorites-title {
            font-size: 28px !important;
          }
          .favorites-subtitle {
            font-size: 14px !important;
          }
          .favorites-banner {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 20px 16px !important;
            border-radius: 16px !important;
            margin-bottom: 24px !important;
            gap: 16px !important;
          }
          .favorites-banner-h3 {
            font-size: 18px !important;
            line-height: 1.35 !important;
          }
          .favorites-banner-desc {
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          .favorites-banner-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 14px 20px !important;
            font-size: 15px !important;
          }
          .favorites-footer-text {
            font-size: 14px !important;
          }
          .favorites-footer-btns {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .favorites-footer-btns a {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
        }


        @media (max-width: 350px) {
          .favorites-title {
            font-size: 24px !important;
          }
          .favorites-subtitle {
            font-size: 13px !important;
          }
          .favorites-banner {
            padding: 16px 12px !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
          }
          .favorites-banner-header {
            align-items: flex-start !important;
          }
          .favorites-banner-h3 {
            font-size: 16px !important;
          }
          .favorites-banner-desc {
            font-size: 12.5px !important;
            line-height: 1.45 !important;
          }
          .favorites-banner-btn {
            padding: 12px 16px !important;
            font-size: 14px !important;
            border-radius: 10px !important;
          }
          .favorites-footer-text {
            font-size: 13px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      <div
        style={{
          marginBottom: '32px',
          borderBottom: `1px solid ${tokens.borderDefault}`,
          paddingBottom: '16px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: tokens.textSecondary,
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = tokens.textPrimary)}
          onMouseOut={(e) => (e.currentTarget.style.color = tokens.textSecondary)}
        >
          <ArrowLeft size={16} weight="bold" /> Повернутися до каталогу
        </Link>
        <h1
          className="favorites-title"
          style={{
            fontSize: '40px',
            color: tokens.textPrimary,
            margin: 0,
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}
        >
          Обрані улюбленці
        </h1>

        <p
          className="favorites-subtitle"
          style={{
            color: tokens.textSecondary,
            fontSize: '16px',
            margin: '4px 0 0 0',
            fontWeight: '400',
          }}
        >
          Тут зберігаються ті, хто торкнувся вашого серця.
        </p>
      </div>

      {shouldGateFavorites ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: tokens.bgWhite,
            borderRadius: '24px',
            border: `1px solid ${tokens.borderDefault}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '640px',
            margin: '20px auto 0 auto',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '18px', color: tokens.brandPrimary }}>
            <MagicWand size={46} weight="bold" />
          </div>
          <h3
            style={{
              margin: '0 0 8px 0',
              color: tokens.textPrimary,
              fontSize: '22px',
              fontWeight: '800',
            }}
          >
            {currentRole === 'USER'
              ? 'Обране відкриється після анкети'
              : 'Обране доступне користувачам каталогу'}
          </h3>
          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '15px',
              color: tokens.textSecondary,
              fontWeight: '400',
              lineHeight: '1.5',
              maxWidth: '520px',
            }}
          >
            {currentRole === 'USER'
              ? 'Заповніть анкету підбору, щоб система могла безпечно показати персональний шорт-лист і пояснення сумісності.'
              : 'Кабінети волонтера, менеджера та адміністратора працюють із заявками, тваринами й аналітикою. Персональне обране використовується тільки для ролі користувача.'}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {currentRole === 'USER' && (
              <Link
                to="/questionnaire"
                state={{ from: '/favorites' }}
                style={{
                  padding: '12px 24px',
                  background: tokens.brandPrimary,
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '15px',
                  boxShadow: '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
                }}
              >
                Пройти анкету
              </Link>
            )}
            <Link
              to="/"
              style={{
                padding: '12px 24px',
                background: tokens.brandPrimaryLight,
                color: tokens.brandPrimary,
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '15px',
                border: `1px solid ${tokens.brandPrimaryBorder}`,
              }}
            >
              До каталогу
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: tokens.textSecondary,
            fontWeight: '600',
          }}
        >
          Завантаження вашої персональної добірки...
        </div>
      ) : favoritePets.length > 0 ? (
        <>
          <div
            className="favorites-banner"
            style={{
              background: setHasScores
                ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              borderRadius: '20px',
              padding: '28px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              border: `1px solid ${setHasScores ? '#BBF7D0' : tokens.brandPrimaryBorder}`,
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                className="favorites-banner-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {setHasScores ? (
                  <ArrowsDownUp size={24} weight="bold" color="#16A34A" />
                ) : (
                  <Sparkle size={24} weight="fill" color={tokens.brandPrimary} />
                )}
                <h3
                  className="favorites-banner-h3"
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    color: setHasScores ? '#166534' : tokens.brandPrimary,
                    fontWeight: '800',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {setHasScores
                    ? 'Результати інтелектуального підбору (СППР)'
                    : 'Система підтримки прийняття рішень (СППР)'}
                </h3>
              </div>

              <p
                className="favorites-banner-desc"
                style={{
                  margin: 0,
                  color: setHasScores ? '#14532D' : '#9A3412',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  fontWeight: '500',
                  wordBreak: 'break-word',
                }}
              >
                {setHasScores
                  ? `Математична модель успішно розрахувала багатокритеріальну сумісність. Ваш шорт-ліст автоматично відсортовано: хвостики з найвищим індексом відповідності вашому профілю знаходяться на початку списку.`
                  : favoritePets.length === 1
                    ? 'Бажаєте дізнатися, наскільки цей улюбленець відповідне вашим житловим умовам та способу життя? Запустіть інтелектуальний аналіз. Математична модель зіставить параметри анкети для прийняття зваженого рішення.'
                    : `Вагаєтесь, хто з цих ${favoritePets.length} хвостиків підійде вам найкраще? Запустіть багатокритеріальний аналіз відповідності. Система порівняє параметри кожного хвостика з вашим профілем.`}
              </p>
            </div>

            <button
              onClick={handleCheckCompatibility}
              className="favorites-banner-btn"
              style={{
                background: setHasScores ? '#16A34A' : tokens.brandPrimary,
                color: '#FFF',
                border: 'none',
                padding: '16px 28px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: setHasScores
                  ? '0 8px 20px -5px rgba(22, 163, 74, 0.4)'
                  : '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = setHasScores ? '#15803D' : tokens.brandHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = setHasScores ? '#16A34A' : tokens.brandPrimary;
              }}
            >
              <MagicWand size={20} weight="bold" />
              {setHasScores
                ? 'Оновити анкету підбору'
                : user?.isAuthenticated
                  ? 'Розрахувати сумісність'
                  : 'Увійти для аналізу СППР'}
            </button>
          </div>

          <div
            className="pet-cards-grid-animated"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: '24px',
              marginBottom: '20px',
              boxSizing: 'border-box',
            }}
          >
            {favoritePets.map((pet) => (
              <Link
                to={`/pet/${pet.id}`}
                key={pet.id}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <PetCard pet={pet} context="favorites" />
              </Link>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              padding: '12px 16px 4px 16px',
              borderTop: `1px solid ${tokens.borderDefault}`,
            }}
          >
            <p
              className="favorites-footer-text"
              style={{
                margin: '0 0 16px 0',
                color: tokens.textSecondary,
                fontSize: '15px',
                fontWeight: '500',
                lineHeight: '1.5',
              }}
            >
              {user?.isAuthenticated
                ? 'Бажаєте подивитися інших тварин або розширити свій вибір?'
                : 'Бажаєте зберегти цей список обраних назавжди та підключити математичні алгоритми аналізу сумісності СППР?'}
            </p>

            <div
              className="favorites-footer-btns"
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  color: tokens.brandPrimary,
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '15px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: tokens.brandPrimaryLight,
                  border: `1px solid ${tokens.brandPrimaryBorder}`,
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = tokens.brandPrimaryBorder;
                  e.currentTarget.style.color = tokens.brandHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = tokens.brandPrimaryLight;
                  e.currentTarget.style.color = tokens.brandPrimary;
                }}
              >
                <PawPrint size={18} weight="bold" />
                Перейти до каталогу тварин
              </Link>

              {!user?.isAuthenticated && (
                <Link
                  to="/login"
                  state={{
                    from: location.pathname,
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '15px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: tokens.textPrimary,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#334155';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = tokens.textPrimary;
                  }}
                >
                  <SignIn size={18} weight="bold" />
                  Увійти або зареєструватися
                </Link>
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: tokens.bgWhite,
            borderRadius: '24px',
            border: `1px solid ${tokens.borderDefault}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '600px',
            margin: '20px auto 0 auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              marginBottom: '20px',
              color: tokens.textSecondary,
            }}
          >
            <HeartBreak size={48} weight="regular" />
          </div>
          <h3
            style={{
              margin: '0 0 8px 0',
              color: tokens.textPrimary,
              fontSize: '22px',
              fontWeight: '800',
            }}
          >
            Список порожній
          </h3>
          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '15px',
              color: tokens.textSecondary,
              fontWeight: '400',
              lineHeight: '1.5',
            }}
          >
            Ви ще не додали жодного хвостика до закладок. Перегляньте каталог та оберіть тих, хто
            вам сподобався.
          </p>
          <Link
            to="/"
            style={{
              padding: '12px 28px',
              background: tokens.brandPrimary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '15px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 25px -5px rgba(234, 88, 12, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(234, 88, 12, 0.4)';
            }}
          >
            Знайти друга
          </Link>
        </div>
      )}
    </div>
  );
};
export default Favorites;
