import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import {
  Plus,
  Pencil,
  CheckCircle,
  Trash,
  X,
  CaretDown,
  Image as ImageIcon,
  ClipboardText,
  UploadSimple,
  User,
} from '@phosphor-icons/react';
export default function ShelterPetManager() {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('DOG');
  const [petGender, setPetGender] = useState('MALE');
  const [petBreed, setPetBreed] = useState('');
  const [petAgeMonths, setPetAgeMonths] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petUrgency, setPetUrgency] = useState('REGULAR');
  const [petIsAvailable, setPetIsAvailable] = useState(true);
  const [petAllowVirtual, setPetAllowVirtual] = useState(false);
  const [petPhotoUrl, setPetPhotoUrl] = useState('');
  const [petPhotoFile, setPetPhotoFile] = useState(null);
  const [petPhotoPreview, setPetPhotoPreview] = useState('');
  const [petVideoUrl, setPetVideoUrl] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [petIsSterilized, setPetIsSterilized] = useState('UNKNOWN');
  const [petGoodWithChildren, setPetGoodWithChildren] = useState('UNKNOWN');
  const [petGoodWithCats, setPetGoodWithCats] = useState('UNKNOWN');
  const [petGoodWithDogs, setPetGoodWithDogs] = useState('UNKNOWN');
  const [petActivityLevel, setPetActivityLevel] = useState(3);
  const [petSociability, setPetSociability] = useState(3);
  const [petStressResistance, setPetStressResistance] = useState(3);
  const bgMain = tokens.bgMain || '#F8FAFC';
  const bgCard = tokens.bgCard || '#FFFFFF';
  const textMain = tokens.textMain || '#0F172A';
  const textMuted = tokens.textMuted || '#64748B';
  const borderColor = tokens.border || '#E2E8F0';
  const brandPrimary = tokens.brandPrimary || '#EA580C';
  const bgInput = tokens.bgInput || '#F1F5F9';
  const fileInputRef = useRef(null);
  const fetchShelterPets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/pets/?managed=true');
      if (response.data) {
        const data = response.data.results ? response.data.results : response.data;
        setPets(data);
      }
    } catch (err) {
      console.error('Помилка завантаження тварин притулку:', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchShelterPets();
  }, []);
  const getPetImage = (pet) => {
    if (pet.photo) return pet.photo;
    if (pet.photo_url) return pet.photo_url;
    return 'https://placehold.co/400?text=Немає+фото';
  };
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setPetPhotoUrl(text.trim());
          setPetPhotoFile(null);
          setPetPhotoPreview(text.trim());
          return;
        }
      }
      throw new Error('Немає прямого доступу до буфера');
    } catch (err) {
      const fallbackText = prompt('Вставте посилання на фотографію сюди (Ctrl+V або Cmd+V):');
      if (fallbackText) {
        setPetPhotoUrl(fallbackText.trim());
        setPetPhotoFile(null);
        setPetPhotoPreview(fallbackText.trim());
      }
    }
  };
  const handlePhotoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Оберіть файл зображення у форматі JPG, PNG або WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Фото завелике. Максимальний розмір файлу — 5 МБ.');
      return;
    }
    setPetPhotoFile(file);
    setPetPhotoUrl('');
    setPetPhotoPreview(URL.createObjectURL(file));
  };
  const handleOpenAddModal = () => {
    setEditingPetId(null);
    setPetName('');
    setPetSpecies('DOG');
    setPetGender('MALE');
    setPetBreed('');
    setPetAgeMonths('');
    setPetWeight('');
    setPetUrgency('REGULAR');
    setPetIsAvailable(true);
    setPetAllowVirtual(false);
    setPetPhotoUrl('');
    setPetPhotoFile(null);
    setPetPhotoPreview('');
    setPetVideoUrl('');
    setPetDescription('');
    setPetIsSterilized('UNKNOWN');
    setPetGoodWithChildren('UNKNOWN');
    setPetGoodWithCats('UNKNOWN');
    setPetGoodWithDogs('UNKNOWN');
    setPetActivityLevel(3);
    setPetSociability(3);
    setPetStressResistance(3);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (pet) => {
    setEditingPetId(pet.id);
    setPetName(pet.name === 'Без імені' ? '' : pet.name || '');
    setPetSpecies(pet.species || 'DOG');
    setPetGender(pet.gender || 'MALE');
    setPetBreed(pet.breed || '');
    setPetAgeMonths(pet.age_months !== undefined ? pet.age_months : '');
    setPetWeight(pet.weight !== undefined ? pet.weight : '');
    setPetUrgency(pet.urgency_status || 'REGULAR');
    setPetIsAvailable(!!pet.is_available);
    setPetAllowVirtual(pet.allow_virtual_adoption || false);
    setPetPhotoUrl(pet.photo_url || '');
    setPetPhotoFile(null);
    setPetPhotoPreview(pet.photo || pet.photo_url || '');
    setPetVideoUrl(pet.video_url || '');
    setPetDescription(pet.description || '');
    const sterilizedVal = String(pet.is_sterilized).toLowerCase();
    if (sterilizedVal === 'true' || sterilizedVal === 'yes') {
      setPetIsSterilized('true');
    } else if (sterilizedVal === 'false' || sterilizedVal === 'no') {
      setPetIsSterilized('false');
    } else {
      setPetIsSterilized('UNKNOWN');
    }
    setPetGoodWithChildren(pet.good_with_children || 'UNKNOWN');
    setPetGoodWithCats(pet.good_with_cats || 'UNKNOWN');
    setPetGoodWithDogs(pet.good_with_dogs || 'UNKNOWN');
    setPetActivityLevel(pet.activity_level || 3);
    setPetSociability(pet.sociability || 3);
    setPetStressResistance(pet.stress_resistance || 3);
    setIsModalOpen(true);
  };
  const handleSavePet = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const parsedAge = parseInt(petAgeMonths, 10);
    const parsedWeight = parseFloat(petWeight);
    if (isNaN(parsedAge) || parsedAge < 1) {
      alert('Вік тварини повинен бути не менше 1 місяця');
      return;
    }
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      alert('Вага тварини повинна бути більшою за 0 кг');
      return;
    }
    let cleanPhotoUrl = petPhotoUrl.trim();
    if (cleanPhotoUrl.length > 500) {
      alert(
        `Помилка: Посилання на фото занадто довге (${cleanPhotoUrl.length} симв.). Максимально дозволена довжина — 500 символів.`
      );
      return;
    }
    if (
      cleanPhotoUrl &&
      !cleanPhotoUrl.startsWith('http://') &&
      !cleanPhotoUrl.startsWith('https://')
    ) {
      alert("Помилка: Посилання на фото повинно обов'язково починатися з http:// або https://");
      return;
    }
    let sterilizedValue = null;
    if (petIsSterilized === 'true' || petIsSterilized === true) sterilizedValue = true;
    else if (petIsSterilized === 'false' || petIsSterilized === false) sterilizedValue = false;
    const payload = {
      name: petName.trim() || 'Без імені',
      species: petSpecies,
      gender: petGender,
      breed: petBreed.trim(),
      age_months: parsedAge,
      weight: parsedWeight,
      urgency_status: petUrgency,
      is_available: petIsAvailable,
      allow_virtual_adoption: petAllowVirtual,
      photo_url: cleanPhotoUrl || null,
      video_url: petVideoUrl.trim() || null,
      description: petDescription.trim(),
      is_sterilized: sterilizedValue,
      good_with_children: petGoodWithChildren,
      good_with_cats: petGoodWithCats,
      good_with_dogs: petGoodWithDogs,
      activity_level: Number(petActivityLevel),
      sociability: Number(petSociability),
      stress_resistance: Number(petStressResistance),
    };
    const requestConfig = petPhotoFile
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : undefined;
    const requestPayload = petPhotoFile ? new FormData() : payload;
    if (petPhotoFile) {
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          requestPayload.append(key, typeof value === 'boolean' ? String(value) : value);
        }
      });
      requestPayload.append('photo', petPhotoFile);
    }
    setIsSaving(true);
    try {
      if (editingPetId) {
        await api.patch(`/pets/${editingPetId}/`, requestPayload, requestConfig);
      } else {
        await api.post('/pets/', requestPayload, requestConfig);
      }
      setIsModalOpen(false);
      fetchShelterPets();
    } catch (err) {
      console.error('Помилка збереження картки тварини:', err);
      if (err.response && err.response.data) {
        const statusCode = err.response.status;
        const detail = err.response.data.detail || JSON.stringify(err.response.data, null, 2);
        alert(`Не вдалося зберегти картку (${statusCode}).\n${detail}`);
      } else if (err.request) {
        alert('Сервер не відповів (Network Error). Перевірте, чи працює Django бекенд.');
      } else {
        alert(`Помилка: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };
  const handleSetAdopted = async (id) => {
    if (!window.confirm("Перевести тварину в статус 'Вже в сім'ї'?")) return;
    try {
      await api.patch(`/pets/${id}/`, {
        is_available: false,
      });
      fetchShelterPets();
    } catch (err) {
      console.error('Помилка оновлення статусу:', err);
    }
  };
  const handleDeletePet = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю картку?')) return;
    try {
      await api.delete(`/pets/${id}/`);
      fetchShelterPets();
    } catch (err) {
      console.error('Помилка видалення:', err);
    }
  };
  const renderUrgencyBadge = (status) => {
    switch (status) {
      case 'EVACUATION':
        return (
          <span
            className="status-badge badge-orange"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
            }}
          >
            Евакуація
          </span>
        );
      case 'MEDICAL':
        return (
          <span
            className="status-badge badge-orange"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
            }}
          >
            Лікування
          </span>
        );
      default:
        return null;
    }
  };
  const renderCuratorBadge = (pet) => {
    const authorText = pet.volunteer_name || 'Команда притулку';
    const isManager = authorText.toLowerCase().includes('менеджер');
    const isVolunteer = authorText.toLowerCase().includes('волонтер');
    if (isManager) {
      return (
        <span
          className="status-badge badge-shelter"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <User size={14} weight="bold" />
          {authorText}
        </span>
      );
    } else if (isVolunteer) {
      return (
        <span
          className="status-badge badge-volunteer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <User size={14} weight="bold" />
          {authorText}
        </span>
      );
    }
    return (
      <span
        className="status-badge badge-gray"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <User size={14} weight="bold" />
        Куратор: Притулок
      </span>
    );
  };
  const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
  }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <label
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: textMuted,
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '0.5px',
        }}
      >
        {label}{' '}
        {required && (
          <span
            style={{
              color: brandPrimary,
            }}
          >
            *
          </span>
        )}
      </label>
      <div
        style={{
          position: 'relative',
        }}
      >
        <select
          className="form-select-custom"
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={16}
          weight="bold"
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: textMuted,
          }}
        />
      </div>
    </div>
  );
  return (
    <div
      className="pet-manager-container"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        color: textMain,
        padding: '40px 16px',
        backgroundColor: bgMain,
        borderRadius: '16px',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .pet-row-card { transition: all 0.3s ease; background-color: ${bgCard}; border: 1px solid ${borderColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .pet-row-card:hover { border-color: ${brandPrimary}; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); }

        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; display: inline-flex; align-items: center; }
        .badge-green { background-color: rgba(16, 185, 129, 0.1); color: #10B981; }
        .badge-gray { background-color: rgba(100, 116, 139, 0.1); color: ${textMuted}; }
        .badge-orange { background-color: rgba(234, 88, 12, 0.1); color: ${brandPrimary}; }
        .badge-volunteer { background-color: rgba(6, 182, 212, 0.1); color: #0891B2; }
        .badge-shelter { background-color: rgba(168, 85, 247, 0.1); color: #9333EA; }

        .form-input-custom { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid ${borderColor}; background-color: ${bgCard}; color: ${textMain}; outline: none; box-sizing: border-box; font-family: inherit; font-size: 15px; transition: all 0.2s ease; }
        .form-input-custom:focus { border-color: ${brandPrimary}; box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1); }
        .form-input-custom:disabled { background-color: ${bgInput}; cursor: not-allowed; }

        .form-select-custom { appearance: none; width: 100%; padding: 14px 40px 14px 16px; border-radius: 12px; border: 1px solid ${borderColor}; background-color: ${bgCard}; color: ${textMain}; outline: none; box-sizing: border-box; font-family: inherit; font-size: 15px; transition: all 0.2s ease; cursor: pointer; }
        .form-select-custom:focus { border-color: ${brandPrimary}; box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1); }
        .form-select-custom:disabled { background-color: ${bgInput}; cursor: not-allowed; }

        .paste-btn { padding: 0 18px; background-color: ${bgInput}; border: 1px solid ${borderColor}; border-radius: 12px; cursor: pointer; font-weight: 700; color: ${textMain}; display: flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap; font-size: 14px; }
        .paste-btn:hover:not(:disabled) { background-color: ${brandPrimary}; color: #fff; border-color: ${brandPrimary}; }
        .paste-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .section-divider { border-top: 1px solid ${borderColor}; margin: 32px 0 20px 0; padding-top: 24px; }
        .range-slider { width: 100%; accent-color: ${brandPrimary}; cursor: pointer; margin-top: 10px; height: 6px; border-radius: 4px; }
        .custom-checkbox-wrapper { display: flex; align-items: center; gap: 12px; margin-top: 12px; cursor: pointer; padding: 12px; border-radius: 12px; background-color: ${bgInput}; }

        .action-btn { transition: all 0.2s; }
        .action-btn:hover { transform: scale(1.05); }

        .pet-manager-preview-img { width: 85px; height: 85px; border-radius: 18px; object-fit: cover; background-color: ${bgInput}; border: 1px solid ${borderColor}; }

        @media (max-width: 768px) {
          .pet-manager-header { flex-direction: column !important; align-items: center !important; text-align: center; gap: 20px; }
          .add-pet-btn { width: 100% !important; justify-content: center; padding: 14px !important; }

          .pet-row-card { flex-direction: column !important; align-items: center !important; text-align: center; gap: 20px; padding: 24px !important; }
          .pet-info-wrapper { flex-direction: column !important; align-items: center !important; gap: 16px !important; width: 100%; }
          .pet-info-text { align-items: center !important; text-align: center; }
          .pet-manager-preview-img { width: 120px !important; height: 120px !important; border-radius: 50% !important; }
          .pet-badges { justify-content: center !important; flex-wrap: wrap; }

          .pet-actions-wrapper { width: 100% !important; justify-content: center !important; border-top: 1px solid ${borderColor}; padding-top: 20px; display: flex !important; gap: 12px !important; }
          .pet-actions-wrapper button { flex: 1 !important; justify-content: center !important; padding: 14px !important; }

          .pet-modal-box { padding: 24px 16px !important; width: calc(100% - 32px) !important; margin: 16px !important; }
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr !important; gap: 20px !important; }

          .form-input-custom, .form-select-custom { padding: 12px 14px !important; font-size: 16px !important; }
          .form-select-custom { padding-right: 40px !important; }

          .photo-input-group { flex-direction: column !important; gap: 12px !important; }
          .paste-btn { padding: 14px !important; justify-content: center; width: 100% !important; font-size: 15px !important; }

          .range-slider { height: 10px !important; margin-top: 14px !important; margin-bottom: 6px; }
          .custom-checkbox-wrapper { padding: 14px !important; }

          .modal-footer-btns { flex-direction: column-reverse; gap: 12px !important; }
          .modal-footer-btns button { width: 100%; padding: 16px !important; font-size: 16px !important; }
        }
      `}</style>

      <div
        className="pet-manager-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.5px',
              color: textMain,
            }}
          >
            Тварини притулку
          </h1>
          <p
            style={{
              color: textMuted,
              margin: '8px 0 0 0',
              fontSize: '16px',
            }}
          >
            Загальний каталог підопічних притулку та управління картками тварин.
          </p>
        </div>
        <button
          className="add-pet-btn"
          onClick={handleOpenAddModal}
          style={{
            backgroundColor: brandPrimary,
            color: '#FFF',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '14px',
            fontWeight: '700',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
          }}
        >
          <Plus weight="bold" size={20} /> Додати картку тварини
        </button>
      </div>

      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            color: textMuted,
          }}
        >
          Завантаження каталогу тварин...
        </div>
      ) : pets.length === 0 ? (
        <div
          style={{
            border: `2px dashed ${borderColor}`,
            padding: '80px 20px',
            borderRadius: '20px',
            textAlign: 'center',
            color: textMuted,
            backgroundColor: bgCard,
          }}
        >
          База даних притулку порожня. Додайте першу картку.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
          }}
        >
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="pet-row-card"
              style={{
                padding: '20px 24px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                className="pet-info-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                <img
                  className="pet-manager-preview-img"
                  src={getPetImage(pet)}
                  alt={pet.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/120?text=Помилка+фото';
                  }}
                />
                <div
                  className="pet-info-text"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '20px',
                      fontWeight: '800',
                      color: textMain,
                    }}
                  >
                    {pet.name}
                  </h4>

                  <div
                    className="pet-badges"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="status-badge badge-gray">
                      {pet.species === 'DOG' ? 'Собака' : pet.species === 'CAT' ? 'Кішка' : 'Інше'}
                      {pet.breed && ` • ${pet.breed}`}
                    </span>

                    <span
                      className={`status-badge ${pet.is_available ? 'badge-green' : 'badge-gray'}`}
                    >
                      {pet.is_available ? 'Шукає дім' : "Вже в сім'ї"}
                    </span>

                    {renderUrgencyBadge(pet.urgency_status)}

                    {renderCuratorBadge(pet)}
                  </div>
                </div>
              </div>

              <div
                className="pet-actions-wrapper"
                style={{
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <button
                  className="action-btn"
                  title="Редагувати"
                  onClick={() => handleOpenEditModal(pet)}
                  style={{
                    background: bgInput,
                    border: `1px solid ${borderColor}`,
                    color: textMain,
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pencil size={20} weight="bold" />
                </button>
                {pet.is_available && (
                  <button
                    className="action-btn"
                    title="Вже в сім'ї"
                    onClick={() => handleSetAdopted(pet.id)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: 'none',
                      color: '#10B981',
                      padding: '12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={20} weight="fill" />
                  </button>
                )}
                <button
                  className="action-btn"
                  title="Видалити"
                  onClick={() => handleDeletePet(pet.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#EF4444',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash size={20} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
        >
          <div
            className="pet-modal-box"
            style={{
              backgroundColor: bgMain,
              border: `1px solid ${borderColor}`,
              borderRadius: '24px',
              padding: '40px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: '800',
                  color: textMain,
                }}
              >
                {editingPetId ? 'Редагувати профіль' : 'Нова картка тварини'}
              </h3>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderColor}`,
                  color: textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '8px',
                  borderRadius: '50%',
                }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <form
              onSubmit={handleSavePet}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Кличка
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    className="form-input-custom"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Залиште пустим для 'Без імені'"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Порода
                  </label>
                  <input
                    type="text"
                    disabled={isSaving}
                    className="form-input-custom"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="Наприклад, Метис або Безпородна"
                  />
                </div>
              </div>

              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <CustomSelect
                  label="Вид"
                  value={petSpecies}
                  onChange={(e) => setPetSpecies(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'DOG',
                      label: 'Собака',
                    },
                    {
                      value: 'CAT',
                      label: 'Кішка',
                    },
                    {
                      value: 'OTHER',
                      label: 'Інше',
                    },
                  ]}
                />
                <CustomSelect
                  label="Стать"
                  value={petGender}
                  onChange={(e) => setPetGender(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'MALE',
                      label: 'Хлопчик',
                    },
                    {
                      value: 'FEMALE',
                      label: 'Дівчинка',
                    },
                  ]}
                />
              </div>

              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Вік (місяців) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={isSaving}
                    className="form-input-custom"
                    value={petAgeMonths}
                    onChange={(e) => setPetAgeMonths(e.target.value)}
                    required
                    placeholder="Наприклад, 12"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Вага (кг) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    disabled={isSaving}
                    className="form-input-custom"
                    value={petWeight}
                    onChange={(e) => setPetWeight(e.target.value)}
                    required
                    placeholder="Наприклад, 14.5"
                  />
                </div>
              </div>

              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <CustomSelect
                  label="Статус терміновості"
                  value={petUrgency}
                  onChange={(e) => setPetUrgency(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'REGULAR',
                      label: 'Планова адаптація',
                    },
                    {
                      value: 'EVACUATION',
                      label: 'Евакуація із зони',
                    },
                    {
                      value: 'MEDICAL',
                      label: 'Потребує лікування',
                    },
                  ]}
                />
                <CustomSelect
                  label="Доступність"
                  value={petIsAvailable ? 'true' : 'false'}
                  onChange={(e) => setPetIsAvailable(e.target.value === 'true')}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'true',
                      label: 'Шукає дім',
                    },
                    {
                      value: 'false',
                      label: "Вже в сім'ї",
                    },
                  ]}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: textMuted,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Опис
                </label>
                <textarea
                  className="form-input-custom"
                  rows="3"
                  disabled={isSaving}
                  value={petDescription}
                  onChange={(e) => setPetDescription(e.target.value)}
                  placeholder="Характер, звички та особливості тварини..."
                  style={{
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: bgCard,
                  padding: '20px',
                  borderRadius: '16px',
                  border: `1px solid ${borderColor}`,
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: textMuted,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Фото тварини
                </label>
                <div
                  className="photo-input-group"
                  style={{
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isSaving}
                    onChange={handlePhotoFileChange}
                    style={{
                      display: 'none',
                    }}
                  />
                  <input
                    type="url"
                    className="form-input-custom"
                    disabled={isSaving}
                    value={petPhotoUrl}
                    onChange={(e) => {
                      setPetPhotoUrl(e.target.value);
                      setPetPhotoFile(null);
                      setPetPhotoPreview(e.target.value);
                    }}
                    placeholder="Посилання на фото або оберіть файл"
                    style={{
                      flex: 1,
                    }}
                  />
                  <button
                    type="button"
                    className="paste-btn"
                    disabled={isSaving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadSimple size={20} weight="bold" /> Обрати
                  </button>
                  <button
                    type="button"
                    className="paste-btn"
                    disabled={isSaving}
                    onClick={handlePasteFromClipboard}
                  >
                    <ClipboardText size={20} weight="bold" /> URL
                  </button>
                </div>

                {petPhotoPreview ? (
                  <div
                    style={{
                      marginTop: '16px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      height: '220px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bgMain,
                    }}
                  >
                    <img
                      src={petPhotoPreview}
                      alt="Попередній перегляд"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://placehold.co/600x300?text=Некоректне+посилання+на+зображення';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '16px',
                      borderRadius: '12px',
                      border: `2px dashed ${borderColor}`,
                      height: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: textMuted,
                      backgroundColor: bgMain,
                    }}
                  >
                    <ImageIcon
                      size={28}
                      weight="duotone"
                      style={{
                        marginBottom: '4px',
                        opacity: 0.6,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                      }}
                    >
                      Додайте фото з комп'ютера або вставте посилання
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: textMuted,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Посилання на відео
                </label>
                <input
                  type="url"
                  className="form-input-custom"
                  disabled={isSaving}
                  value={petVideoUrl}
                  onChange={(e) => setPetVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <label className="custom-checkbox-wrapper">
                <input
                  type="checkbox"
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: brandPrimary,
                  }}
                  disabled={isSaving}
                  checked={petAllowVirtual}
                  onChange={(e) => setPetAllowVirtual(e.target.checked)}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                >
                  Дозволити віртуальну опіку
                </span>
              </label>

              <div className="section-divider">
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: textMain,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Сумісність та психологія
                </span>
              </div>

              <div
                className="form-grid-3"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '20px',
                }}
              >
                <CustomSelect
                  label="З дітьми"
                  value={petGoodWithChildren}
                  onChange={(e) => setPetGoodWithChildren(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'YES',
                      label: 'Так',
                    },
                    {
                      value: 'NO',
                      label: 'Ні',
                    },
                    {
                      value: 'UNKNOWN',
                      label: 'Невідомо',
                    },
                  ]}
                />
                <CustomSelect
                  label="З котами"
                  value={petGoodWithCats}
                  onChange={(e) => setPetGoodWithCats(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'YES',
                      label: 'Так',
                    },
                    {
                      value: 'NO',
                      label: 'Ні',
                    },
                    {
                      value: 'UNKNOWN',
                      label: 'Невідомо',
                    },
                  ]}
                />
                <CustomSelect
                  label="З собаками"
                  value={petGoodWithDogs}
                  onChange={(e) => setPetGoodWithDogs(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'YES',
                      label: 'Так',
                    },
                    {
                      value: 'NO',
                      label: 'Ні',
                    },
                    {
                      value: 'UNKNOWN',
                      label: 'Невідомо',
                    },
                  ]}
                />
              </div>

              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <CustomSelect
                  label="Стерилізація"
                  value={petIsSterilized}
                  onChange={(e) => setPetIsSterilized(e.target.value)}
                  disabled={isSaving}
                  options={[
                    {
                      value: 'true',
                      label: 'Так',
                    },
                    {
                      value: 'false',
                      label: 'Ні',
                    },
                    {
                      value: 'UNKNOWN',
                      label: 'Невідомо',
                    },
                  ]}
                />
                <div>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Активність</span>
                    <span
                      style={{
                        color: brandPrimary,
                      }}
                    >
                      {petActivityLevel}/5
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="range-slider"
                    disabled={isSaving}
                    value={petActivityLevel}
                    onChange={(e) => setPetActivityLevel(e.target.value)}
                  />
                </div>
              </div>

              <div
                className="form-grid-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Соціальність</span>
                    <span
                      style={{
                        color: brandPrimary,
                      }}
                    >
                      {petSociability}/5
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="range-slider"
                    disabled={isSaving}
                    value={petSociability}
                    onChange={(e) => setPetSociability(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: textMuted,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Стресостійкість</span>
                    <span
                      style={{
                        color: brandPrimary,
                      }}
                    >
                      {petStressResistance}/5
                    </span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    className="range-slider"
                    disabled={isSaving}
                    value={petStressResistance}
                    onChange={(e) => setPetStressResistance(e.target.value)}
                  />
                </div>
              </div>

              <div
                className="modal-footer-btns"
                style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-end',
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: `1px solid ${borderColor}`,
                }}
              >
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: bgCard,
                    color: textMain,
                    border: `1px solid ${borderColor}`,
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: brandPrimary,
                    color: '#FFF',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Збереження...' : editingPetId ? 'Зберегти зміни' : 'Створити картку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
