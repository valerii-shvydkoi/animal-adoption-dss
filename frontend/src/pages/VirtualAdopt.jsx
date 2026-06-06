import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Coins,
  CreditCard,
  HandHeart,
  Spinner,
} from '@phosphor-icons/react';
import { useFeedback } from '../context/FeedbackContext';
const tokens = {
  brandPrimary: '#EA580C',
  brandPrimaryLight: '#FFF7ED',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  bgSurface: '#F8FAFC',
  bgWhite: '#FFFFFF',
  borderDefault: '#E2E8F0',
  radiusLg: '16px',
  radiusMd: '12px',
};
const amounts = [100, 200, 500, 1000];
const VirtualAdopt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) setSelectedAmount('custom');
  };
  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };
  const handleCardNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
  };
  const handleExpiryChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };
  const isValidExpiry = (value) => {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;
    const month = Number(match[1]);
    return month >= 1 && month <= 12;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = selectedAmount === 'custom' ? Number(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount < 10) {
      notify({
        type: 'warning',
        title: 'Перевірте суму',
        message: 'Введіть суму підтримки від 10 грн.',
      });
      return;
    }
    const cleanCardNumber = cardNumber.replace(/\D/g, '');
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail.trim());
    if (payerName.trim().length < 2) {
      notify({
        type: 'warning',
        title: 'Перевірте ім’я',
        message: 'Введіть ім’я платника.',
      });
      return;
    }
    if (!emailIsValid) {
      notify({
        type: 'warning',
        title: 'Перевірте email',
        message: 'Введіть коректну електронну пошту для квитанції.',
      });
      return;
    }
    if (cleanCardNumber.length !== 16 || !isValidExpiry(expiry) || cvv.length !== 3) {
      notify({
        type: 'warning',
        title: 'Перевірте реквізити',
        message: 'Заповніть номер картки, строк дії та CVV.',
      });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      notify({
        type: 'success',
        title: 'Дякуємо за підтримку',
        message: `Оплата ${finalAmount} грн (${isMonthly ? 'щомісячний внесок' : 'одноразово'}) пройшла успішно.`,
      });
      if (id) {
        navigate(`/pet/${id}`);
      } else {
        navigate('/catalog');
      }
    }, 2000);
  };
  const styles = {
    wrapper: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: tokens.textSecondary,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '24px',
      padding: 0,
      transition: 'color 0.2s',
    },
    card: {
      background: tokens.bgWhite,
      border: `1px solid ${tokens.borderDefault}`,
      borderRadius: tokens.radiusLg,
      padding: '40px',
      boxShadow: '0 12px 24px -8px rgba(15, 23, 42, 0.08)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    iconBadge: {
      background: '#F0FDF4',
      color: '#16A34A',
      padding: '16px',
      borderRadius: '50%',
      display: 'inline-flex',
    },
    title: {
      margin: '0 0 12px 0',
      fontSize: '32px',
      fontWeight: '800',
      color: tokens.textPrimary,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      margin: 0,
      color: tokens.textSecondary,
      fontSize: '16px',
      lineHeight: '1.6',
    },
    tabs: {
      display: 'flex',
      background: tokens.bgSurface,
      padding: '6px',
      borderRadius: tokens.radiusMd,
      marginBottom: '24px',
    },
    tabBtn: (active) => ({
      flex: 1,
      padding: '12px',
      background: active ? tokens.bgWhite : 'transparent',
      color: active ? tokens.textPrimary : tokens.textSecondary,
      border: 'none',
      borderRadius: '8px',
      fontWeight: active ? '700' : '500',
      fontSize: '15px',
      cursor: 'pointer',
      boxShadow: active ? '0 2px 8px rgba(15, 23, 42, 0.05)' : 'none',
      transition: 'all 0.2s',
    }),
    formSection: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '12px',
      fontWeight: '700',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: tokens.textSecondary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '12px',
    },
    amountBtn: (isActive) => ({
      padding: '16px',
      background: isActive ? tokens.brandPrimaryLight : tokens.bgWhite,
      border: `2px solid ${isActive ? tokens.brandPrimary : tokens.borderDefault}`,
      color: isActive ? tokens.brandPrimary : tokens.textPrimary,
      borderRadius: tokens.radiusMd,
      fontWeight: '800',
      fontSize: '18px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    input: {
      width: '100%',
      padding: '16px 20px',
      fontSize: '16px',
      fontWeight: '600',
      color: tokens.textPrimary,
      background: tokens.bgSurface,
      border: `2px solid ${selectedAmount === 'custom' ? tokens.brandPrimary : tokens.borderDefault}`,
      borderRadius: tokens.radiusMd,
      outline: 'none',
      transition: 'all 0.2s',
      boxSizing: 'border-box',
    },
    fieldInput: {
      width: '100%',
      padding: '14px 16px',
      fontSize: '15px',
      fontWeight: '600',
      color: tokens.textPrimary,
      background: tokens.bgSurface,
      border: `1px solid ${tokens.borderDefault}`,
      borderRadius: tokens.radiusMd,
      outline: 'none',
      boxSizing: 'border-box',
    },
    paymentGrid: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '14px',
      marginBottom: '24px',
    },
    infoBlock: {
      background: tokens.bgSurface,
      padding: '16px',
      borderRadius: tokens.radiusMd,
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      marginBottom: '32px',
      border: `1px solid ${tokens.borderDefault}`,
    },
    infoText: {
      margin: 0,
      fontSize: '13px',
      color: tokens.textSecondary,
      lineHeight: '1.5',
    },
    submitBtn: {
      width: '100%',
      padding: '16px',
      background: '#16A34A',
      color: tokens.bgWhite,
      border: 'none',
      borderRadius: tokens.radiusMd,
      fontWeight: '800',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      boxShadow: '0 8px 20px -5px rgba(22, 163, 74, 0.3)',
    },
  };
  return (
    <div className="adoptify-adopt-wrapper" style={styles.wrapper}>
      <style>{`
        .adoptify-back-btn:hover { color: ${tokens.textPrimary} !important; }
        .adoptify-amount-btn:hover { border-color: ${tokens.brandPrimary} !important; }
        .adoptify-submit-btn:hover { transform: translateY(-2px); background: #15803D !important; }
        .adoptify-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }
        .rotate-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }


        @media (max-width: 640px) {
          .adoptify-adopt-wrapper { padding: 20px 16px !important; }
          .adoptify-adopt-card { padding: 24px 16px !important; }
          .adoptify-adopt-title { font-size: 26px !important; }
          .adoptify-amount-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .adoptify-payment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <button
        onClick={() => (id ? navigate(`/pet/${id}`) : navigate(-1))}
        className="adoptify-back-btn"
        style={styles.backBtn}
      >
        <ArrowLeft size={18} weight="bold" /> Повернутися до картки
      </button>

      <div className="adoptify-adopt-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <div style={styles.iconBadge}>
              <HandHeart size={44} weight="fill" />
            </div>
          </div>
          <h1 className="adoptify-adopt-title" style={styles.title}>
            Віртуальна опіка
          </h1>
          <p style={styles.subtitle}>
            Ваш внесок забезпечить хвостика їжею, лікуванням та турботою до моменту знаходження
            нової домівки.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.tabs}>
            <button
              type="button"
              onClick={() => setIsMonthly(true)}
              style={styles.tabBtn(isMonthly)}
            >
              Щомісячно
            </button>
            <button
              type="button"
              onClick={() => setIsMonthly(false)}
              style={styles.tabBtn(!isMonthly)}
            >
              Одноразово
            </button>
          </div>

          <div style={styles.formSection}>
            <label style={styles.label}>Сума внеску (грн)</label>
            <div className="adoptify-amount-grid" style={styles.grid}>
              {amounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountClick(amt)}
                  className="adoptify-amount-btn"
                  style={styles.amountBtn(selectedAmount === amt)}
                >
                  {amt}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Інша сума (грн)"
              value={customAmount}
              onChange={handleCustomChange}
              style={styles.input}
              onFocus={() => setSelectedAmount('custom')}
            />
          </div>

          <div style={styles.formSection}>
            <label style={styles.label}>Дані платника</label>
            <div className="adoptify-payment-grid" style={styles.paymentGrid}>
              <input
                type="text"
                placeholder="Введіть ім'я платника"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value.slice(0, 80))}
                style={styles.fieldInput}
              />
              <input
                type="email"
                placeholder="Введіть email для квитанції"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value.slice(0, 120))}
                style={styles.fieldInput}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Номер картки"
                value={cardNumber}
                onChange={handleCardNumberChange}
                style={{
                  ...styles.fieldInput,
                  gridColumn: '1 / -1',
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Строк дії"
                value={expiry}
                onChange={handleExpiryChange}
                style={styles.fieldInput}
              />
              <input
                type="password"
                inputMode="numeric"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                style={styles.fieldInput}
              />
            </div>
          </div>

          <div style={styles.infoBlock}>
            <CreditCard
              size={24}
              weight="fill"
              color="#16A34A"
              style={{
                flexShrink: 0,
                marginTop: '1px',
              }}
            />
            <p style={styles.infoText}>
              Усі операції безпечні та шифруються за стандартами PCI-DSS. Ви можете скасувати
              регулярну підписку у будь-який момент у вашому профілі.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="adoptify-submit-btn"
            style={styles.submitBtn}
          >
            {isSubmitting ? (
              <>
                <Spinner size={24} weight="bold" className="rotate-spinner" />
                З'єднання з банком...
              </>
            ) : (
              <>
                <Coins size={24} weight="fill" />
                Підтвердити та перейти до оплати
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default VirtualAdopt;
