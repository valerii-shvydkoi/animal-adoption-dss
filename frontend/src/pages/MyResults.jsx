import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import ResultsList from '../components/Results/ResultsList';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  PawPrint,
  WarningCircle,
  CheckCircle,
  Brain,
  X,
  PaperPlaneTilt,
  MagnifyingGlass,
  Info,
} from '@phosphor-icons/react';
const brandPrimary = '#EA580C';
const brandPrimaryLight = '#FFF7ED';
const textPrimary = '#0F172A';
const textSecondary = '#64748B';
const borderDefault = '#E2E8F0';
const bgSurface = '#F8FAFC';
const bgWhite = '#FFFFFF';
const priorityTranslations = {
  shelter: 'Безпека та укриття',
  activity: 'Рівень активності',
  social: 'Соціальність та контактність',
  stress: 'Стресостійкість (спокій)',
  floor: 'Поверх (проживання без ліфта)',
  weight: 'Габарити тварини (вага)',
  evacuation: 'Легкість евакуації',
  age: 'Вік тварини',
  character: 'Особливості характеру',
};
const StaticStyles = () => (
  <style>{`
    .results-page-wrapper {
      max-width: 1280px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', sans-serif;
      display: flex; flex-direction: column; gap: 24px;
    }
    .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    .analysis-card {
      background: ${bgWhite}; padding: 24px 32px; border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid ${borderDefault};
      display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden;
    }

    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
      animation: fadeInOverlay 0.3s ease;
    }
    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }

    .modal-content {
      background: ${bgWhite}; padding: 32px; border-radius: 24px; width: 100%; max-width: 540px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative;
      max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
      animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes slideUpModal { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: ${bgSurface}; border-radius: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 8px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

    .action-buttons { display: flex; gap: 12px; justify-content: flex-end; margin-top: 10px; }

    @media (max-width: 640px) {
      .results-page-wrapper { padding: 20px 16px; }
      .page-title { font-size: 24px !important; }
      .analysis-card { padding: 20px; border-radius: 16px; }
      .modal-content { padding: 24px; border-radius: 20px; }
      .analysis-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
    }
    @media (max-width: 480px) {
      .action-buttons { flex-direction: column-reverse; }
      .action-buttons button { width: 100%; justify-content: center; }
    }
  `}</style>
);
const MyResults = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [adoptionMessage, setAdoptionMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const textareaRef = useRef(null);
  useEffect(() => {
    api
      .get('/results/matches/')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Помилка завантаження результатів', err);
        if (err.response && err.response.status === 404) {
          setError(
            'Ви ще не проходили анкетування. Пройдіть тест, щоб система змогла підібрати вам ідеального друга.'
          );
        } else {
          setError("Не вдалося завантажити результати. Перевірте з'єднання або спробуйте пізніше.");
        }
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [adoptionMessage]);
  const handleRequestClick = (petOrResult) => {
    const cleanPetData = petOrResult.pet || petOrResult;
    setSelectedPet(cleanPetData);
    setIsModalOpen(true);
    setRequestSuccess(false);
    setSubmitError(null);
    setAdoptionMessage(`Доброго дня! Хочу познайомитися з хвостиком на ім'я ${cleanPetData.name}.`);
  };
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPet(null);
      setAdoptionMessage('');
      setSubmitError(null);
    }, 300);
  };
  const submitAdoptionRequest = async () => {
    setSendingRequest(true);
    setSubmitError(null);
    try {
      await api.post('/adoptions/', {
        pet: selectedPet.id,
        message: adoptionMessage,
        questionnaire_result: data?.id,
      });
      setRequestSuccess(true);
    } catch (err) {
      console.error('Помилка відправки заявки', err);
      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Не вдалося відправити заявку. Можливо, ви вже подали запит на цю тварину або вона більше не доступна.';
      setSubmitError(backendMessage);
    } finally {
      setSendingRequest(false);
    }
  };
  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <LoadingSpinner />
        <p
          style={{
            marginTop: '16px',
            color: textSecondary,
            fontWeight: '600',
          }}
        >
          Аналізуємо сумісність...
        </p>
      </div>
    );
  const rawMatches = Array.isArray(data?.matches)
    ? data.matches
    : data?.matches
      ? [data.matches]
      : [];
  const enrichedMatches = rawMatches.map((match) => {
    const petData = match.pet || match;
    if (petData.weight === null || petData.weight === undefined) {
      petData.weight = 0;
    }
    return {
      ...match,
      pet: petData,
      positives: match.positives || petData.positives || [],
      risks: match.risks || petData.risks || [],
      recommendation: match.recommendation || petData.recommendation || '',
    };
  });
  return (
    <div className="results-page-wrapper">
      <StaticStyles />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            background: brandPrimary,
            padding: '10px',
            borderRadius: '14px',
            color: '#FFF',
            display: 'flex',
          }}
        >
          <PawPrint size={28} weight="fill" />
        </div>
        <h1
          className="page-title"
          style={{
            color: textPrimary,
            margin: 0,
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}
        >
          Історія моїх підборів
        </h1>
      </div>

      {error && (
        <div
          className="fade-in"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: bgWhite,
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
            border: `1px solid ${borderDefault}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: bgSurface,
              padding: '24px',
              borderRadius: '50%',
              color: textSecondary,
              marginBottom: '20px',
            }}
          >
            <MagnifyingGlass size={48} weight="duotone" />
          </div>
          <h3
            style={{
              color: textPrimary,
              margin: '0 0 12px 0',
              fontSize: '22px',
              fontWeight: '800',
            }}
          >
            Ой, тут поки порожньо!
          </h3>
          <p
            style={{
              color: textSecondary,
              fontSize: '16px',
              maxWidth: '400px',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate('/questionnaire')}
            style={{
              padding: '14px 32px',
              background: brandPrimary,
              color: '#FFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Пройти анкетування
          </button>
        </div>
      )}

      {!error && data && (
        <div
          className="fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div className="analysis-card">
            <div
              className="analysis-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    color: brandPrimary,
                    background: brandPrimaryLight,
                    padding: '10px',
                    borderRadius: '12px',
                    display: 'flex',
                  }}
                >
                  <Brain size={24} weight="duotone" />
                </span>
                <h3
                  style={{
                    color: textPrimary,
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '800',
                  }}
                >
                  Головний пріоритет:{' '}
                  <span
                    style={{
                      color: brandPrimary,
                    }}
                  >
                    {priorityTranslations[data.top_priority] || data.top_priority}
                  </span>
                </h3>
              </div>
              <span
                style={{
                  background: bgSurface,
                  color: textSecondary,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: `1px solid ${borderDefault}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Info size={16} weight="bold" /> Аналітика підбору
              </span>
            </div>

            <p
              style={{
                color: textPrimary,
                background: bgSurface,
                padding: '14px 20px',
                borderRadius: '12px',
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                border: `1px solid ${borderDefault}`,
                fontWeight: '500',
              }}
            >
              На основі ваших відповідей в анкеті система вирахувала, що найважливішим критерієм для
              вас є <strong>{priorityTranslations[data.top_priority] || data.top_priority}</strong>.
              Алгоритм проаналізував усі ваші вибори та відсортував тварин так, щоб вони найкраще
              відповідали вашому способу життя.
            </p>
          </div>

          {enrichedMatches.length > 0 ? (
            <div
              style={{
                marginTop: '8px',
              }}
            >
              <ResultsList results={enrichedMatches} onRequestClick={handleRequestClick} />
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                background: bgWhite,
                borderRadius: '20px',
                border: '1px dashed #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <MagnifyingGlass
                size={40}
                color="#CBD5E1"
                weight="duotone"
                style={{
                  marginBottom: '16px',
                }}
              />
              <p
                style={{
                  color: textSecondary,
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '500',
                }}
              >
                На жаль, на даний момент у базі немає тварин, які ідеально відповідають вашому
                запиту. Спробуйте змінити критерії.
              </p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedPet && (
        <div className="modal-overlay" onClick={closeAndResetModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeAndResetModal}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: bgSurface,
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = borderDefault;
                e.currentTarget.style.color = textPrimary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = bgSurface;
                e.currentTarget.style.color = textSecondary;
              }}
            >
              <X size={18} weight="bold" />
            </button>

            {!requestSuccess ? (
              <>
                <h2
                  style={{
                    margin: '0 0 8px 0',
                    color: textPrimary,
                    fontSize: '24px',
                    fontWeight: '800',
                    paddingRight: '40px',
                  }}
                >
                  Заявка на знайомство
                </h2>

                {submitError && (
                  <div
                    className="fade-in"
                    style={{
                      background: '#FEF2F2',
                      color: '#DC2626',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '1px solid #FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <WarningCircle
                      size={24}
                      weight="fill"
                      style={{
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        lineHeight: '1.4',
                      }}
                    >
                      {submitError}
                    </span>
                  </div>
                )}

                <p
                  style={{
                    color: textSecondary,
                    margin: 0,
                    lineHeight: '1.6',
                    fontSize: '15px',
                  }}
                >
                  Ви обрали для знайомства хвостика на ім'я{' '}
                  <strong
                    style={{
                      color: textPrimary,
                    }}
                  >
                    {selectedPet.name}
                  </strong>
                  . Напишіть коротке повідомлення для волонтерів:
                </p>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <textarea
                    rows="3"
                    ref={textareaRef}
                    value={adoptionMessage}
                    onChange={(e) => setAdoptionMessage(e.target.value)}
                    maxLength={500}
                    className="custom-scrollbar"
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      border: `2px solid ${borderDefault}`,
                      outline: 'none',
                      background: bgSurface,
                      fontSize: '15px',
                      color: textPrimary,
                      resize: 'none',
                      minHeight: '100px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = brandPrimary;
                      e.target.style.background = bgWhite;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = borderDefault;
                      e.target.style.background = bgSurface;
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: adoptionMessage.length >= 480 ? '#DC2626' : '#94A3B8',
                      transition: 'color 0.2s',
                    }}
                  >
                    {adoptionMessage.length} / 500
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={closeAndResetModal}
                    style={{
                      padding: '14px 24px',
                      background: bgSurface,
                      border: 'none',
                      borderRadius: '14px',
                      fontWeight: '700',
                      fontSize: '15px',
                      cursor: 'pointer',
                      color: textSecondary,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = borderDefault)}
                    onMouseOut={(e) => (e.currentTarget.style.background = bgSurface)}
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={submitAdoptionRequest}
                    disabled={sendingRequest || adoptionMessage.trim().length === 0}
                    style={{
                      padding: '14px 28px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background:
                        sendingRequest || adoptionMessage.trim().length === 0
                          ? borderDefault
                          : brandPrimary,
                      color:
                        sendingRequest || adoptionMessage.trim().length === 0
                          ? textSecondary
                          : '#FFF',
                      border: 'none',
                      borderRadius: '14px',
                      fontWeight: '700',
                      fontSize: '15px',
                      cursor:
                        sendingRequest || adoptionMessage.trim().length === 0
                          ? 'not-allowed'
                          : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow:
                        sendingRequest || adoptionMessage.trim().length === 0
                          ? 'none'
                          : '0 8px 16px -4px rgba(234, 88, 12, 0.4)',
                    }}
                    onMouseOver={(e) => {
                      if (!sendingRequest && adoptionMessage.trim().length > 0)
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      if (!sendingRequest) e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {sendingRequest ? (
                      'Відправка...'
                    ) : (
                      <>
                        <PaperPlaneTilt size={18} weight="bold" /> Відправити заявку
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div
                className="fade-in"
                style={{
                  textAlign: 'center',
                  padding: '32px 16px 16px 16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: '#10B981',
                  }}
                >
                  <CheckCircle size={72} weight="fill" />
                </div>
                <h2
                  style={{
                    color: textPrimary,
                    margin: '0 0 12px 0',
                    fontSize: '28px',
                    fontWeight: '800',
                  }}
                >
                  Успішно!
                </h2>
                <p
                  style={{
                    color: textSecondary,
                    marginBottom: '32px',
                    lineHeight: '1.6',
                    fontSize: '16px',
                  }}
                >
                  Ваша заявка відправлена волонтерам притулку. Вони уважно ознайомляться з нею та
                  зв'яжуться з вами найближчим часом.
                </p>
                <button
                  onClick={closeAndResetModal}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: bgSurface,
                    border: `1px solid ${borderDefault}`,
                    borderRadius: '14px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: textPrimary,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = bgSurface;
                    e.currentTarget.style.borderColor = borderDefault;
                  }}
                >
                  Зрозуміло, закрити
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MyResults;
