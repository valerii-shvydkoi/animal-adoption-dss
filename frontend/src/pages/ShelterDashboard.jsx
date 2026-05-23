import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import AnalyticsDashboard from '../components/Shelter/AnalyticsDashboard';
import { ChartLineUp, X } from '@phosphor-icons/react';
const ShelterDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [shelterName, setShelterName] = useState('');
  const [shelterAddress, setShelterAddress] = useState('');
  const [shelterPhone, setShelterPhone] = useState('');
  const [shelterDescription, setShelterDescription] = useState('');
  const [rawShelterData, setRawShelterData] = useState(null);
  const [dbName, setDbName] = useState('Завантаження...');
  const [dbAddress, setDbAddress] = useState('Не вказано');
  const [dbPhone, setDbPhone] = useState('Не вказано');
  const [dbDescription, setDbDescription] = useState('Не вказано');
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        const response = await api.get('/shelter/analytics/');
        if (response.data) {
          setRawShelterData(response.data);
          setDbName(response.data.shelter_name || 'Невідомий притулок');
          setDbAddress(response.data.address || 'Не вказано');
          setDbPhone(response.data.phone || 'Не вказано');
          setDbDescription(response.data.description || 'Не вказано');
        }
      } catch (err) {
        console.error('Помилка при отриманні даних притулку:', err);
        setDbName('Помилка завантаження даних');
      }
    };
    fetchShelterData();
  }, [refreshKey]);
  const handleOpenEditModal = () => {
    if (rawShelterData) {
      setShelterName(rawShelterData.shelter_name || '');
      setShelterAddress(rawShelterData.address || '');
      setShelterPhone(rawShelterData.phone || '');
      setShelterDescription(rawShelterData.description || '');
    }
    setIsEditing(true);
  };
  const handleUpdateShelter = async (e) => {
    e.preventDefault();
    if (!shelterName.trim()) {
      alert('Назва притулку не може бути порожньою.');
      return;
    }
    try {
      await api.patch('/shelter/analytics/', {
        name: shelterName.trim(),
        address: shelterAddress.trim(),
        phone: shelterPhone.trim(),
        description: shelterDescription.trim(),
      });
      alert('Профіль притулку успішно оновлено.');
      setIsEditing(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Помилка оновлення притулку:', err);
      alert(err.response?.data?.detail || 'Не вдалося оновити профіль.');
    }
  };
  const styles = {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 24px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      width: '100%',
      backgroundColor: tokens.bgLight || 'transparent',
      position: 'relative',
    },
    headerSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '32px',
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    iconTitle: {
      color: tokens.brandPrimary || 'inherit',
      display: 'flex',
      alignItems: 'center',
    },
    mainTitle: {
      color: tokens.textPrimary || 'inherit',
      fontSize: '28px',
      fontWeight: '800',
      margin: 0,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      color: tokens.textSecondary || 'inherit',
      fontSize: '15px',
      margin: 0,
      lineHeight: '1.5',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    },
    modalContent: {
      background: tokens.white || '#FFFFFF',
      borderRadius: '20px',
      padding: '24px',
      width: '100%',
      maxWidth: '520px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      border: `1px solid ${tokens.borderDefault || 'transparent'}`,
      maxHeight: '85vh',
      overflowY: 'auto',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    formGroup: {
      marginBottom: '24px',
      borderBottom: '1px dashed #E2E8F0',
      paddingBottom: '16px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '800',
      color: tokens.textPrimary || '#1E293B',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      display: 'block',
      marginBottom: '8px',
    },
    staticCurrentBox: {
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '13px',
      color: '#475569',
      marginBottom: '10px',
      lineHeight: '1.4',
      wordBreak: 'break-word',
    },
    inputHintText: {
      display: 'block',
      fontSize: '11px',
      color: tokens.textSecondary || '#64748B',
      marginTop: '6px',
      lineHeight: '1.4',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      outline: 'none',
      color: tokens.textPrimary || '#1E293B',
      backgroundColor: '#FFFFFF',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      outline: 'none',
      color: tokens.textPrimary || '#1E293B',
      resize: 'vertical',
      minHeight: '80px',
      backgroundColor: '#FFFFFF',
    },
    btnPrimary: {
      background: tokens.brandPrimary || '#4F46E5',
      color: '#FFF',
      padding: '12px 20px',
      borderRadius: '10px',
      border: 'none',
      fontWeight: '700',
      cursor: 'pointer',
    },
    btnSecondary: {
      background: '#F1F5F9',
      color: '#334155',
      padding: '12px 20px',
      borderRadius: '10px',
      border: 'none',
      fontWeight: '700',
      cursor: 'pointer',
    },
  };
  return (
    <div className="dashboard-container" style={styles.container}>
      <style>{`
        @media (max-width: 480px) {
          .dashboard-container { padding: 16px 12px !important; }
          .main-dashboard-title { font-size: 22px !important; }
          .dashboard-modal-content { padding: 16px !important; max-height: 90vh !important; border-radius: 16px !important; }
          .modal-buttons-container { flex-direction: column-reverse !important; gap: 10px !important; }
          .modal-buttons-container button { width: 100% !important; padding: 14px !important; }
        }
        .dashboard-input-field:focus {
          border-color: ${tokens.brandPrimary || '#4F46E5'} !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
      `}</style>

      <div style={styles.headerSection}>
        <div style={styles.titleRow}>
          <div style={styles.iconTitle}>
            <ChartLineUp size={32} weight="bold" />
          </div>
          <h1 className="main-dashboard-title" style={styles.mainTitle}>
            Кабінет Притулку
          </h1>
        </div>
        <p style={styles.subtitle}>
          Керування процесами, моніторинг волонтерів та аналітика ефективності прилаштування тварин
        </p>
      </div>

      <AnalyticsDashboard key={refreshKey} onOpenEditProfile={handleOpenEditModal} />

      {isEditing && (
        <div style={styles.modalOverlay}>
          <div className="dashboard-modal-content" style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3
                style={{
                  margin: 0,
                  fontWeight: '800',
                  fontSize: '18px',
                  color: tokens.textPrimary,
                }}
              >
                Редагувати профіль
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: tokens.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <form onSubmit={handleUpdateShelter}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Назва притулку *</label>
                <div style={styles.staticCurrentBox}>{dbName}</div>
                <input
                  type="text"
                  className="dashboard-input-field"
                  placeholder="Введіть повну офіційну назву установи"
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Фактична адреса</label>
                <div style={styles.staticCurrentBox}>{dbAddress}</div>
                <input
                  type="text"
                  className="dashboard-input-field"
                  placeholder="Введіть точну адресу"
                  value={shelterAddress}
                  onChange={(e) => setShelterAddress(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Контактний телефон</label>
                <div style={styles.staticCurrentBox}>{dbPhone}</div>
                <input
                  type="tel"
                  className="dashboard-input-field"
                  placeholder="+380XXXXXXXXX"
                  value={shelterPhone}
                  onChange={(e) => setShelterPhone(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Про притулок</label>
                <div style={styles.staticCurrentBox}>{dbDescription}</div>
                <textarea
                  className="dashboard-input-field"
                  placeholder="Введіть опис діяльності"
                  value={shelterDescription}
                  onChange={(e) => setShelterDescription(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div
                className="modal-buttons-container"
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '24px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={styles.btnSecondary}
                >
                  Скасувати
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Зберегти зміни
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShelterDashboard;
