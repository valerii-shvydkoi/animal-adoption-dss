import React, { useState, useEffect } from 'react';
import { volunteerPetApi, tokens } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import {
  PawPrint,
  Plus,
  Heartbeat,
  GenderMale,
  GenderFemale,
  Calendar,
  Info,
  X,
  Pencil,
  User,
} from '@phosphor-icons/react';
import PetForm from '../components/PetForm';
export default function VolunteerPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const fetchMyPets = () => {
    setLoading(true);
    volunteerPetApi
      .getMyPets()
      .then((res) => {
        const data = res.data.results ? res.data.results : res.data;
        setPets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Помилка завантаження підопічних з сервера:', err);
        setPets([]);
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchMyPets();
  }, []);
  const handleOpenAddModal = () => {
    setEditingPet(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPet(null);
  };
  const handleFormSuccess = () => {
    handleCloseModal();
    fetchMyPets();
  };
  const formatAge = (months) => {
    if (!months || months <= 0) return 'Вік невідомий';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} міс.`;
    if (remainingMonths === 0) return `${years} р.`;
    return `${years} р. ${remainingMonths} міс.`;
  };
  const formatUrgencyStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'HIGH':
      case 'EVACUATION':
        return 'Евакуація';
      case 'MEDIUM':
        return 'Середня терміновість';
      case 'MEDICAL':
        return 'Медичний догляд';
      case 'LOW':
        return 'Низька терміновість';
      case 'REGULAR':
      default:
        return 'Плановий';
    }
  };
  return (
    <div className="pets-page-container">
      <style>{`
        .pets-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
          font-family: 'Inter', system-ui, sans-serif;
          box-sizing: border-box;
          color: ${tokens.textPrimary || '#0F172A'};
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          padding-bottom: 20px;
          gap: 16px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-add-pet {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: ${tokens.brandPrimary || '#EA580C'};
          color: #FFF;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
        }

        .btn-add-pet:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.3);
        }

        .pets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .pet-card {
          background: #FFF;
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s ease;
        }

        .pet-card:hover {
          border-color: ${tokens.brandPrimary || '#EA580C'};
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }

        .pet-image-container {
          height: 220px;
          background: #F1F5F9;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .dynamic-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .badge-vol {
          background: rgba(6, 182, 212, 0.9);
          backdrop-filter: blur(4px);
        }

        .badge-mgr {
          background: rgba(147, 51, 234, 0.9);
          backdrop-filter: blur(4px);
        }

        .btn-edit-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #FFF;
          border: none;
          color: ${tokens.textPrimary || '#0F172A'};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
          z-index: 2;
        }

        .btn-edit-badge:hover {
          background: ${tokens.brandPrimary || '#EA580C'};
          color: #FFF;
          transform: scale(1.05);
        }

        .pet-info {
          padding: 24px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pet-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .pet-name {
          font-size: 22px;
          font-weight: 800;
          color: ${tokens.textPrimary || '#0F172A'};
          margin: 0;
          line-height: 1.2;
        }

        .gender-icon {
          display: flex;
          align-items: center;
          background: #F8FAFC;
          padding: 6px;
          border-radius: 50%;
        }

        .pet-detail {
          font-size: 14px;
          color: ${tokens.textSecondary || '#64748B'};
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .pet-detail strong {
          color: ${tokens.textPrimary || '#0F172A'};
          font-weight: 700;
        }


        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 5000;
          padding: 16px;
        }

        .modal-card {
          background: #FFF;
          border-radius: 24px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overscroll-behavior: contain;
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #F1F5F9;
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748B;
          z-index: 5010;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: #E2E8F0;
          color: #0F172A;
        }


        @media (max-width: 768px) {
          .pets-page-container {
            padding: 24px 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 20px;
            padding-bottom: 24px;
          }

          .page-title {
            font-size: 26px;
            justify-content: center;
          }

          .btn-add-pet {
            width: 100%;
            padding: 14px;
          }

          .pets-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .modal-card {
            max-height: 95vh;
            border-radius: 20px;
          }

          .modal-close-btn {
            top: 16px;
            right: 16px;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">
          <PawPrint
            size={36}
            weight="duotone"
            style={{
              color: tokens.brandPrimary || '#EA580C',
            }}
          />
          Мої підопічні
        </h1>
        <button className="btn-add-pet" onClick={handleOpenAddModal}>
          <Plus size={20} weight="bold" /> Додати тваринку
        </button>
      </div>

      {loading ? (
        <p
          style={{
            color: tokens.textSecondary || '#64748B',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: '500',
            marginTop: '40px',
          }}
        >
          Завантаження каталогу...
        </p>
      ) : pets.length === 0 ? (
        <div
          style={{
            border: '2px dashed #E2E8F0',
            padding: '60px 20px',
            borderRadius: '20px',
            textAlign: 'center',
            color: '#64748B',
            background: '#F8FAFC',
          }}
        >
          <Info
            size={40}
            style={{
              marginBottom: '12px',
              opacity: 0.5,
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            У вас поки немає доданих підопічних тварин.
          </p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => {
            const authorText = pet.volunteer_name || pet.created_by_name || 'Мій підопічний';
            const badgeClass = 'dynamic-badge badge-vol';
            return (
              <div key={pet.id} className="pet-card">
                <span className={badgeClass}>
                  <User size={14} weight="bold" />
                  {authorText}
                </span>

                <button
                  className="btn-edit-badge"
                  title="Редагувати профіль"
                  onClick={() => handleOpenEditModal(pet)}
                >
                  <Pencil size={18} weight="bold" />
                </button>

                <div className="pet-image-container">
                  {pet.photo || pet.photo_url ? (
                    <img
                      src={resolveMediaUrl(pet.photo || pet.photo_url)}
                      alt={pet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Heartbeat size={48} weight="duotone" opacity={0.5} />
                  )}
                </div>

                <div className="pet-info">
                  <div className="pet-name-row">
                    <h3 className="pet-name">{pet.name}</h3>
                    <span className="gender-icon">
                      {pet.gender?.toUpperCase() === 'MALE' ? (
                        <GenderMale
                          size={22}
                          weight="bold"
                          style={{
                            color: '#0284C7',
                          }}
                        />
                      ) : (
                        <GenderFemale
                          size={22}
                          weight="bold"
                          style={{
                            color: '#DB2777',
                          }}
                        />
                      )}
                    </span>
                  </div>

                  <div className="pet-detail">
                    <strong>Вид:</strong> {pet.species === 'DOG' ? 'Собака' : 'Кіт'}
                    {pet.breed && pet.breed !== 'Без породи' ? ` • ${pet.breed}` : ''}
                  </div>

                  <div className="pet-detail">
                    <strong>Статус:</strong> {formatUrgencyStatus(pet.urgency_status)}
                  </div>

                  <div className="pet-detail">
                    <Calendar
                      size={16}
                      weight="bold"
                      style={{
                        color: tokens.brandPrimary || '#EA580C',
                      }}
                    />
                    {formatAge(pet.age_months)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal} title="Закрити">
              <X size={18} weight="bold" />
            </button>
            <div
              style={{
                padding: '32px 24px 24px 24px',
              }}
            >
              <PetForm pet={editingPet} onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
