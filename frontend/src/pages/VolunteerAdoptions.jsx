import React, { useState, useEffect } from 'react';
import { volunteerAdoptionApi, tokens } from '../services/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  ClipboardText,
  Info,
  User,
  Phone,
  Envelope,
  Sparkle,
  ShieldWarning,
  CheckSquare,
  Eye,
} from '@phosphor-icons/react';
const bgMain = tokens.bgSurface || '#F8FAFC';
const bgCard = tokens.bgWhite || '#FFFFFF';
const textMain = tokens.textPrimary || '#0F172A';
const textMuted = tokens.textSecondary || '#64748B';
const borderColor = tokens.borderDefault || '#E2E8F0';
const brandPrimary = tokens.brandPrimary || '#EA580C';
export default function VolunteerAdoptions() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const fetchAdoptionRequests = () => {
    setIsLoading(true);
    volunteerAdoptionApi
      .getAdoptionRequests()
      .then((res) => {
        const data = res.data.results ? res.data.results : res.data;
        setRequests(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Помилка завантаження заявок на адаптацію:', err);
        setRequests([]);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchAdoptionRequests();
  }, []);
  const handleUpdateStatus = (id, action) => {
    if (isSaving !== null) return;
    const confirmMessage = {
      REVIEW: 'Позначити заявку як переглянуту і залишити її в роботі?',
      APPROVE:
        'Ви впевнені, що хочете СХВАЛИТИ цю заявку на адаптацію? Тварину буде автоматично знято з публікації.',
      REJECT: 'Ви впевнені, що хочете ВІДХИЛИТИ цю заявку на адаптацію?',
    }[action];
    if (!window.confirm(confirmMessage)) return;
    setIsSaving(id);
    const apiCall =
      action === 'REVIEW'
        ? volunteerAdoptionApi.reviewRequest(id)
        : action === 'APPROVE'
          ? volunteerAdoptionApi.approveRequest(id)
          : volunteerAdoptionApi.rejectRequest(id);
    apiCall
      .then(() => {
        const updatedStatus =
          action === 'REVIEW' ? 'REVIEWED' : action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id
              ? {
                  ...req,
                  status: updatedStatus,
                }
              : req
          )
        );
        setIsSaving(null);
      })
      .catch((err) => {
        console.error('Помилка зміни статусу адаптації:', err);
        alert(err.response?.data?.detail || 'Не вдалося оновити статус заявки.');
        setIsSaving(null);
      });
  };
  const renderStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="status-badge badge-orange">
            <Clock size={16} weight="fill" /> Очікує розгляду
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="status-badge badge-blue">
            <Eye size={16} weight="fill" /> Переглянуто
          </span>
        );
      case 'APPROVED':
        return (
          <span className="status-badge badge-green">
            <CheckCircle size={16} weight="fill" /> Схвалено
          </span>
        );
      case 'REJECTED':
        return (
          <span className="status-badge badge-red">
            <XCircle size={16} weight="fill" /> Відхилено
          </span>
        );
      default:
        return <span className="status-badge badge-gray">{status}</span>;
    }
  };
  const filteredRequests = requests.filter((req) => {
    if (activeFilter === 'ALL') return true;
    return req.status?.toUpperCase() === activeFilter;
  });
  return (
    <div className="adoptions-page-container">
      <style>{pageStyles}</style>

      <div className="header-section">
        <h1 className="main-title">
          <ClipboardText
            size={40}
            weight="duotone"
            style={{
              color: brandPrimary,
            }}
          />
          Заявки на адаптацію
        </h1>

        <div className="filter-tabs">
          <button
            className={`tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            Усі ({requests.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PENDING')}
          >
            Очікують ({requests.filter((r) => r.status?.toUpperCase() === 'PENDING').length})
          </button>
          <button
            className={`tab-btn ${activeFilter === 'REVIEWED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('REVIEWED')}
          >
            Переглянуті
          </button>
          <button
            className={`tab-btn ${activeFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('APPROVED')}
          >
            Схвалені
          </button>
          <button
            className={`tab-btn ${activeFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('REJECTED')}
          >
            Відхилені
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Синхронізація із базою даних адаптації...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state-box">
          <Info size={48} className="empty-icon" />
          <p>Наразі немає активних заявок у цій вкладці.</p>
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((req) => {
            const userObj = req.user_details || req.user || {};
            const profileObj = userObj.profile || {};
            const petObj = req.pet_details || {};
            const analytics = req.ai_analysis || {};
            let applicantName = '';
            if (profileObj.first_name || userObj.first_name) {
              applicantName =
                `${profileObj.first_name || userObj.first_name || ''} ${profileObj.last_name || userObj.last_name || ''}`.trim();
            }
            if (!applicantName) {
              applicantName =
                userObj.name || req.applicant_name || userObj.username || 'Користувач';
            }
            const applicantPhone =
              profileObj.phone_number || userObj.phone || req.applicant_phone || 'Не вказано';
            const applicantEmail = userObj.email || req.user_email || 'Не вказано';
            const petName = petObj.name || req.pet_name || `Тварина (ID: ${req.pet})`;
            let matchPercent = null;
            if (analytics.match_percent !== undefined && analytics.match_percent !== null) {
              matchPercent = analytics.match_percent;
            } else if (
              req.questionnaire_percentage !== undefined &&
              req.questionnaire_percentage !== null
            ) {
              matchPercent = req.questionnaire_percentage;
            } else if (
              petObj.compatibility_score !== undefined &&
              petObj.compatibility_score !== null
            ) {
              matchPercent = petObj.compatibility_score;
            }
            const hasAnalytics =
              !!analytics.match_percent ||
              !!analytics.top_priority ||
              Array.isArray(analytics.positives) ||
              Array.isArray(analytics.risks);
            const recommendationText = analytics.top_priority
              ? `Найважливіший критерій користувача: ${analytics.top_priority}`
              : req.compatibility_recommendation || 'Аналіз умов відсутній';
            const positivesList = Array.isArray(analytics.positives)
              ? analytics.positives
              : Array.isArray(req.compatibility_positives)
                ? req.compatibility_positives
                : [];
            const risksList = Array.isArray(analytics.risks)
              ? analytics.risks
              : Array.isArray(req.compatibility_risks)
                ? req.compatibility_risks
                : [];
            return (
              <div key={req.id} className="request-card">
                <div className="card-top">
                  <div className="applicant-info">
                    <span className="applicant-name">{applicantName}</span> зацікавився(-лась)
                    тваринкою{' '}
                    <span className="pet-highlight">
                      <Heart size={16} weight="fill" /> {petName}
                    </span>
                    {matchPercent !== null ? (
                      <span
                        className={`match-tag ${matchPercent >= 85 ? 'match-high' : matchPercent >= 65 ? 'match-medium' : 'match-low'}`}
                      >
                        {matchPercent}% сумісність
                      </span>
                    ) : (
                      <span className="match-tag match-none">Анкету не заповнено</span>
                    )}
                  </div>
                  {renderStatus(req.status)}
                </div>

                <div className="card-details-grid">
                  <div className="details-column">
                    <h4>
                      <User size={18} weight="bold" /> Контакти заявника
                    </h4>
                    <div className="contact-card-box">
                      <div className="contact-row">
                        <strong>Ім'я:</strong> {applicantName}
                      </div>
                      <div className="contact-row">
                        <Phone size={16} weight="fill" className="icon-muted" /> {applicantPhone}
                      </div>
                      <div className="contact-row">
                        <Envelope size={16} weight="fill" className="icon-muted" /> {applicantEmail}
                      </div>
                    </div>
                  </div>

                  <div className="details-column">
                    <h4>
                      <ClipboardText size={18} weight="bold" /> Мотиваційне повідомлення
                    </h4>
                    <p className="message-text">
                      {req.message || req.motivation_message
                        ? `"${req.message || req.motivation_message}"`
                        : 'Додаткових коментарів користувач не надав.'}
                    </p>
                  </div>
                </div>

                {hasAnalytics && (
                  <div className="ai-analytics-box">
                    <div className="ai-header">
                      <Sparkle size={18} weight="fill" className="ai-sparkle-icon" />
                      <h4>Аналітика відповідності умов</h4>
                    </div>

                    <div className="ai-recommendation-text">
                      <strong>Рекомендація системи:</strong> {recommendationText}
                    </div>

                    {(positivesList.length > 0 || risksList.length > 0) && (
                      <div className="ai-grid">
                        {positivesList.length > 0 && (
                          <div className="ai-column">
                            <span className="ai-sub-title title-positive">
                              <CheckSquare size={16} weight="bold" /> Переваги (Метч)
                            </span>
                            <ul className="ai-list positives">
                              {positivesList.map((pos, idx) => (
                                <li key={idx}>{pos}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {risksList.length > 0 && (
                          <div className="ai-column">
                            <span className="ai-sub-title title-risk">
                              <ShieldWarning size={16} weight="bold" /> Застереження та ризики
                            </span>
                            <ul className="ai-list risks">
                              {risksList.map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {['PENDING', 'REVIEWED'].includes(req.status?.toUpperCase()) && (
                  <div className="btn-group">
                    {req.status?.toUpperCase() === 'PENDING' && (
                      <button
                        className="btn-action btn-review"
                        disabled={isSaving !== null}
                        onClick={() => handleUpdateStatus(req.id, 'REVIEW')}
                      >
                        Позначити переглянутою
                      </button>
                    )}
                    <button
                      className="btn-action btn-reject"
                      disabled={isSaving !== null}
                      onClick={() => handleUpdateStatus(req.id, 'REJECT')}
                    >
                      Відхилити заявку
                    </button>
                    <button
                      className="btn-action btn-approve"
                      disabled={isSaving !== null}
                      onClick={() => handleUpdateStatus(req.id, 'APPROVE')}
                    >
                      {isSaving === req.id ? (
                        <span className="btn-loader-text">
                          <Clock size={16} className="animate-spin" /> Обробка...
                        </span>
                      ) : (
                        'Схвалити адаптацію'
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
const pageStyles = `
  .adoptions-page-container {
    max-width: 1200px;
    margin: 0 auto;
    color: ${textMain};
    padding: 40px 24px;
    background-color: ${bgMain};
    min-height: 100vh;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-sizing: border-box;
  }
  .header-section {
    margin-bottom: 36px;
    border-bottom: 1px solid ${borderColor};
    padding-bottom: 28px;
  }
  .main-title {
    font-size: 34px;
    font-weight: 800;
    margin: 0 0 20px 0;
    color: ${textMain};
    display: flex;
    align-items: center;
    gap: 14px;
    letter-spacing: -0.5px;
  }
  .filter-tabs {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 6px;
  }
  .filter-tabs::-webkit-scrollbar { height: 4px; }
  .filter-tabs::-webkit-scrollbar-thumb { background: ${borderColor}; border-radius: 4px; }
  .tab-btn {
    padding: 10px 22px;
    border: 1px solid ${borderColor};
    background: ${bgCard};
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: ${textMuted};
  }
  .tab-btn:hover {
    border-color: ${brandPrimary};
    color: ${brandPrimary};
    background: #FFF8F5;
  }
  .tab-btn.active {
    background: ${brandPrimary};
    border-color: ${brandPrimary};
    color: #FFF;
    box-shadow: 0 6px 16px rgba(234, 88, 12, 0.25);
  }
  .requests-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .request-card {
    border: 1px solid ${borderColor};
    padding: 32px;
    border-radius: 24px;
    background: ${bgCard};
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.03);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .request-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.07);
    transform: translateY(-3px);
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    border-bottom: 1px dashed ${borderColor};
    padding-bottom: 20px;
  }
  .applicant-info {
    font-size: 17px;
    font-weight: 400;
    color: ${textMain};
    line-height: 1.6;
  }
  .applicant-name { font-weight: 700; color: ${textMain}; }
  .pet-highlight {
    color: ${brandPrimary};
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #FFF3EB;
    padding: 4px 12px;
    border-radius: 10px;
  }
  .match-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 16px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 700;
    margin-left: 12px;
    white-space: nowrap;
  }
  .match-high {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .match-medium {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  }
  .match-low {
    background: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
  }
  .match-none {
    background: #F1F5F9;
    color: #64748B;
    border: 1px solid #E2E8F0;
  }
  .card-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
  .details-column h4 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${textMuted};
    margin: 0 0 14px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .contact-card-box {
    background: #F8FAFC;
    border: 1px solid ${borderColor};
    border-radius: 16px;
    padding: 16px 20px;
  }
  .contact-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    margin-bottom: 10px;
    color: ${textMain};
  }
  .contact-row:last-child { margin-bottom: 0; }
  .icon-muted { color: #94A3B8; }
  .message-text {
    margin: 0;
    font-size: 15px;
    color: ${textMain};
    line-height: 1.6;
    background: #FFFDFB;
    padding: 20px;
    border-radius: 16px;
    border-left: 4px solid ${brandPrimary};
    border-top: 1px solid #FEEDEB;
    border-right: 1px solid #FEEDEB;
    border-bottom: 1px solid #FEEDEB;
    font-style: italic;
  }
  .ai-analytics-box {
    background: linear-gradient(180deg, #FFFDFB 0%, #FFF8F5 100%);
    border: 1px solid #FEEDEB;
    border-radius: 20px;
    padding: 24px;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.8);
  }
  .ai-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .ai-header h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: ${brandPrimary};
  }
  .ai-sparkle-icon {
    color: ${brandPrimary};
  }
  .ai-recommendation-text {
    font-size: 15px;
    line-height: 1.5;
    color: ${textMain};
    background: #FFF;
    padding: 14px 18px;
    border-radius: 14px;
    border: 1px solid #FEEDEB;
  }
  .ai-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 18px;
  }
  .ai-sub-title {
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }
  .title-positive { color: #16A34A; }
  .title-risk { color: #DC2626; }
  .ai-list {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
    line-height: 1.55;
  }
  .ai-list li {
    margin-bottom: 8px;
    position: relative;
    padding-left: 14px;
  }
  .ai-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    font-weight: bold;
  }
  .ai-list.positives li { color: #15803D; }
  .ai-list.risks li { color: #B91C1C; }
  .ai-list li:last-child { margin-bottom: 0; }
  .status-badge {
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  .badge-green { background-color: #E6FDF0; color: #15803D; border: 1px solid #BBF7D0; }
  .badge-blue { background-color: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
  .badge-orange { background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
  .badge-red { background-color: #FEE2E2; color: #B91C1C; border: 1px solid #FCA5A5; }
  .badge-gray { background-color: #F1F5F9; color: ${textMuted}; border: 1px solid ${borderColor}; }
  .btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 14px;
    margin-top: 4px;
    border-top: 1px solid ${borderColor};
    padding-top: 20px;
  }
  .btn-action {
    padding: 12px 28px;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .btn-approve {
    background: #10B981;
    color: #FFF;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  }
  .btn-approve:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); }
  .btn-reject {
    background: #FFF;
    color: #64748B;
    border: 1px solid ${borderColor};
  }
  .btn-reject:hover { background: #F8FAFC; color: #0F172A; border-color: #94A3B8; }
  .btn-review {
    background: #EFF6FF;
    color: #2563EB;
    border: 1px solid #BFDBFE;
  }
  .btn-review:hover { background: #DBEAFE; transform: translateY(-1px); }
  .btn-action:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: ${textMuted};
    gap: 16px;
    font-weight: 500;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 3.5px solid ${borderColor};
    border-top-color: ${brandPrimary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-state-box {
    border: 2px dashed #CBD5E1;
    padding: 80px 24px;
    border-radius: 24px;
    text-align: center;
    color: ${textMuted};
    background: ${bgCard};
  }
  .empty-icon { margin-bottom: 16px; color: #94A3B8; }
  @media (max-width: 768px) {
    .adoptions-page-container { padding: 24px 16px; }
    .main-title { font-size: 28px; }
    .request-card { padding: 24px; gap: 24px; }
    .card-top { flex-direction: column; align-items: flex-start; gap: 14px; }
    .card-details-grid, .ai-grid { grid-template-columns: 1fr; gap: 24px; }
    .match-tag { margin-left: 0; margin-top: 8px; }
    .btn-group { flex-direction: column; width: 100%; gap: 12px; }
    .btn-action { width: 100%; padding: 14px; }
  }
`;
