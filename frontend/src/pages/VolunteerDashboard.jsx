import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { tokens } from '../styles/tokens';
import {
  ShieldCheck,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  UsersThree,
  PawPrint,
  CaretRight,
} from '@phosphor-icons/react';
export default function VolunteerDashboard() {
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get('/volunteer/my-status/')
      .then((res) => {
        setMyRequest(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Заявку ще не створено або помилка мережі', err);
        setLoading(false);
      });
  }, []);
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING')
      return (
        <span className="badge badge-pending">
          <Clock weight="bold" /> На розгляді
        </span>
      );
    if (s === 'APPROVED')
      return (
        <span className="badge badge-approved">
          <CheckCircle weight="bold" /> Затверджено
        </span>
      );
    return (
      <span className="badge badge-rejected">
        <XCircle weight="bold" /> Відхилено
      </span>
    );
  };
  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
        }
        .dashboard-header {
          margin-bottom: 32px;
        }
        .dashboard-title {
          color: ${tokens.textPrimary || '#0F172A'};
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        .dashboard-subtitle {
          color: ${tokens.textSecondary || '#64748B'};
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        .card-main, .card-side {
          background: #FFF;
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          border-radius: 20px;
          box-sizing: border-box;
        }
        .card-main {
          padding: 32px;
        }
        .card-side {
          padding: 24px;
        }
        .side-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 800;
          color: ${tokens.textPrimary || '#0F172A'};
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
        }
        .badge-pending { background: #FEF3C7; color: #D97706; }
        .badge-approved { background: #DCFCE7; color: #16A34A; }
        .badge-rejected { background: #FEF2F2; color: #EF4444; }


        .menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }
        .menu-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: #F8FAFC;
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          border-radius: 14px;
          text-decoration: none;
          color: ${tokens.textPrimary || '#0F172A'};
          transition: all 0.2s ease;
          text-align: left;
        }
        .menu-card:hover {
          border-color: ${tokens.brandPrimary || '#EA580C'};
          background: #FFF8F5;
          transform: translateY(-2px);
        }
        .menu-card-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .menu-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #FFF;
          border-radius: 10px;
          color: ${tokens.brandPrimary || '#EA580C'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .menu-card-title {
          display: block;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 2px;
        }
        .menu-card-desc {
          display: block;
          font-size: 12px;
          color: ${tokens.textSecondary || '#64748B'};
        }


        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .card-side {
            order: -1;
          }
        }

        @media (max-width: 576px) {
          .dashboard-wrapper { padding: 20px 14px; }
          .dashboard-title { font-size: 24px; }
          .card-main { padding: 20px 16px; }
          .menu-grid { grid-template-columns: 1fr; gap: 12px; }
          .menu-card { padding: 16px; }
        }

        @media (max-width: 360px) {
          .dashboard-title { font-size: 20px; }
          .menu-card-title { font-size: 14px; }
        }
      `}</style>

      <div className="dashboard-header">
        <h1 className="dashboard-title">Панель волонтера Adoptify</h1>
        <p className="dashboard-subtitle">
          Моніторинг вашого статусу, перегляд анкет користувачів та обробка заявок на прилаштування
          тварин
        </p>
      </div>

      {loading ? (
        <p
          style={{
            color: tokens.textSecondary || '#64748B',
          }}
        >
          Завантаження даних панелі...
        </p>
      ) : (
        <div className="dashboard-grid">
          <div className="card-main">
            {myRequest?.status?.toUpperCase() === 'APPROVED' ? (
              <div
                style={{
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#10B981',
                    marginBottom: '16px',
                  }}
                >
                  <ShieldCheck size={52} weight="duotone" />
                </div>
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '22px',
                    fontWeight: '800',
                  }}
                >
                  Доступ активовано
                </h3>
                <p
                  style={{
                    color: tokens.textSecondary || '#64748B',
                    fontSize: '14px',
                    maxWidth: '520px',
                    margin: '0 auto 24px auto',
                    lineHeight: '1.5',
                  }}
                >
                  Ви є офіційним волонтером притулку! Скористайтеся швидким меню нижче або верхньою
                  панеллю навігації для керування процесами адопції.
                </p>

                <div className="menu-grid">
                  <Link to="/volunteer/pets" className="menu-card">
                    <div className="menu-card-left">
                      <div className="menu-icon-box">
                        <PawPrint size={22} weight="bold" />
                      </div>
                      <div>
                        <span className="menu-card-title">Мої підопічні</span>
                        <span className="menu-card-desc">Список тварин під вашою опікою</span>
                      </div>
                    </div>
                    <CaretRight
                      size={16}
                      weight="bold"
                      style={{
                        color: '#94A3B8',
                      }}
                    />
                  </Link>

                  <Link to="/volunteer/adoptions" className="menu-card">
                    <div className="menu-card-left">
                      <div className="menu-icon-box">
                        <UsersThree size={22} weight="bold" />
                      </div>
                      <div>
                        <span className="menu-card-title">Заявки на адопцію</span>
                        <span className="menu-card-desc">Обробка анкет від кандидатів</span>
                      </div>
                    </div>
                    <CaretRight
                      size={16}
                      weight="bold"
                      style={{
                        color: '#94A3B8',
                      }}
                    />
                  </Link>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '20px 0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: tokens.textDisabled || '#94A3B8',
                    marginBottom: '16px',
                  }}
                >
                  <Info size={44} weight="light" />
                </div>
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: tokens.textPrimary || '#0F172A',
                  }}
                >
                  Функціонал обмежено
                </h3>
                <p
                  style={{
                    color: tokens.textSecondary || '#64748B',
                    fontSize: '14px',
                    maxWidth: '460px',
                    margin: '0 auto',
                    lineHeight: '1.5',
                  }}
                >
                  Робота з анкетами адопції тварин та перегляд списку підопічних стане доступною
                  одразу після того, як керівник обраного притулку перевірить та затвердить вашу
                  кандидатуру.
                </p>
              </div>
            )}
          </div>

          <div className="card-side">
            <h3 className="side-title">Статус вашої заявки</h3>
            {myRequest ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div>{getStatusBadge(myRequest.status)}</div>
                <div
                  style={{
                    fontSize: '13px',
                    color: tokens.textSecondary || '#64748B',
                    lineHeight: '1.4',
                  }}
                >
                  <strong>Притулок:</strong> {myRequest.shelter_name || 'Обрана організація'}
                  <br />
                  <span
                    style={{
                      fontSize: '11px',
                      color: tokens.textDisabled || '#94A3B8',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    Подано:{' '}
                    {new Date(myRequest.created_at || Date.now()).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: '13px',
                    color: tokens.textSecondary || '#64748B',
                    margin: '0 0 16px 0',
                    lineHeight: '1.4',
                  }}
                >
                  Ви ще не надсилали анкету волонтера до жодного притулку нашої платформи.
                </p>
                <Link
                  to="/become-volunteer"
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                    padding: '10px',
                    background: '#F1F5F9',
                    color: tokens.textPrimary || '#0F172A',
                    borderHard: 'none',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '13px',
                  }}
                >
                  Заповнити анкету волонтера
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
