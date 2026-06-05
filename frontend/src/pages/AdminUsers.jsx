import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { tokens as globalTokens } from '../styles/tokens';
import {
  MagnifyingGlass,
  UserCircleGear,
  Prohibit,
  CheckCircle,
  User,
  ShieldCheck,
  HouseLine,
  Shield,
  Info,
  CaretDown,
  DotsThreeVertical,
  ArrowsCounterClockwise,
  X,
} from '@phosphor-icons/react';
const tokens = {
  ...globalTokens,
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '20px',
  roleAdmin: '#EF4444',
  roleAdminBg: '#FEF2F2',
  roleShelter: '#3B82F6',
  roleShelterBg: '#EFF6FF',
  roleVolunteer: '#10B981',
  roleVolunteerBg: '#ECFDF5',
  roleUser: '#64748B',
  roleUserBg: '#F8FAFC',
  brandPrimaryLight: '#FFF7ED',
  bgSurface: '#F1F5F9',
  borderDefault: globalTokens.borderDefault || '#E2E8F0',
  textPrimary: globalTokens.textPrimary || '#1E293B',
  textSecondary: globalTokens.textSecondary || '#64748B',
  textDisabled: globalTokens.textDisabled || '#94A3B8',
  bgWhite: '#FFFFFF',
};
const ROLE_LABELS = {
  ADMIN: {
    label: 'Адміністратор',
    color: tokens.roleAdmin,
    bg: tokens.roleAdminBg,
    icon: <Shield size={14} weight="fill" />,
  },
  SHELTER_MANAGER: {
    label: 'Керівник притулку',
    color: tokens.roleShelter,
    bg: tokens.roleShelterBg,
    icon: <HouseLine size={14} weight="fill" />,
  },
  VOLUNTEER: {
    label: 'Волонтер',
    color: tokens.roleVolunteer,
    bg: tokens.roleVolunteerBg,
    icon: <ShieldCheck size={14} weight="fill" />,
  },
  USER: {
    label: 'Користувач',
    color: tokens.roleUser,
    bg: tokens.roleUserBg,
    icon: <User size={14} weight="fill" />,
  },
};
const STATUS_LABELS = {
  ALL: 'Всі статуси',
  ACTIVE: 'Активні',
  BANNED: 'Заблоковані',
};
export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [activeMenuUser, setActiveMenuUser] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const roleFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuUser(null);
      }
      if (roleFilterRef.current && !roleFilterRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Токен авторизації відсутній. Будь ласка, увійдіть в акаунт повторно.');
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/admin/users/');
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setUsers(data);
    } catch (err) {
      console.error('Помилка запиту користувачів:', err.response);
      if (err.response?.status === 403) {
        setError('Доступ заборонено. Ваш акаунт не має прав адміністратора на сервері.');
      } else {
        setError(
          `Не вдалося завантажити список користувачів. Статус: ${err.response?.status || 'Мережева помилка'}`
        );
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: '',
    userId: null,
    userEmail: '',
    payload: null,
    title: '',
    message: '',
  });
  const openStatusModal = (user) => {
    setActiveMenuUser(null);
    const nextStatusText = user.is_active ? 'заблокувати' : 'активувати';
    setModalConfig({
      isOpen: true,
      type: 'status',
      userId: user.id,
      userEmail: user.email,
      payload: !user.is_active,
      title: `Підтвердження зміни статусу`,
      message: `Ви дійсно впевнені, що хочете ${nextStatusText} обліковий запис користувача ${user.email}?`,
    });
  };
  const openRoleModal = (user, newRole) => {
    setActiveMenuUser(null);
    const roleName = ROLE_LABELS[newRole]?.label || newRole;
    setModalConfig({
      isOpen: true,
      type: 'role',
      userId: user.id,
      userEmail: user.email,
      payload: newRole,
      title: `Підтвердження зміни ролі`,
      message: `Ви дійсно хочете змінити роль користувача ${user.email} на рівень "${roleName}"?`,
    });
  };
  const handleConfirmAction = async () => {
    const { type, userId, payload } = modalConfig;
    setModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
    setActionLoadingId(userId);
    setError(null);
    const body =
      type === 'status'
        ? {
            is_active: payload,
          }
        : {
            role: payload,
          };
    try {
      await api.patch(`/admin/users/${userId}/`, body);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                ...body,
              }
            : u
        )
      );
      showSuccess(
        type === 'status'
          ? 'Статус активності успішно оновлено.'
          : 'Роль користувача успішно змінено.'
      );
    } catch (err) {
      console.error('Помилка при оновленні користувача:', err.response);
      setError(
        err.response?.data?.detail || 'Не вдалося виконати операцію на бекенді. Перевірте лог.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.profile?.first_name || ''} ${u.profile?.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const matchSearch =
      fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.is_active) ||
      (statusFilter === 'BANNED' && !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });
  return (
    <div
      style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '16px 14px 80px 14px' : '40px 24px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .table-responsive { width: 100%; overflow-x: auto; background: ${tokens.bgWhite}; border: 1px solid ${tokens.borderDefault}; border-radius: ${tokens.radiusLg}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; min-width: 800px; table-layout: fixed; }
        .admin-table th { background: #F8FAFC; color: ${tokens.textSecondary}; font-size: 13px; font-weight: 700; padding: 16px; border-bottom: 1px solid ${tokens.borderDefault}; text-transform: uppercase; letter-spacing: 0.05em; }
        .admin-table td { padding: 16px; border-bottom: 1px solid ${tokens.borderDefault}; font-size: 14px; color: ${tokens.textPrimary}; vertical-align: middle; word-break: break-all; }
        .admin-table tr:hover { background: #F8FAFC; }

        .filter-dropdown-btn { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 170px; padding: 12px 16px; border-radius: ${tokens.radiusSm}; border: 1px solid ${tokens.borderDefault}; font-size: 14px; color: ${tokens.textPrimary}; background: ${tokens.bgWhite}; cursor: pointer; font-weight: 600; outline: none; transition: all 0.15s; text-align: left; }
        .filter-dropdown-btn:focus, .filter-dropdown-btn.active { border-color: ${tokens.brandPrimary}; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.08); }

        .search-input:focus { border-color: ${tokens.brandPrimary} !important; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.08) !important; }

        .clear-search-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 4px; color: ${tokens.textSecondary}; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.15s; z-index: 2; }
        .clear-search-btn:hover { background: #E2E8F0; color: ${tokens.textPrimary}; }

        .action-dot-btn { background: none; border: none; padding: 8px; color: ${tokens.textSecondary}; cursor: pointer; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .action-dot-btn:hover { background: #F1F5F9; color: ${tokens.textPrimary}; }

        .dropdown-wrapper { position: relative; display: inline-block; }
        .dropdown-menu-desktop { position: absolute; right: 0; background: ${tokens.bgWhite}; border: 1px solid ${tokens.borderDefault}; border-radius: ${tokens.radiusSm}; box-shadow: 0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.05); z-index: 100; width: 230px; padding: 6px 0; margin-top: 4px; animation: modalFade 0.15s ease-out; }

        .filter-dropdown-menu { left: 0; right: auto; width: 210px; }

        .dropdown-direction-down { top: 100%; }
        .dropdown-direction-up { bottom: 100%; margin-bottom: 4px; }

        .dropdown-item { width: 100%; padding: 10px 14px; font-size: 13.5px; text-align: left; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 10px; color: ${tokens.textPrimary}; font-weight: 600; box-sizing: border-box; }
        .dropdown-item:hover { background: #F8FAFC; color: ${tokens.brandPrimary}; }
        .dropdown-item.selected { background: ${tokens.brandPrimaryLight}; color: ${tokens.brandPrimary}; font-weight: 700; }

        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .mobile-user-card { background: ${tokens.bgWhite}; border: 1px solid ${tokens.borderDefault}; border-radius: ${tokens.radiusMd}; padding: 16px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); }

        .mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); z-index: 999; display: flex; align-items: flex-end; }
        .mobile-menu-sheet { width: 100%; background: ${tokens.bgWhite}; border-top-left-radius: ${tokens.radiusLg}; border-top-right-radius: ${tokens.radiusLg}; padding: 20px 16px 34px 16px; box-shadow: 0 -10px 25px rgba(0,0,0,0.1); animation: slideUp 0.25s ease-out; max-height: 85vh; overflow-y: auto; box-sizing: border-box; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1001; padding: 16px; box-sizing: border-box; }
        .modal-content { background: ${tokens.bgWhite}; border-radius: ${tokens.radiusLg}; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 24px; position: relative; animation: modalFade 0.2s ease-out; box-sizing: border-box; }
        .modal-btn { padding: 12px 20px; border-radius: ${tokens.radiusSm}; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes modalFade { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        @media (max-width: 768px) {
          .filters-container { flex-direction: column; align-items: stretch !important; gap: 14px !important; }
          .select-group { grid-template-columns: 1fr 1fr; display: grid; gap: 10px; }
          .filter-dropdown-btn { min-width: auto; width: 100%; }

          .search-input::placeholder { color: transparent !important; }
          .search-wrapper::after {
            content: "Пошук...";
            position: absolute;
            left: 42px;
            top: 50%;
            transform: translateY(-50%);
            color: ${tokens.textDisabled};
            font-size: 14px;
            pointer-events: none;
          }
          .search-wrapper:focus-within::after,
          .search-input:not(:placeholder-shown) ~ ::after {
            display: none !important;
          }
        }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(-360deg); } }
      `}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          borderBottom: `1px solid ${tokens.borderDefault}`,
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? '24px' : '32px',
              color: tokens.textPrimary,
              margin: '0 0 6px 0',
              fontWeight: '800',
              letterSpacing: '-0.02em',
            }}
          >
            Користувачі та ролі
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: tokens.textSecondary,
            }}
          >
            Керування правами доступу, ролями та блокуванням облікових записів системи.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            background: tokens.bgSurface,
            border: 'none',
            padding: '12px',
            borderRadius: tokens.radiusSm,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowsCounterClockwise
            size={20}
            className={loading ? 'spin-animation' : ''}
            style={{
              color: tokens.textPrimary,
            }}
          />
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            color: '#16A34A',
            padding: '14px',
            borderRadius: tokens.radiusSm,
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <CheckCircle size={20} weight="fill" /> {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#991B1B',
            padding: '14px',
            borderRadius: tokens.radiusSm,
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          <Prohibit
            size={20}
            weight="fill"
            style={{
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div>{error}</div>
        </div>
      )}

      <div
        className="filters-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          className="search-wrapper"
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
          }}
        >
          <MagnifyingGlass
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: tokens.textDisabled,
              pointerEvents: 'none',
              zIndex: 2,
            }}
            size={18}
          />
          <input
            type="text"
            className="search-input"
            placeholder="Пошук за email або ім'ям..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: searchTerm ? '12px 42px 12px 42px' : '12px 16px 12px 42px',
              borderRadius: tokens.radiusSm,
              border: `1px solid ${tokens.borderDefault}`,
              backgroundColor: tokens.bgWhite,
              color: tokens.textPrimary,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease-in-out',
            }}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              title="Очистити пошук"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>

        <div
          className="select-group"
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <div className="dropdown-wrapper" ref={roleFilterRef}>
            <button
              className={`filter-dropdown-btn ${isRoleDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsStatusDropdownOpen(false);
              }}
            >
              <span>{roleFilter === 'ALL' ? 'Всі ролі' : ROLE_LABELS[roleFilter]?.label}</span>
              <CaretDown
                size={14}
                style={{
                  color: tokens.textSecondary,
                  transform: isRoleDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {isRoleDropdownOpen && (
              <div className="dropdown-menu-desktop filter-dropdown-menu dropdown-direction-down">
                <button
                  className={`dropdown-item ${roleFilter === 'ALL' ? 'selected' : ''}`}
                  onClick={() => {
                    setRoleFilter('ALL');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  Всі ролі
                </button>
                <button
                  className={`dropdown-item ${roleFilter === 'USER' ? 'selected' : ''}`}
                  onClick={() => {
                    setRoleFilter('USER');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  Користувачі
                </button>
                <button
                  className={`dropdown-item ${roleFilter === 'VOLUNTEER' ? 'selected' : ''}`}
                  onClick={() => {
                    setRoleFilter('VOLUNTEER');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  Волонтери
                </button>
                <button
                  className={`dropdown-item ${roleFilter === 'SHELTER_MANAGER' ? 'selected' : ''}`}
                  onClick={() => {
                    setRoleFilter('SHELTER_MANAGER');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  Керівники притулків
                </button>
                <button
                  className={`dropdown-item ${roleFilter === 'ADMIN' ? 'selected' : ''}`}
                  onClick={() => {
                    setRoleFilter('ADMIN');
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  Адміністратори
                </button>
              </div>
            )}
          </div>

          <div className="dropdown-wrapper" ref={statusFilterRef}>
            <button
              className={`filter-dropdown-btn ${isStatusDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
            >
              <span>{STATUS_LABELS[statusFilter]}</span>
              <CaretDown
                size={14}
                style={{
                  color: tokens.textSecondary,
                  transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="dropdown-menu-desktop filter-dropdown-menu dropdown-direction-down">
                <button
                  className={`dropdown-item ${statusFilter === 'ALL' ? 'selected' : ''}`}
                  onClick={() => {
                    setStatusFilter('ALL');
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Всі статуси
                </button>
                <button
                  className={`dropdown-item ${statusFilter === 'ACTIVE' ? 'selected' : ''}`}
                  onClick={() => {
                    setStatusFilter('ACTIVE');
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Активні
                </button>
                <button
                  className={`dropdown-item ${statusFilter === 'BANNED' ? 'selected' : ''}`}
                  onClick={() => {
                    setStatusFilter('BANNED');
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Заблоковані
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: tokens.bgWhite,
            borderRadius: tokens.radiusLg,
            border: `1px solid ${tokens.borderDefault}`,
          }}
        >
          <UserCircleGear
            size={48}
            color={tokens.brandPrimary}
            className="spin-animation"
            style={{
              marginBottom: '16px',
            }}
          />
          <p
            style={{
              color: tokens.textSecondary,
              fontSize: '15px',
            }}
          >
            Отримання актуальних даних користувачів...
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: tokens.bgWhite,
            borderRadius: tokens.radiusLg,
            border: `1px solid ${tokens.borderDefault}`,
          }}
        >
          <Info
            size={40}
            color={tokens.textDisabled}
            style={{
              marginBottom: '12px',
            }}
          />
          <p
            style={{
              color: tokens.textSecondary,
              fontSize: '15px',
            }}
          >
            Користувачів не знайдено.
          </p>
        </div>
      ) : !isMobile ? (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  style={{
                    width: '22%',
                  }}
                >
                  Користувач
                </th>
                <th
                  style={{
                    width: '35%',
                  }}
                >
                  Email акаунту
                </th>
                <th
                  style={{
                    width: '23%',
                  }}
                >
                  Роль
                </th>
                <th
                  style={{
                    width: '13%',
                  }}
                >
                  Статус
                </th>
                <th
                  style={{
                    width: '7%',
                    textAlign: 'center',
                  }}
                >
                  Дії
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => {
                const roleMeta = ROLE_LABELS[u.role] || ROLE_LABELS['USER'];
                const openUpward = filteredUsers.length > 3 && index >= filteredUsers.length - 2;
                return (
                  <tr
                    key={u.id}
                    style={{
                      opacity: actionLoadingId === u.id ? 0.5 : 1,
                    }}
                  >
                    <td>
                      <div
                        style={{
                          fontWeight: '600',
                          color: tokens.textPrimary,
                          wordBreak: 'break-word',
                        }}
                      >
                        {[u.profile?.first_name, u.profile?.last_name].filter(Boolean).join(' ') ||
                          'Без імені'}
                        {currentUser?.id === u.id && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: tokens.brandPrimary,
                              marginLeft: '6px',
                              background: tokens.brandPrimaryLight,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: `1px solid ${tokens.brandPrimaryLight}`,
                            }}
                          >
                            Ви
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        color: tokens.textSecondary,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {u.email}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: roleMeta.bg,
                          color: roleMeta.color,
                        }}
                      >
                        {roleMeta.icon} {roleMeta.label}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#ECFDF5',
                            color: '#10B981',
                          }}
                        >
                          <CheckCircle size={14} weight="fill" /> Активний
                        </span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#FEF2F2',
                            color: '#EF4444',
                          }}
                        >
                          <Prohibit size={14} weight="fill" /> Заблокований
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                      }}
                    >
                      <div className="dropdown-wrapper">
                        <button
                          className="action-dot-btn"
                          onClick={() => setActiveMenuUser(activeMenuUser?.id === u.id ? null : u)}
                        >
                          <DotsThreeVertical size={22} weight="bold" />
                        </button>

                        {activeMenuUser?.id === u.id && (
                          <div
                            className={`dropdown-menu-desktop ${openUpward ? 'dropdown-direction-up' : 'dropdown-direction-down'}`}
                            ref={menuRef}
                          >
                            <div
                              style={{
                                padding: '6px 14px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                color: tokens.textDisabled,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Призначити роль
                            </div>
                            {u.role !== 'USER' && (
                              <button
                                className="dropdown-item"
                                onClick={() => openRoleModal(u, 'USER')}
                              >
                                <User size={14} weight="bold" /> Клієнт системи
                              </button>
                            )}
                            {u.role !== 'VOLUNTEER' && (
                              <button
                                className="dropdown-item"
                                onClick={() => openRoleModal(u, 'VOLUNTEER')}
                              >
                                <ShieldCheck size={14} weight="bold" /> Волонтер
                              </button>
                            )}
                            {u.role !== 'SHELTER_MANAGER' && (
                              <button
                                className="dropdown-item"
                                onClick={() => openRoleModal(u, 'SHELTER_MANAGER')}
                              >
                                <HouseLine size={14} weight="bold" /> Керівник притулку
                              </button>
                            )}
                            {u.role !== 'ADMIN' && (
                              <button
                                className="dropdown-item"
                                onClick={() => openRoleModal(u, 'ADMIN')}
                              >
                                <Shield size={14} weight="bold" /> Адміністратор
                              </button>
                            )}

                            {currentUser?.id !== u.id && (
                              <>
                                <div
                                  style={{
                                    height: '1px',
                                    background: tokens.borderDefault,
                                    margin: '6px 0',
                                  }}
                                />
                                <button
                                  className="dropdown-item"
                                  style={{
                                    color: u.is_active ? '#EF4444' : '#10B981',
                                  }}
                                  onClick={() => openStatusModal(u)}
                                >
                                  {u.is_active ? (
                                    <>
                                      <Prohibit size={14} weight="bold" /> Блокувати акаунт
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={14} weight="bold" /> Активувати акаунт
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {filteredUsers.map((u) => {
            const roleMeta = ROLE_LABELS[u.role] || ROLE_LABELS['USER'];
            return (
              <div
                key={u.id}
                className="mobile-user-card"
                style={{
                  opacity: actionLoadingId === u.id ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: tokens.textPrimary,
                        marginBottom: '2px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {[u.profile?.first_name, u.profile?.last_name].filter(Boolean).join(' ') ||
                        'Без імені'}
                      {currentUser?.id === u.id && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: tokens.brandPrimary,
                            marginLeft: '6px',
                            background: tokens.brandPrimaryLight,
                            padding: '2px 4px',
                            borderRadius: '4px',
                          }}
                        >
                          Ви
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: tokens.textSecondary,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {u.email}
                    </div>
                  </div>

                  <button className="action-dot-btn" onClick={() => setActiveMenuUser(u)}>
                    <DotsThreeVertical size={22} weight="bold" />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      backgroundColor: roleMeta.bg,
                      color: roleMeta.color,
                    }}
                  >
                    {roleMeta.icon} {roleMeta.label}
                  </span>
                  {u.is_active ? (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#10B981',
                      }}
                    >
                      <CheckCircle size={12} weight="fill" /> Активний
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#FEF2F2',
                        color: '#EF4444',
                      }}
                    >
                      <Prohibit size={12} weight="fill" /> Заблокований
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isMobile && activeMenuUser && (
        <div className="mobile-menu-overlay" onClick={() => setActiveMenuUser(null)}>
          <div className="mobile-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                borderBottom: `1px solid ${tokens.borderDefault}`,
                paddingBottom: '12px',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: tokens.textDisabled,
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                  }}
                >
                  Керування користувачем
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: tokens.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeMenuUser.email}
                </div>
              </div>
              <button
                onClick={() => setActiveMenuUser(null)}
                style={{
                  background: tokens.bgSurface,
                  border: 'none',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {activeMenuUser.role !== 'USER' && (
                <button
                  className="dropdown-item"
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                  }}
                  onClick={() => openRoleModal(activeMenuUser, 'USER')}
                >
                  <User size={18} weight="bold" /> Призначити: Користувач
                </button>
              )}
              {activeMenuUser.role !== 'VOLUNTEER' && (
                <button
                  className="dropdown-item"
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                  }}
                  onClick={() => openRoleModal(activeMenuUser, 'VOLUNTEER')}
                >
                  <ShieldCheck size={18} weight="bold" /> Призначити: Волонтер
                </button>
              )}
              {activeMenuUser.role !== 'SHELTER_MANAGER' && (
                <button
                  className="dropdown-item"
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                  }}
                  onClick={() => openRoleModal(activeMenuUser, 'SHELTER_MANAGER')}
                >
                  <HouseLine size={18} weight="bold" /> Призначити: Керівник притулку
                </button>
              )}
              {activeMenuUser.role !== 'ADMIN' && (
                <button
                  className="dropdown-item"
                  style={{
                    padding: '12px 14px',
                    fontSize: '14px',
                  }}
                  onClick={() => openRoleModal(activeMenuUser, 'ADMIN')}
                >
                  <Shield size={18} weight="bold" /> Призначити: Admin
                </button>
              )}

              {currentUser?.id !== activeMenuUser.id && (
                <>
                  <div
                    style={{
                      height: '1px',
                      background: tokens.borderDefault,
                      margin: '10px 0',
                    }}
                  />
                  <button
                    className="dropdown-item"
                    style={{
                      padding: '12px 14px',
                      fontSize: '14px',
                      color: activeMenuUser.is_active ? '#EF4444' : '#10B981',
                      backgroundColor: activeMenuUser.is_active ? '#FEF2F2' : '#ECFDF5',
                      borderRadius: tokens.radiusSm,
                    }}
                    onClick={() => openStatusModal(activeMenuUser)}
                  >
                    {activeMenuUser.is_active ? (
                      <>
                        <Prohibit size={18} weight="bold" /> Блокувати обліковий запис
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} weight="bold" /> Активувати обліковий запис
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalConfig.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() =>
                setModalConfig((prev) => ({
                  ...prev,
                  isOpen: false,
                }))
              }
              style={{
                position: 'absolute',
                right: '20px',
                top: '20px',
                background: 'none',
                border: 'none',
                color: tokens.textSecondary,
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: '18px',
                fontWeight: '700',
                color: tokens.textPrimary,
              }}
            >
              {modalConfig.title}
            </h3>

            <p
              style={{
                margin: '0 0 24px 0',
                fontSize: '14px',
                color: tokens.textSecondary,
                lineHeight: '1.5',
              }}
            >
              {modalConfig.message}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                className="modal-btn"
                style={{
                  background: tokens.bgSurface,
                  color: tokens.textPrimary,
                }}
                onClick={() =>
                  setModalConfig((prev) => ({
                    ...prev,
                    isOpen: false,
                  }))
                }
              >
                Скасувати
              </button>
              <button
                className="modal-btn"
                style={{
                  background:
                    modalConfig.type === 'status' && !modalConfig.payload
                      ? '#EF4444'
                      : tokens.brandPrimary,
                  color: '#FFF',
                }}
                onClick={handleConfirmAction}
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
