import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import {
  PawPrint,
  MapPin,
  VideoCamera,
  ShieldCheck,
  Tag,
  Image as ImageIcon,
  CircleNotch,
} from '@phosphor-icons/react';
const DEFAULT_FORM_VALUES = {
  name: '',
  species: 'DOG',
  gender: 'MALE',
  age_months: '',
  weight: '',
  activity_level: 3,
  sociability: 3,
  stress_resistance: 3,
  description: '',
  is_available: true,
  city: '',
  urgency_status: 'REGULAR',
  video_url: '',
  allow_virtual_adoption: false,
  good_with_children: 'UNKNOWN',
  good_with_cats: 'UNKNOWN',
  good_with_dogs: 'UNKNOWN',
  is_sterilized: 'UNKNOWN',
  behavior_tags: '',
};
const PetForm = ({ pet, onSuccess }) => {
  const getInitialValues = (petData) => {
    return {
      ...DEFAULT_FORM_VALUES,
      ...petData,
      urgency_status:
        petData?.urgency_status || petData?.urgencyStatus || DEFAULT_FORM_VALUES.urgency_status,
      behavior_tags:
        petData?.behavior_tags && Array.isArray(petData.behavior_tags)
          ? petData.behavior_tags.join(', ')
          : petData?.behavior_tags || DEFAULT_FORM_VALUES.behavior_tags,
    };
  };
  const [formData, setFormData] = useState(() => getInitialValues(pet));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(pet?.photo_url || pet?.photo || null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    setFormData(getInitialValues(pet));
    setPhotoPreview(pet?.photo_url || pet?.photo || null);
    setPhotoFile(null);
  }, [pet]);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isSmallMobile = windowWidth <= 350;
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'behavior_tags') {
          const tagsArray =
            typeof formData[key] === 'string'
              ? formData[key]
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
              : formData[key];
          submitData.append(key, JSON.stringify(tagsArray));
        } else if (
          ['good_with_children', 'good_with_cats', 'good_with_dogs', 'is_sterilized'].includes(key)
        ) {
          submitData.append(key, formData[key]);
        } else if (key === 'is_available' || key === 'allow_virtual_adoption') {
          submitData.append(key, formData[key] ? 'true' : 'false');
        } else {
          if (formData[key] !== null && formData[key] !== '') {
            submitData.append(key, formData[key]);
          }
        }
      });
      if (photoFile) {
        submitData.append('photo', photoFile);
      }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      if (pet?.id) {
        await api.put(`/pets/${pet.id}/`, submitData, config);
      } else {
        await api.post('/pets/', submitData, config);
      }
      if (!pet) {
        setFormData(DEFAULT_FORM_VALUES);
        setPhotoFile(null);
        setPhotoPreview(null);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Помилка збереження тварини', err.response?.data || err);
      const serverError = err.response?.data ? JSON.stringify(err.response.data) : '';
      alert(
        `Помилка при збереженні! Перевірте правильність заповнення полів.\nДеталі: ${serverError}`
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: isSmallMobile ? '4px' : '0',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="adoptify-pet-form"
        style={{
          background: '#FFF',
          padding: isSmallMobile ? '20px 14px' : '32px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="adoptify-pet-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: tokens.textPrimary || '#0F172A',
              fontSize: isSmallMobile ? '20px' : '24px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PawPrint
              size={isSmallMobile ? 24 : 28}
              color={tokens.brandPrimary || '#EA580C'}
              weight="fill"
            />
            {pet ? 'Редагувати профіль' : 'Додати нову тварину'}
          </h3>

          <label
            className="adoptify-status-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              color: tokens.brandPrimary || '#EA580C',
              background: tokens.brandPrimaryLight || '#FFEDD5',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          >
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_available: e.target.checked,
                })
              }
              style={{
                accentColor: tokens.brandPrimary || '#EA580C',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            Активна картка (шукає дім)
          </label>
        </div>

        <div
          className="adoptify-photo-upload-zone"
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            padding: '16px',
            background: tokens.bgSurface || '#F8FAFC',
            borderRadius: '16px',
            border: `1px dashed ${tokens.borderDefault || '#E2E8F0'}`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Прев'ю"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <ImageIcon size={36} color="#94A3B8" weight="fill" />
            )}
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <h4
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                fontWeight: '700',
                color: tokens.textPrimary || '#0F172A',
              }}
            >
              Головне фото
            </h4>
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: tokens.textSecondary || '#64748B',
                lineHeight: '1.4',
              }}
            >
              Рекомендовано 800x600 px (JPG, PNG).
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{
                display: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="adoptify-file-trigger-btn"
              style={{
                padding: '8px 14px',
                background: '#FFF',
                border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                color: tokens.textPrimary || '#0F172A',
                fontSize: '13px',
                transition: 'all 0.2s',
              }}
            >
              Обрати файл
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label className="adoptify-input-label">Ім'я тварини</label>
            <input
              required
              placeholder="Наприклад: Барсік"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="adoptify-pet-input"
            />
          </div>
          <div>
            <label className="adoptify-input-label">Вік (місяців)</label>
            <input
              required
              type="number"
              min="0"
              placeholder="Вік"
              value={formData.age_months}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age_months: Number(e.target.value),
                })
              }
              className="adoptify-pet-input"
            />
          </div>
          <div>
            <label className="adoptify-input-label">Вага (кг)</label>
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Вага"
              value={formData.weight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weight: Number(e.target.value),
                })
              }
              className="adoptify-pet-input"
            />
          </div>
          <div>
            <label className="adoptify-input-label">Вид</label>
            <select
              value={formData.species}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  species: e.target.value,
                })
              }
              className="adoptify-pet-input"
            >
              <option value="DOG">Собака</option>
              <option value="CAT">Кіт</option>
            </select>
          </div>
          <div>
            <label className="adoptify-input-label">Стать</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
              className="adoptify-pet-input"
            >
              <option value="MALE">Хлопчик</option>
              <option value="FEMALE">Дівчинка</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label
              className="adoptify-input-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <MapPin size={16} weight="bold" /> Місто перебування
            </label>
            <input
              required
              placeholder="Наприклад: Київ"
              value={formData.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  city: e.target.value,
                })
              }
              className="adoptify-pet-input"
            />
          </div>
          <div>
            <label
              className="adoptify-input-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <VideoCamera size={16} weight="bold" /> Посилання на відео
            </label>
            <input
              type="url"
              placeholder="YouTube або TikTok URL"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  video_url: e.target.value,
                })
              }
              className="adoptify-pet-input"
            />
          </div>
          <div>
            <label className="adoptify-input-label">Статус терміновості</label>
            <select
              value={formData.urgency_status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  urgency_status: e.target.value,
                })
              }
              className="adoptify-pet-input"
            >
              <option value="REGULAR">Планова адаптація</option>
              <option value="EVACUATION">Евакуація (із зони бойових дій)</option>
              <option value="MEDICAL">Лікування (потребує медичного догляду)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
            background: tokens.bgSurface || '#F8FAFC',
            borderRadius: '16px',
            border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
            boxSizing: 'border-box',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              color: tokens.textPrimary || '#0F172A',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
            }}
          >
            <Tag size={18} weight="bold" /> Поведінка та Сумісність
          </h4>

          <div>
            <label
              className="adoptify-input-label"
              style={{
                fontWeight: '600',
              }}
            >
              Теги характеру (через кому)
            </label>
            <input
              placeholder="Грайливий, Любить спати, Охоронець..."
              value={formData.behavior_tags}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behavior_tags: e.target.value,
                })
              }
              className="adoptify-pet-input"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div>
              <label className="adoptify-input-label">Ладнає з дітьми?</label>
              <select
                value={formData.good_with_children}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    good_with_children: e.target.value,
                  })
                }
                className="adoptify-pet-input"
              >
                <option value="UNKNOWN">Невідомо</option>
                <option value="YES">Так</option>
                <option value="NO">Ні</option>
              </select>
            </div>
            <div>
              <label className="adoptify-input-label">Дружить з котами?</label>
              <select
                value={formData.good_with_cats}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    good_with_cats: e.target.value,
                  })
                }
                className="adoptify-pet-input"
              >
                <option value="UNKNOWN">Невідомо</option>
                <option value="YES">Так</option>
                <option value="NO">Ні</option>
              </select>
            </div>
            <div>
              <label className="adoptify-input-label">Дружить з собаками?</label>
              <select
                value={formData.good_with_dogs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    good_with_dogs: e.target.value,
                  })
                }
                className="adoptify-pet-input"
              >
                <option value="UNKNOWN">Невідомо</option>
                <option value="YES">Так</option>
                <option value="NO">Ні</option>
              </select>
            </div>
            <div>
              <label className="adoptify-input-label">Стерилізація</label>
              <select
                value={formData.is_sterilized}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_sterilized: e.target.value,
                  })
                }
                className="adoptify-pet-input"
              >
                <option value="UNKNOWN">Невідомо</option>
                <option value="true">Так</option>
                <option value="false">Ні</option>
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: '8px',
            }}
          >
            <label
              className="adoptify-custom-checkbox-label"
              style={{
                color: '#10B981',
              }}
            >
              <input
                type="checkbox"
                checked={formData.allow_virtual_adoption}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allow_virtual_adoption: e.target.checked,
                  })
                }
                style={{
                  accentColor: '#10B981',
                }}
              />
              Віртуальна опіка (Донати)
            </label>
          </div>
        </div>

        <div>
          <label className="adoptify-input-label">Детальний опис</label>
          <textarea
            required
            placeholder="Розкажіть історію тварини..."
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            className="adoptify-pet-input"
            style={{
              minHeight: '110px',
              resize: 'vertical',
              padding: '12px 16px',
            }}
          />
        </div>

        <div
          style={{
            padding: '16px',
            background: tokens.bgSurface || '#F8FAFC',
            borderRadius: '16px',
            border: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
            boxSizing: 'border-box',
          }}
        >
          <h4
            className="adoptify-algorithm-header"
            style={{
              margin: '0 0 16px 0',
              fontSize: '13px',
              color: tokens.textSecondary || '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
            }}
          >
            <ShieldCheck size={18} weight="bold" /> ХАРАКТЕРИСТИКИ ДЛЯ АЛГОРИТМУ (1-5)
          </h4>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            className="adoptify-range-stack"
          >
            {[
              {
                label: 'Рівень активності',
                key: 'activity_level',
              },
              {
                label: 'Соціальність',
                key: 'sociability',
              },
              {
                key: 'stress_resistance',
                label: 'Стресостійкість',
              },
            ].map((trait) => (
              <label
                key={trait.key}
                className="adoptify-range-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: tokens.textPrimary || '#0F172A',
                }}
              >
                <span
                  style={{
                    flex: 1,
                  }}
                >
                  {trait.label}:{' '}
                  <strong
                    style={{
                      color: tokens.brandPrimary || '#EA580C',
                    }}
                  >
                    {formData[trait.key]}
                  </strong>
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData[trait.key]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [trait.key]: Number(e.target.value),
                    })
                  }
                  style={{
                    width: '200px',
                    accentColor: tokens.brandPrimary || '#EA580C',
                    cursor: 'pointer',
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="adoptify-pet-submit-btn">
          {loading ? (
            <>
              <CircleNotch
                size={18}
                style={{
                  animation: 'spin 1.5s linear infinite',
                }}
              />{' '}
              Збереження...
            </>
          ) : (
            'Зберегти профіль тварини'
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .adoptify-input-label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 700;
          color: ${tokens.textSecondary || '#64748B'};
          margin-left: 2px;
        }

        .adoptify-pet-input {
          padding: 0 16px;
          height: 46px;
          border-radius: ${tokens.radiusMd || '12px'};
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          font-size: 14px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          background-color: #FFF;
          color: ${tokens.textPrimary || '#0F172A'};
          font-weight: 500;
          transition: all 0.2s ease;
        }

        select.adoptify-pet-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2364748B' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'%3E%3Cpath%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 16px center !important;
          background-size: 16px !important;
          padding-right: 40px !important;
          appearance: none;
        }

        .adoptify-pet-input:focus {
          border-color: ${tokens.brandPrimary || '#EA580C'} !important;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15) !important;
        }
        textarea.adoptify-pet-input {
          padding: 12px 16px !important;
          height: auto !important;
        }

        .adoptify-pet-submit-btn {
          padding: 16px;
          background: ${tokens.brandPrimary || '#EA580C'};
          color: #FFF;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 16px -4px rgba(234, 88, 12, 0.4);
        }
        .adoptify-pet-submit-btn:hover:not(:disabled) {
          background: #C2410C !important;
          transform: translateY(-1px);
        }
        .adoptify-pet-submit-btn:disabled {
          background: ${tokens.textDisabled || '#CBD5E1'} !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          opacity: 0.7 !important;
        }

        .adoptify-custom-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: ${tokens.textPrimary || '#0F172A'};
        }
        .adoptify-custom-checkbox-label input[type="checkbox"] {
          accent-color: ${tokens.brandPrimary || '#EA580C'};
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .adoptify-pet-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .adoptify-status-toggle { width: 100% !important; justify-content: center !important; }
          .adoptify-photo-upload-zone { flex-direction: column !important; text-align: center !important; }
          .adoptify-range-row { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
          .adoptify-range-row input[type="range"] { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};
export default PetForm;
