import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { tokens as globalTokens } from '../styles/tokens';
import {
  TerminalWindow,
  Warning,
  XCircle,
  Info,
  DownloadSimple,
  Trash,
  ArrowsCounterClockwise,
  MagnifyingGlass,
  CaretDown,
  X,
} from '@phosphor-icons/react';
const tokens = {
  ...globalTokens,
  brandPrimaryLight: '#FFF7ED',
  brandPrimaryBorder: '#FFEDD5',
  radiusSm: '10px',
  radiusMd: '14px',
  radiusLg: '20px',
  radiusXl: '24px',
};
export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const filterLabels = {
    ALL: 'Всі записи',
    ERROR: 'Помилки (ERROR)',
    WARNING: 'Попередження (WARN)',
    AUDIT: 'Аудит дій (AUDIT)',
    INFO: 'Інформаційні (INFO)',
  };
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/logs/');
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Помилка завантаження логів:', err);
      setError(
        'Не вдалося завантажити системні логи з сервера. Перевірте підключення або права доступу.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLogs();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleClearLogs = async () => {
    if (
      !window.confirm(
        'Ви впевнені, що хочете безповоротно очистити журнал системних логів у файлі app.log?'
      )
    )
      return;
    setError(null);
    try {
      await api.delete('/admin/logs/clear/');
      setLogs([]);
    } catch (err) {
      console.error('Помилка очищення логів:', err);
      setError(
        'Не вдалося очистити логи на сервері. Можливо, недостатньо прав або файл заблоковано системою.'
      );
    }
  };
  const downloadLogFile = () => {
    const logText =
      logs.length > 0
        ? logs.map((l) => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.message}`).join('\n')
        : 'Журнал логів порожній. Критичних подій або помилок на сервері не зафіксовано.';
    const blob = new Blob([logText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adoptify_system_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };
  const filteredLogs = logs.filter((l) => {
    const matchLevel = filterLevel === 'ALL' || l.level === filterLevel;
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return matchLevel;
    const matchSearch =
      (l.message || '').toLowerCase().includes(cleanSearch) ||
      (l.source || '').toLowerCase().includes(cleanSearch);
    return matchLevel && matchSearch;
  });
  const getLevelBadgeStyle = (level) => {
    switch (level) {
      case 'ERROR':
        return {
          bg: '#FEF2F2',
          color: '#EF4444',
          icon: <XCircle weight="fill" size={14} />,
        };
      case 'WARNING':
        return {
          bg: '#FFF7ED',
          color: tokens.brandPrimary || '#EA580C',
          icon: <Warning weight="fill" size={14} />,
        };
      case 'AUDIT':
        return {
          bg: '#EFF6FF',
          color: '#3B82F6',
          icon: <TerminalWindow weight="fill" size={14} />,
        };
      default:
        return {
          bg: '#F8FAFC',
          color: '#64748B',
          icon: <Info weight="fill" size={14} />,
        };
    }
  };
  return (
    <div
      style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'Inter, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <style>{`

        .log-row, .log-th-header {
          display: grid;
          grid-template-columns: 160px 120px 160px 1fr;
          gap: 20px;
          padding: 14px 16px;
          align-items: center;
          font-size: 13.5px;
        }
        .log-row { border-bottom: 1px solid ${tokens.borderDefault || '#E2E8F0'}; }
        .log-row:hover { background: #F8FAFC; }
        .log-th-header {
          background: #F8FAFC;
          font-weight: 700;
          font-size: 12px;
          color: #64748B;
          border-bottom: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .log-container { background: #FFF; border: 1px solid ${tokens.borderDefault || '#E2E8F0'}; border-radius: ${tokens.radiusLg}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .log-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }


        .action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border-radius: ${tokens.radiusSm}; border: 1px solid ${tokens.borderDefault || '#E2E8F0'}; background: #FFF; font-size: 14px; font-weight: 600; color: ${tokens.textPrimary || '#1E293B'}; cursor: pointer; transition: all 0.2s ease; }
        .action-btn:hover { background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-1px); }
        .action-btn:active { transform: translateY(0); }


        .filter-section { display: flex; gap: 16px; margin-bottom: 24px; align-items: center; justify-content: space-between; }
        .search-wrapper { position: relative; flex: 1; }

        .search-input { width: 100%; padding: 12px 16px 12px 44px; border-radius: ${tokens.radiusSm}; border: 1px solid ${tokens.borderDefault || '#E2E8F0'}; font-size: 14px; outline: none; box-sizing: border-box; transition: all 0.2s ease; font-weight: 500; color: ${tokens.textPrimary || '#1E293B'} !important; }
        .search-input:focus { border-color: ${tokens.brandPrimary || '#EA580C'}; box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1); }


        @media(max-width: 768px) {
          .search-input::placeholder { color: transparent !important; }
          .search-input::-webkit-input-placeholder { color: transparent !important; }
          .search-input::-moz-placeholder { color: transparent !important; }

          .search-wrapper::after {
            content: "Пошук логів...";
            position: absolute;
            left: 44px;
            top: 50%;
            transform: translateY(-50%);
            color: #94A3B8;
            font-size: 14px;
            pointer-events: none;
            font-weight: 500;
          }

          .search-wrapper:focus-within::after,
          .search-input:not(:placeholder-shown) + button + ::after,
          .search-input:not(:placeholder-shown) ~ ::after {
            display: none !important;
            content: "" !important;
            opacity: 0 !important;
          }
        }


        .custom-select-container { position: relative; display: inline-block; width: 230px; }
        .custom-select-trigger {
          width: 100%;
          padding: 12px 16px;
          border-radius: ${tokens.radiusSm};
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          font-size: 14px;
          background: #FFF;
          font-weight: 600;
          color: ${tokens.textPrimary || '#1E293B'};
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(15,23,42,0.02);
        }
        .custom-select-trigger:hover { border-color: #CBD5E1; }
        .custom-select-trigger.open {
          border-color: ${tokens.brandPrimary || '#EA580C'};
          box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.1);
        }
        .caret-icon { transition: transform 0.2s ease; color: ${tokens.textSecondary || '#64748B'}; }
        .custom-select-trigger.open .caret-icon { transform: rotate(180deg); }

        .custom-options-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: #FFF;
          border: 1px solid ${tokens.borderDefault || '#E2E8F0'};
          border-radius: ${tokens.radiusMd};
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05);
          z-index: 100;
          overflow: hidden;
          padding: 6px;
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-sizing: border-box;
          animation: slideDown 0.15s ease-out;
        }

        .custom-option {
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          color: ${tokens.textPrimary || '#1E293B'};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          line-height: 1.4;
          box-sizing: border-box;
        }
        .custom-option:hover { background-color: ${tokens.bgSurface || '#F1F5F9'}; }
        .custom-option.selected {
          background-color: ${tokens.brandPrimaryLight || '#FFF7ED'} !important;
          color: ${tokens.brandPrimary || '#EA580C'} !important;
          font-weight: 700;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }


        @media(max-width: 992px) {
          .log-header-block { flex-direction: column; align-items: stretch !important; gap: 16px; text-align: center; }
          .buttons-group { justify-content: center; width: 100%; }
          .buttons-group .action-btn { flex: 1; min-width: auto; padding: 10px 8px; font-size: 13px; }

          .filter-section { flex-direction: column; align-items: stretch; gap: 12px; }
          .custom-select-container { width: 100%; }

          .log-th-header { display: none; }
          .log-row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 16px;
          }
          .log-time { font-weight: 700; color: #94A3B8; font-size: 12px; }
          .log-message-text { word-break: break-all; width: 100%; white-space: pre-wrap; }
        }

        @media(max-width: 480px) {
          .buttons-group { flex-direction: column; gap: 8px; }
          h1 { font-size: 24px !important; }
        }
      `}</style>

      <div
        className="log-header-block"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          borderBottom: `1px solid ${tokens.borderDefault || '#E2E8F0'}`,
          paddingBottom: '20px',
          gap: '20px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '36px',
              color: tokens.textPrimary || '#1E293B',
              margin: '0 0 10px 0',
              fontWeight: '800',
              letterSpacing: '-0.02em',
            }}
          >
            Системні логи
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: tokens.textSecondary || '#64748B',
              lineHeight: '1.6',
            }}
          >
            Журнал помилок бекенду, моніторинг критичних подій та аудит безпеки (app.log).
          </p>
        </div>

        <div
          className="buttons-group"
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button className="action-btn" onClick={fetchLogs} disabled={loading}>
            <ArrowsCounterClockwise size={18} /> Оновити
          </button>
          <button className="action-btn" onClick={downloadLogFile}>
            <DownloadSimple size={18} /> Скачати
          </button>
          <button
            className="action-btn"
            onClick={handleClearLogs}
            style={{
              color: '#EF4444',
              borderColor: '#FEE2E2',
            }}
          >
            <Trash size={18} /> Очистити
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#991B1B',
            padding: '14px',
            borderRadius: tokens.radiusSm,
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {error}
        </div>
      )}

      <div className="filter-section">
        <div className="search-wrapper">
          <MagnifyingGlass
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: tokens.textDisabled || '#94A3B8',
              pointerEvents: 'none',
              zIndex: 3,
            }}
            size={20}
          />
          <input
            type="text"
            className="search-input"
            placeholder="Фільтрувати за текстом помилки чи модулем..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: tokens.bgSurface || '#F1F5F9',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.textSecondary,
                zIndex: 4,
              }}
            >
              <X size={12} weight="bold" />
            </button>
          )}
        </div>

        <div className="custom-select-container" ref={dropdownRef}>
          <div
            className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{filterLabels[filterLevel]}</span>
            <CaretDown size={16} className="caret-icon" />
          </div>

          {isDropdownOpen && (
            <div className="custom-options-menu">
              {Object.keys(filterLabels).map((key) => (
                <div
                  key={key}
                  className={`custom-option ${filterLevel === key ? 'selected' : ''}`}
                  onClick={() => {
                    setFilterLevel(key);
                    setIsDropdownOpen(false);
                  }}
                >
                  {filterLabels[key]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="log-container">
        <div className="log-th-header">
          <div>Дата та час</div>
          <div>Рівень</div>
          <div>Джерело</div>
          <div>Повідомлення системи</div>
        </div>

        {loading ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: tokens.textSecondary || '#64748B',
              fontWeight: '500',
            }}
          >
            Завантаження свіжого журналу подій...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: tokens.textSecondary || '#64748B',
              fontWeight: '500',
            }}
          >
            Журнал логів порожній або записів не знайдено.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const styleMeta = getLevelBadgeStyle(log.level);
            return (
              <div key={log.id} className="log-row">
                <div
                  className="log-time"
                  style={{
                    color: '#64748B',
                    fontFamily: 'monospace',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {log.timestamp}
                </div>
                <div>
                  <span
                    className="log-badge"
                    style={{
                      backgroundColor: styleMeta.bg,
                      color: styleMeta.color,
                    }}
                  >
                    {styleMeta.icon} {log.level}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: '600',
                    color: '#334155',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {log.source}
                </div>
                <div
                  className="log-message-text"
                  style={{
                    fontFamily: 'monospace',
                    color: log.level === 'ERROR' ? '#DC2626' : '#1E293B',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    lineHeight: '1.5',
                  }}
                >
                  {log.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
