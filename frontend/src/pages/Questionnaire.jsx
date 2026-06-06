import React, { useState, useEffect, useRef } from 'react';
import { useAHP } from '../hooks/useAHP';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { calculateCR } from '../utils/ahpMath';
import {
  Car,
  ShieldPlus,
  Elevator,
  Dog,
  Cat,
  PawPrint,
  HourglassLow,
  HourglassMedium,
  HourglassHigh,
  Star,
  Target,
  ShieldCheck,
  Lightning,
  PuzzlePiece,
  CheckCircle,
  WarningCircle,
  DotsSixVertical,
  HandPointing,
  HouseLine,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  Baby,
} from '@phosphor-icons/react';
const intensityOptions = [
  {
    value: 1,
    label: 'Однаково',
  },
  {
    value: 3,
    label: 'Трохи',
  },
  {
    value: 5,
    label: 'Помітно',
  },
  {
    value: 7,
    label: 'Значно',
  },
  {
    value: 9,
    label: 'Критично',
  },
];
const hints = {
  safety: 'Важливість загальної безпеки та умов проживання.',
  physical: 'Важливість розміру, габаритів та необхідної активності.',
  psychological: 'Важливість соціалізації, стресостійкості та виховання.',
  shelter: 'Наявність та доступність надійного сховища під час небезпеки.',
  evacuation: 'Здатність швидко транспортувати тварину в екстреній ситуації.',
  floor: 'Ваша автономність та фізичний комфорт при переміщенні без ліфта.',
  weight: 'Відповідність габаритів тварини вільній площі вашого житла.',
  activity: 'Ваша готовність забезпечити тварині щоденний рух та ігри.',
  age: 'Вибір між фазою активного розвитку малюка та стабільністю.',
  stress: 'Реакція нервової системи тварини на зовнішні подразники.',
  social: 'Схильність до взаємодії з людьми та іншими тваринами.',
  character: 'Швидкість засвоєння правил дому та легкість у вихованні.',
};
const rankStyles = [
  {
    borderLeft: '#EA580C',
    numBg: '#EA580C',
    numColor: '#FFFFFF',
    cardBorder: '#FDBA74',
    shadow: '0 4px 12px rgba(234, 88, 12, 0.12)',
  },
  {
    borderLeft: '#F97316',
    numBg: '#F97316',
    numColor: '#FFFFFF',
    cardBorder: '#FED7AA',
    shadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
  },
  {
    borderLeft: '#FB923C',
    numBg: '#FB923C',
    numColor: '#FFFFFF',
    cardBorder: '#F1F5F9',
    shadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
];
const createDefaultGlobalOrder = () => [
  {
    id: 'safety',
    label: 'Безпека',
  },
  {
    id: 'physical',
    label: 'Фізичні потреби',
  },
  {
    id: 'psychological',
    label: 'Характер тварини',
  },
];
const createDefaultBooleanMap = () => ({
  global: false,
  safety: false,
  physical: false,
  psychological: false,
});
const LabelBadge = ({ text, isHighlighted }) => (
  <span
    className="label-badge"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 18px',
      borderRadius: '8px',
      backgroundColor: '#FFF7ED',
      border: `2px solid ${isHighlighted ? '#EA580C' : '#FDBA74'}`,
      color: '#EA580C',
      fontWeight: '800',
      fontSize: '14px',
      transition: 'all 0.3s',
      textAlign: 'center',
    }}
  >
    {text}
  </span>
);
const StaticStyles = () => (
  <style>{`
    html, body, #root {
      margin: 0; padding: 0; width: 100%; background-color: #F8FAFC; overflow-x: hidden;
    }
    .slide-fade-in { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; width: 100%; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

    .intensity-btn-grid {
      display: flex; flex-wrap: wrap; background: #F8FAFC; border-radius: 12px; padding: 6px; gap: 6px;
    }
    @media (max-width: 400px) {
      .intensity-btn-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; }
      .intensity-btn-grid button:last-child { grid-column: span 2 !important; }
    }

    @keyframes wobble { 0% { transform: rotate(0deg); } 25% { transform: rotate(8deg); } 75% { transform: rotate(-8deg); } 100% { transform: rotate(0deg); } }
    @keyframes halo { 0% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(234, 88, 12, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); } }
    .icon-bob:hover { animation: wobble 0.5s ease-in-out; }
    .halo-effect { animation: halo 2s infinite; border-radius: 12px; }

    @keyframes pulse-glow-anim { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); } 70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
    .btn-pulse { animation: pulse-glow-anim 2s infinite; }
    .btn-pulse:hover { animation: none; }

    .draggable-list { touch-action: none; }
    .draggable-item {
        transition: border-color 0.3s ease, background 0.2s ease, transform 0.2s ease;
        touch-action: none; -webkit-user-select: none; user-select: none; cursor: grab; -webkit-tap-highlight-color: transparent;
    }
    .draggable-item:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1) !important; z-index: 10; }
    .draggable-item:focus-visible { outline: 2px solid #EA580C; outline-offset: 2px; }

    .vs-circle {
       display: inline-flex; align-items: center; justify-content: center;
       width: 24px; height: 24px; border-radius: 50%; background: #F1F5F9;
       font-size: 11px; font-weight: 900; color: #94A3B8; text-transform: uppercase;
       border: 1px solid #E2E8F0; margin: 0 8px; flex-shrink: 0;
    }

    .info-tooltip { position: relative; cursor: help; opacity: 0.8; }
    .info-tooltip:hover::after {
      content: attr(data-tooltip); position: absolute; bottom: 130%; right: 0; transform: translateX(20%);
      background: #0F172A; color: #FFF; padding: 6px 12px; border-radius: 8px; font-size: 12px;
      white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; font-weight: 600;
    }
    .info-tooltip:hover::before {
      content: ''; position: absolute; bottom: 90%; left: 50%; transform: translateX(-50%);
      border-width: 6px; border-style: solid; border-color: #0F172A transparent transparent transparent;
    }
    .consistency-badge {
      position: static !important;
      width: fit-content !important;
      max-width: 100% !important;
      margin-left: auto !important;
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    }
    .pointer-anim { display: inline-flex; align-items: center; justify-content: center; animation: bounceSideways 1s infinite; margin-right: 8px; }
    @keyframes bounceSideways { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }

    @media (max-width: 576px) {
      .main-card { padding: 24px 16px !important; border-radius: 20px !important; }
      .step-header-text { font-size: 24px !important; line-height: 1.2 !important; }
      .step-desc-text { font-size: 14px !important; padding: 0 4px !important; }
      .consistency-badge {
        width: 100% !important;
        margin-left: 0 !important;
        justify-content: center !important;
        box-shadow: none !important;
      }

      .checkbox-label {
        flex: 1 1 100% !important;
        justify-content: flex-start !important;
        white-space: normal !important;
        text-overflow: clip !important;
        line-height: 1.4 !important;
        padding: 12px 16px !important;
        align-items: flex-start !important;
      }
      .checkbox-label span:first-child { margin-top: 2px; }

      .inner-card-row { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
      .inner-card-row > div { width: 100% !important; flex: 1 1 100% !important; box-sizing: border-box !important; }
      .footer-controls { flex-direction: column-reverse !important; gap: 16px !important; }
      .footer-controls button { width: 100% !important; justify-content: center !important; }
      .vs-circle { transform: rotate(90deg) !important; margin: 4px 0 !important; }
      .label-badge { width: 100% !important; justify-content: center !important; white-space: normal !important; }
    }
  `}</style>
);
const Questionnaire = () => {
  const {
    categories,
    intensities,
    intensities2,
    reorderItems,
    updateIntensity,
    updateIntensity2,
    userProfile,
    updateUserProfile,
    submitQuestionnaire,
    loading,
    error,
    isProfileLoading,
  } = useAHP();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [localGlobalOrder, setLocalGlobalOrder] = useState(createDefaultGlobalOrder);
  const [localIntensities, setLocalIntensities] = useState({
    global: null,
  });
  const [localIntensities2, setLocalIntensities2] = useState({
    global: null,
  });
  useEffect(() => {
    if (intensities && intensities.global !== undefined && intensities.global !== null) {
      setLocalIntensities((prev) => ({
        ...prev,
        global: intensities.global,
      }));
    }
    if (intensities2 && intensities2.global !== undefined && intensities2.global !== null) {
      setLocalIntensities2((prev) => ({
        ...prev,
        global: intensities2.global,
      }));
    }
    if (userProfile && userProfile.global_order && userProfile.global_order.length === 3) {
      const labelMap = {
        safety: 'Безпека',
        physical: 'Фізичні потреби',
        psychological: 'Характер тварини',
      };
      const restoredOrder = userProfile.global_order.map((id) => ({
        id,
        label: labelMap[id] || id,
      }));
      setLocalGlobalOrder(restoredOrder);
    }
  }, [intensities, intensities2, userProfile]);
  const dynamicCategoryKeys = ['global', ...localGlobalOrder.map((item) => item.id)];
  const totalSteps = 1 + dynamicCategoryKeys.length;
  const [revealed, setRevealed] = useState(createDefaultBooleanMap);
  const [isReordered, setIsReordered] = useState(createDefaultBooleanMap);
  const [answered2, setAnswered2] = useState(createDefaultBooleanMap);
  useEffect(() => {
    const resetLocalQuestionnaire = () => {
      setCurrentStep(0);
      setLocalGlobalOrder(createDefaultGlobalOrder());
      setLocalIntensities({ global: null });
      setLocalIntensities2({ global: null });
      setRevealed(createDefaultBooleanMap());
      setIsReordered(createDefaultBooleanMap());
      setAnswered2(createDefaultBooleanMap());
      setAnnouncement('');
    };
    window.addEventListener('authChanged', resetLocalQuestionnaire);
    window.addEventListener('authExpired', resetLocalQuestionnaire);
    return () => {
      window.removeEventListener('authChanged', resetLocalQuestionnaire);
      window.removeEventListener('authExpired', resetLocalQuestionnaire);
    };
  }, []);
  useEffect(() => {
    const updatedRevealed = {
      ...revealed,
    };
    const updatedAnswered2 = {
      ...answered2,
    };
    dynamicCategoryKeys.forEach((key) => {
      const val1 = key === 'global' ? localIntensities.global : intensities?.[key];
      const val2 = key === 'global' ? localIntensities2.global : intensities2?.[key];
      if (val1 !== null && val1 !== undefined) {
        updatedRevealed[key] = true;
        setIsReordered((prev) => ({
          ...prev,
          [key]: true,
        }));
      }
      if (val2 !== null && val2 !== undefined) {
        updatedAnswered2[key] = true;
      }
    });
    setRevealed(updatedRevealed);
    setAnswered2(updatedAnswered2);
  }, [intensities, intensities2, localIntensities.global, localIntensities2.global, currentStep]);
  const activeDragIndex = useRef(null);
  const dragCategory = useRef(null);
  const touchStartY = useRef(0);
  const [, forceUpdate] = useState({});
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentStep]);
  const handleApply = async () => {
    try {
      const result = await submitQuestionnaire({
        globalOrder: localGlobalOrder.map((item) => item.id),
        globalIntensities: localIntensities.global,
        globalIntensities2: localIntensities2.global,
      });
      if (result && result.success) {
        const from = location.state?.from;
        const shouldReturnToCatalog =
          from === '/' || from?.startsWith('/catalog') || from?.startsWith('/?');
        if (from?.startsWith('/favorites') || from?.startsWith('/pet/')) {
          navigate(from);
        } else if (shouldReturnToCatalog) {
          navigate(from, {
            state: {
              restoreCatalog: true,
            },
          });
        } else {
          navigate('/my-results');
        }
      }
    } catch (err) {
      console.error('Помилка обробки результату анкети:', err);
    }
  };
  const canGoNext = () => {
    if (currentStep === 0) {
      return (
        userProfile.floor !== '' &&
        userProfile.floor > 0 &&
        userProfile.preferred_species &&
        userProfile.preferred_age &&
        userProfile.available_walk_hours
      );
    }
    const currentCategory = dynamicCategoryKeys[currentStep - 1];
    return answered2[currentCategory];
  };
  const handleNextStep = () => {
    if (canGoNext() && currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const safeUpdateIntensity = (key, val) => {
    if (key === 'global') {
      setLocalIntensities((prev) => ({
        ...prev,
        global: val,
      }));
    } else {
      updateIntensity(key, val);
    }
    setRevealed((prev) => ({
      ...prev,
      [key]: true,
    }));
  };
  const safeUpdateIntensity2 = (key, val) => {
    if (key === 'global') {
      setLocalIntensities2((prev) => ({
        ...prev,
        global: val,
      }));
    } else {
      updateIntensity2(key, val);
    }
    setAnswered2((prev) => ({
      ...prev,
      [key]: true,
    }));
  };
  const startCustomDrag = (clientY, index, category) => {
    touchStartY.current = clientY;
    activeDragIndex.current = index;
    dragCategory.current = category;
    forceUpdate({});
  };
  const moveCustomDrag = (clientY, itemsLength) => {
    if (activeDragIndex.current === null || dragCategory.current === null) return;
    const currentY = clientY;
    const diffY = currentY - touchStartY.current;
    if (Math.abs(diffY) > 55) {
      const direction = diffY > 0 ? 1 : -1;
      const targetIndex = activeDragIndex.current + direction;
      if (targetIndex >= 0 && targetIndex < itemsLength) {
        executeReorder(dragCategory.current, activeDragIndex.current, targetIndex);
        activeDragIndex.current = targetIndex;
        touchStartY.current = currentY;
        forceUpdate({});
      }
    }
  };
  const endCustomDrag = () => {
    activeDragIndex.current = null;
    dragCategory.current = null;
    forceUpdate({});
  };
  const executeReorder = (category, fromIdx, toIdx) => {
    if (category === 'global') {
      setLocalGlobalOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        return newOrder;
      });
      setLocalIntensities({
        global: null,
      });
      setLocalIntensities2({
        global: null,
      });
    } else {
      reorderItems(category, fromIdx, toIdx);
      updateIntensity(category, null);
      updateIntensity2(category, null);
    }
    setIsReordered((prev) => ({
      ...prev,
      [category]: true,
    }));
    setRevealed((prev) => ({
      ...prev,
      [category]: false,
    }));
    setAnswered2((prev) => ({
      ...prev,
      [category]: false,
    }));
    setAnnouncement(`Порядок факторів змінено`);
  };
  const handleKeyDown = (e, category, index, itemsLength, itemId) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      executeReorder(category, index, index - 1);
      setTimeout(() => document.getElementById(`drag-${itemId}`)?.focus(), 50);
    } else if (e.key === 'ArrowDown' && index < itemsLength - 1) {
      e.preventDefault();
      executeReorder(category, index, index + 1);
      setTimeout(() => document.getElementById(`drag-${itemId}`)?.focus(), 50);
    }
  };
  const getCheckboxStyle = (isChecked) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: isChecked ? '#EA580C' : '#FFFFFF',
    color: isChecked ? '#FFFFFF' : '#475569',
    border: `1px solid ${isChecked ? '#EA580C' : '#E2E8F0'}`,
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isChecked ? '0 4px 12px rgba(234, 88, 12, 0.2)' : '0 1px 2px rgba(15,23,42,0.04)',
    userSelect: 'none',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });
  const getIntensityBtnStyle = (isActive) => ({
    flex: 1,
    padding: '10px 4px',
    border: 'none',
    borderRadius: '8px',
    background: isActive ? '#EA580C' : 'transparent',
    color: isActive ? '#FFFFFF' : '#475569',
    fontWeight: isActive ? '700' : '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: isActive ? '0 4px 14px rgba(234, 88, 12, 0.3)' : 'none',
    minWidth: '60px',
  });
  const mainCardStyle = {
    background: '#FFFFFF',
    padding: '32px 40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
    border: '1px solid #E2E8F0',
    maxWidth: '960px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  };
  if (isProfileLoading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner />
        <p
          style={{
            marginTop: '16px',
            color: '#64748B',
            fontWeight: '700',
            fontSize: '16px',
          }}
        >
          Синхронізація з вашим профілем...
        </p>
      </div>
    );
  }
  return (
    <main
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px 20px 16px',
        boxSizing: 'border-box',
      }}
    >
      <StaticStyles />
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            className="step-header-text"
            style={{
              fontSize: '32px',
              fontWeight: '800',
              margin: '0 0 10px 0',
              letterSpacing: '-0.02em',
              color: '#0F172A',
            }}
          >
            Назустріч ідеальному другу
          </h1>
          <p
            className="step-desc-text"
            style={{
              fontSize: '15px',
              color: '#475569',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '400',
            }}
          >
            {currentStep === 0
              ? 'Розкажіть про свій простір, щоб ми підібрали друга, якому буде комфортно у вашому домі.'
              : 'Ваші пріоритети — це основа для розрахунку ідеального збігу. Впорядкуйте фактори та оцініть різницю.'}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FEF2F2',
              color: '#DC2626',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              boxSizing: 'border-box',
            }}
          >
            <WarningCircle size={20} weight="bold" /> {error}
          </div>
        )}

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          {currentStep === 0 && (
            <div key={`step-${currentStep}`} className="slide-fade-in">
              <div className="main-card" style={mainCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="icon-bob"
                    style={{
                      background: '#F8FAFC',
                      padding: '12px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F172A',
                    }}
                  >
                    <HouseLine size={24} weight="bold" />
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#0F172A',
                    }}
                  >
                    Базові умови проживання
                  </h3>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        color: '#0F172A',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      Мобільність та безпека:
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '16px',
                        background: '#F8FAFC',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {[
                        {
                          id: 'has_car',
                          label: 'Авто',
                          icon: <Car size={18} weight="bold" />,
                        },
                        {
                          id: 'has_shelter',
                          label: 'Укриття',
                          icon: <ShieldPlus size={18} weight="bold" />,
                        },
                        {
                          id: 'has_elevator',
                          label: 'Ліфт',
                          icon: <Elevator size={18} weight="bold" />,
                        },
                      ].map((field) => (
                        <label
                          key={field.id}
                          className="checkbox-label"
                          style={{
                            ...getCheckboxStyle(userProfile[field.id]),
                            flex: '1 1 200px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={userProfile[field.id] || false}
                            onChange={(e) => updateUserProfile(field.id, e.target.checked)}
                            style={{
                              display: 'none',
                            }}
                          />
                          <span
                            style={{
                              display: 'flex',
                              flexShrink: 0,
                            }}
                          >
                            {field.icon}
                          </span>{' '}
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        color: '#0F172A',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      Хто вже живе з вами?
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '16px',
                        background: '#F8FAFC',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {[
                        {
                          id: 'has_children',
                          label: 'Діти (до 10 років)',
                          icon: <Baby size={18} weight="bold" />,
                        },
                        {
                          id: 'has_cats',
                          label: 'Коти',
                          icon: <Cat size={18} weight="bold" />,
                        },
                        {
                          id: 'has_dogs',
                          label: 'Собаки',
                          icon: <Dog size={18} weight="bold" />,
                        },
                      ].map((field) => (
                        <label
                          key={field.id}
                          className="checkbox-label"
                          style={{
                            ...getCheckboxStyle(userProfile[field.id]),
                            flex: '1 1 200px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={userProfile[field.id] || false}
                            onChange={(e) => updateUserProfile(field.id, e.target.checked)}
                            style={{
                              display: 'none',
                            }}
                          />
                          <span
                            style={{
                              display: 'flex',
                              flexShrink: 0,
                            }}
                          >
                            {field.icon}
                          </span>{' '}
                          {field.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        background: '#F8FAFC',
                        padding: '14px 16px',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <span
                        style={{
                          color: '#0F172A',
                          fontWeight: '700',
                          fontSize: '14px',
                        }}
                      >
                        Вільний час на вигул (щодня):
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginTop: '4px',
                        }}
                      >
                        {[
                          {
                            value: 1,
                            label: 'До 1 год',
                          },
                          {
                            value: 2,
                            label: '1-2 год',
                          },
                          {
                            value: 3,
                            label: '2+ год',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateUserProfile('available_walk_hours', opt.value)}
                            style={{
                              ...getCheckboxStyle(userProfile.available_walk_hours === opt.value),
                              flex: 1,
                              padding: '8px 10px',
                              fontSize: '13px',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        background: '#F8FAFC',
                        padding: '14px 16px',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <span
                        style={{
                          color: '#0F172A',
                          fontWeight: '700',
                          fontSize: '14px',
                        }}
                      >
                        Чи маєте досвід утримання тварин?
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '4px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateUserProfile('has_pet_experience', true)}
                          style={{
                            ...getCheckboxStyle(userProfile.has_pet_experience === true),
                            flex: 1,
                            padding: '8px',
                          }}
                        >
                          Маю досвід
                        </button>
                        <button
                          type="button"
                          onClick={() => updateUserProfile('has_pet_experience', false)}
                          style={{
                            ...getCheckboxStyle(userProfile.has_pet_experience === false),
                            flex: 1,
                            padding: '8px',
                          }}
                        >
                          Це перший друг
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="inner-card-row"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        flex: '1 1 150px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'space-between',
                        background: '#F8FAFC',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          color: '#0F172A',
                          fontWeight: '700',
                          fontSize: '14px',
                        }}
                      >
                        Поверх:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={userProfile.floor || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            updateUserProfile('floor', '');
                            return;
                          }
                          const num = Number(val);
                          if (num >= 1 && num <= 50) updateUserProfile('floor', num);
                        }}
                        style={{
                          width: '70px',
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          textAlign: 'center',
                          fontWeight: '800',
                          color: '#0F172A',
                          fontSize: '15px',
                          outline: 'none',
                          padding: '10px 8px',
                          borderRadius: '12px',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        flex: '2 1 350px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: '#F8FAFC',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          color: '#0F172A',
                          fontWeight: '700',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Шукаю:
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {[
                          {
                            id: 'DOG',
                            label: 'Собаку',
                            icon: <Dog size={16} weight="bold" />,
                          },
                          {
                            id: 'CAT',
                            label: 'Котика',
                            icon: <Cat size={16} weight="bold" />,
                          },
                          {
                            id: 'ANY',
                            label: 'Будь-кого',
                            icon: <PawPrint size={16} weight="bold" />,
                          },
                        ].map((species) => (
                          <label
                            key={species.id}
                            className="checkbox-label"
                            style={{
                              ...getCheckboxStyle(species.id === userProfile.preferred_species),
                              flex: '1 1 auto',
                              padding: '10px 14px',
                            }}
                          >
                            <input
                              type="radio"
                              checked={userProfile.preferred_species === species.id}
                              onChange={() => updateUserProfile('preferred_species', species.id)}
                              style={{
                                display: 'none',
                              }}
                            />
                            <span
                              style={{
                                display: 'flex',
                                flexShrink: 0,
                              }}
                            >
                              {species.icon}
                            </span>{' '}
                            {species.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#F8FAFC',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <span
                      style={{
                        color: '#0F172A',
                        fontWeight: '700',
                        fontSize: '14px',
                        marginBottom: '12px',
                      }}
                    >
                      Бажаний вік улюбленця:
                    </span>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {[
                        {
                          id: 'BABY',
                          label: 'Малюк (< 6 міс.)',
                          icon: <HourglassLow size={18} weight="bold" />,
                        },
                        {
                          id: 'ADULT',
                          label: 'Дорослий (6 міс - 5 р)',
                          icon: <HourglassMedium size={18} weight="bold" />,
                        },
                        {
                          id: 'SENIOR',
                          label: 'Спокійний (> 5 років)',
                          icon: <HourglassHigh size={18} weight="bold" />,
                        },
                        {
                          id: 'ANY',
                          label: 'Будь-який вік',
                          icon: <Star size={18} weight="bold" />,
                        },
                      ].map((age) => (
                        <label
                          key={age.id}
                          className="checkbox-label"
                          style={getCheckboxStyle(userProfile.preferred_age === age.id)}
                        >
                          <input
                            type="radio"
                            checked={userProfile.preferred_age === age.id}
                            onChange={() => updateUserProfile('preferred_age', age.id)}
                            style={{
                              display: 'none',
                            }}
                          />
                          <span
                            style={{
                              display: 'flex',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            {age.icon}
                          </span>{' '}
                          {age.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep > 0 && (
            <div
              key={`step-${currentStep}`}
              className="slide-fade-in"
              style={{
                width: '100%',
              }}
            >
              {(() => {
                const key = dynamicCategoryKeys[currentStep - 1];
                const titles = {
                  global: {
                    icon: <Target size={24} weight="bold" />,
                    text: 'Головні пріоритети',
                  },
                  safety: {
                    icon: <ShieldCheck size={24} weight="bold" />,
                    text: 'Безпека',
                  },
                  physical: {
                    icon: <Lightning size={24} weight="bold" />,
                    text: 'Фізичні потреби',
                  },
                  psychological: {
                    icon: <PuzzlePiece size={24} weight="bold" />,
                    text: 'Характер тварини',
                  },
                };
                const items = key === 'global' ? localGlobalOrder : categories[key];
                const curIntensities = key === 'global' ? localIntensities : intensities;
                const curIntensities2 = key === 'global' ? localIntensities2 : intensities2;
                const topItem = items[0].label;
                const midItem = items[1].label;
                const botItem = items[2].label;
                const isReved = revealed[key];
                const currentVal1 = curIntensities[key];
                const currentVal2 = curIntensities2[key];
                const liveCR = calculateCR(currentVal1, currentVal2);
                const isBothAnswered =
                  currentVal1 !== null &&
                  currentVal2 !== null &&
                  currentVal1 !== undefined &&
                  currentVal2 !== undefined;
                return (
                  <div className="main-card" style={mainCardStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        marginBottom: '24px',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                        }}
                      >
                        <span
                          className="icon-bob"
                          style={{
                            background: '#F8FAFC',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0F172A',
                          }}
                        >
                          {titles[key].icon}
                        </span>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#0F172A',
                          }}
                        >
                          {titles[key].text}
                        </h3>
                      </div>

                      {isBothAnswered && (
                        <div
                          className="slide-fade-in consistency-badge"
                          style={{
                            background: liveCR <= 0.1 ? '#F0FDF4' : '#FEF2F2',
                            color: liveCR <= 0.1 ? '#16A34A' : '#DC2626',
                            padding: '8px 14px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: `1px solid ${liveCR <= 0.1 ? '#DCFCE7' : '#FEE2E2'}`,
                          }}
                        >
                          {liveCR <= 0.1 ? (
                            <CheckCircle size={16} weight="bold" />
                          ) : (
                            <WarningCircle size={16} weight="bold" />
                          )}
                          {liveCR <= 0.1 ? 'Система розуміє вас' : 'Є легка суперечність'}
                          <span
                            className="info-tooltip"
                            data-tooltip={`CR: ${liveCR.toFixed(3)} (Показник узгодженості)`}
                            style={{
                              color: '#94A3B8',
                              marginLeft: '4px',
                            }}
                          >
                            ⓘ
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="draggable-list"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
                        gap: '24px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#64748B',
                            fontWeight: '700',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Розставте пріоритети (перетягуйте):
                        </p>

                        <div
                          className="draggable-list"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                          onMouseMove={(e) => moveCustomDrag(e.clientY, items.length)}
                          onTouchMove={(e) => {
                            if (e.touches.length > 0)
                              moveCustomDrag(e.touches[0].clientY, items.length);
                          }}
                          onMouseUp={endCustomDrag}
                          onTouchEnd={endCustomDrag}
                          onMouseLeave={endCustomDrag}
                        >
                          {items.map((item, index) => {
                            const s = rankStyles[index];
                            const isActiveInEvaluation =
                              (isReved && (item.label === midItem || item.label === botItem)) ||
                              (!isReved && (item.label === topItem || item.label === midItem));
                            const isCurrentlyDragging =
                              dragCategory.current === key && activeDragIndex.current === index;
                            return (
                              <div
                                id={`drag-${item.id}`}
                                key={item.id}
                                tabIndex={0}
                                aria-label={`Перемістити ${item.label}.`}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, key, index, items.length, item.id)
                                }
                                onMouseDown={(e) => startCustomDrag(e.clientY, index, key)}
                                onTouchStart={(e) => {
                                  if (e.touches.length > 0)
                                    startCustomDrag(e.touches[0].clientY, index, key);
                                }}
                                className="draggable-item"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '12px 14px',
                                  background: isCurrentlyDragging ? '#FFF7ED' : '#FFFFFF',
                                  border: `2px solid ${isCurrentlyDragging ? '#EA580C' : isActiveInEvaluation ? '#EA580C' : s.cardBorder}`,
                                  borderRadius: '16px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  boxShadow: isCurrentlyDragging
                                    ? '0 10px 20px -5px rgba(234, 88, 12, 0.2)'
                                    : s.shadow,
                                  transform: isCurrentlyDragging ? 'scale(1.02)' : 'none',
                                  opacity:
                                    activeDragIndex.current !== null &&
                                    !isCurrentlyDragging &&
                                    dragCategory.current === key
                                      ? 0.7
                                      : 1,
                                  zIndex: isCurrentlyDragging ? 20 : 1,
                                }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '4px',
                                    background: s.borderLeft,
                                  }}
                                ></div>
                                <div
                                  style={{
                                    color: '#CBD5E1',
                                    marginRight: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <DotsSixVertical size={24} weight="bold" />
                                </div>
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: s.numBg,
                                    color: s.numColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '13px',
                                    marginRight: '12px',
                                    flexShrink: 0,
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <div
                                  style={{
                                    flex: 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: '700',
                                      fontSize: '14px',
                                      color: '#0F172A',
                                      marginBottom: '2px',
                                    }}
                                  >
                                    {item.label}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      color: '#64748B',
                                      lineHeight: '1.4',
                                      fontWeight: '400',
                                    }}
                                  >
                                    {hints[item.id]}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        {!isReordered[key] && (
                          <div
                            onClick={() =>
                              setIsReordered((prev) => ({
                                ...prev,
                                [key]: true,
                              }))
                            }
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              left: '-10px',
                              right: '-10px',
                              bottom: '-10px',
                              background: 'rgba(248, 250, 252, 0.7)',
                              backdropFilter: 'blur(4px)',
                              zIndex: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '24px',
                              cursor: 'pointer',
                            }}
                          >
                            <div
                              style={{
                                background: '#0F172A',
                                color: '#FFF',
                                padding: '16px 24px',
                                borderRadius: '16px',
                                fontWeight: '600',
                                fontSize: '14px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                textAlign: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  marginBottom: '8px',
                                }}
                              >
                                <span
                                  className="pointer-anim"
                                  style={{
                                    color: '#EA580C',
                                  }}
                                >
                                  <HandPointing size={20} weight="fill" />
                                </span>
                                <span
                                  style={{
                                    fontWeight: '700',
                                    fontSize: '15px',
                                  }}
                                >
                                  Змініть порядок факторів
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: '#94A3B8',
                                }}
                              >
                                (або клікніть тут, якщо поточний порядок ідеальний)
                              </span>
                            </div>
                          </div>
                        )}

                        <p
                          style={{
                            fontSize: '12px',
                            color: '#64748B',
                            fontWeight: '700',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Оцініть різницю у важливості:
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px',
                              }}
                            >
                              <LabelBadge
                                text={topItem}
                                isHighlighted={curIntensities[key] === 1}
                              />
                              <span className="vs-circle">vs</span>
                              <LabelBadge
                                text={midItem}
                                isHighlighted={curIntensities[key] === 1}
                              />
                            </div>
                            <div className="intensity-btn-grid">
                              {intensityOptions.map((opt) => (
                                <button
                                  key={`1-${key}-${opt.value}`}
                                  type="button"
                                  onClick={() => safeUpdateIntensity(key, opt.value)}
                                  tabIndex={!isReordered[key] ? -1 : 0}
                                  style={getIntensityBtnStyle(curIntensities[key] === opt.value)}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div
                            style={{
                              maxHeight: isReved ? '500px' : '0px',
                              opacity: isReved ? 1 : 0,
                              overflow: 'hidden',
                              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                              borderTop: isReved ? '1px solid #E2E8F0' : 'none',
                              paddingTop: isReved ? '16px' : '0',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '10px',
                              }}
                            >
                              <LabelBadge
                                text={midItem}
                                isHighlighted={curIntensities2[key] === 1}
                              />
                              <span className="vs-circle">vs</span>
                              <LabelBadge
                                text={botItem}
                                isHighlighted={curIntensities2[key] === 1}
                              />
                            </div>
                            <div className="intensity-btn-grid">
                              {intensityOptions.map((opt) => (
                                <button
                                  key={`2-${key}-${opt.value}`}
                                  type="button"
                                  onClick={() => safeUpdateIntensity2(key, opt.value)}
                                  tabIndex={!isReordered[key] ? -1 : 0}
                                  style={getIntensityBtnStyle(curIntensities2[key] === opt.value)}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div
          className="footer-controls"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              flex: '1 1 0',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <button
              type="button"
              onClick={handlePrevStep}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: '#64748B',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                visibility: currentStep === 0 ? 'hidden' : 'visible',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <ArrowLeft size={18} weight="bold" /> Назад
            </button>
          </div>

          <div
            style={{
              flex: '1 1 0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#94A3B8',
              }}
            >
              Крок {currentStep + 1} із {totalSteps}
            </span>
          </div>

          <div
            style={{
              flex: '1 1 0',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              className={
                canGoNext() && !loading && currentStep === totalSteps - 1 ? 'btn-pulse' : ''
              }
              onClick={currentStep === totalSteps - 1 ? handleApply : handleNextStep}
              disabled={!canGoNext() || loading}
              style={{
                padding: currentStep === totalSteps - 1 ? '14px 32px' : '12px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background:
                  canGoNext() && !loading
                    ? currentStep === totalSteps - 1
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : '#EA580C'
                    : '#E2E8F0',
                color: canGoNext() && !loading ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                borderRadius: '14px',
                fontSize: currentStep === totalSteps - 1 ? '17px' : '16px',
                fontWeight: '800',
                cursor: canGoNext() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow:
                  canGoNext() && !loading
                    ? currentStep === totalSteps - 1
                      ? '0 10px 25px -5px rgba(16, 185, 129, 0.5)'
                      : '0 8px 20px -5px rgba(234, 88, 12, 0.4)'
                    : 'none',
                position: 'relative',
                top: currentStep === totalSteps - 1 ? '3px' : '0',
              }}
              onMouseOver={(e) => {
                if (canGoNext() && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    currentStep === totalSteps - 1
                      ? '0 12px 25px -5px rgba(16, 185, 129, 0.6)'
                      : '0 12px 25px -5px rgba(234, 88, 12, 0.6)';
                }
              }}
              onMouseOut={(e) => {
                if (canGoNext() && !loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    currentStep === totalSteps - 1
                      ? '0 10px 25px -5px rgba(16, 185, 129, 0.5)'
                      : '0 8px 20px -5px rgba(234, 88, 12, 0.4)';
                }
              }}
            >
              {loading ? (
                'Обробка...'
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <Sparkle size={22} weight="fill" /> Знайти друга
                </>
              ) : (
                <>
                  Далі <ArrowRight size={18} weight="bold" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
export default Questionnaire;
