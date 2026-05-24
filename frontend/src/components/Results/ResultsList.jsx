import React from 'react';
import PetCard from '../UI/PetCard';
import ExplainabilityCard from './ExplainabilityCard';
import { Info } from '@phosphor-icons/react';
const ResultsList = ({ results, onRequestClick, startRank = 1 }) => (
  <div
    className="results-container"
    style={{
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    <style>{`
      .results-grid-wrapper {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 24px;
        box-sizing: border-box;
      }


      @media (max-width: 768px) {
        .results-card-item {
          padding: 16px !important;
          border-radius: 16px !important;
        }
        .results-grid-wrapper {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .results-match-title {
          font-size: 22px !important;
        }
      }


      @media (max-width: 400px) {
        .results-card-item {
          padding: 12px !important;
        }
        .results-match-title {
          font-size: 18px !important;
        }
      }
    `}</style>

    <h3
      style={{
        color: '#0F172A',
        fontSize: '20px',
        fontWeight: '900',
        marginBottom: '16px',
        borderLeft: '4px solid #EA580C',
        paddingLeft: '12px',
        fontFamily: 'inherit',
      }}
    >
      Рекомендації СППР для адаптації:
    </h3>

    {results.map((res, index) => {
      const petData = res.pet || res;
      const rawPercent =
        res.match_percent !== undefined && res.match_percent !== null
          ? res.match_percent
          : petData.match_percent || 0;
      const displayPercent = Math.round(parseFloat(rawPercent));
      const fullPetPayload = {
        ...petData,
        compatibility_score:
          res.compatibility_score || petData.compatibility_score || displayPercent,
        weight:
          petData.weight !== undefined && petData.weight !== null ? petData.weight : res.weight,
      };
      return (
        <div
          key={res.id || petData.id || Math.random()}
          className="results-card-item"
          style={{
            marginBottom: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            background: '#FFFFFF',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)',
            boxSizing: 'border-box',
          }}
        >
          <div className="results-grid-wrapper">
            <div
              style={{
                width: '100%',
                minWidth: '0',
              }}
            >
              <PetCard
                pet={fullPetPayload}
                context="matching"
                onRequestClick={() => onRequestClick(fullPetPayload)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minWidth: '0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                <div
                  className="results-match-title"
                  style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: displayPercent >= 80 ? '#16A34A' : '#EA580C',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{startRank + index} · Сумісність: {displayPercent}%
                </div>
                <div
                  style={{
                    height: '8px',
                    flex: 1,
                    background: '#F1F5F9',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${displayPercent}%`,
                      height: '100%',
                      background: displayPercent >= 80 ? '#16A34A' : '#EA580C',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  marginBottom: '16px',
                }}
              >
                <ExplainabilityCard
                  pros={res.positives || petData.positives || []}
                  cons={res.risks || petData.risks || []}
                />
              </div>

              {(res.recommendation || petData.recommendation) && (
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '16px',
                    background: '#FFF7ED',
                    borderRadius: '16px',
                    color: '#0F172A',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    border: '1px solid #FFEDD5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Info
                    size={24}
                    weight="fill"
                    color="#EA580C"
                    style={{
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: '500',
                    }}
                  >
                    <strong
                      style={{
                        fontWeight: '800',
                        color: '#EA580C',
                      }}
                    >
                      Висновок системи:{' '}
                    </strong>
                    {res.recommendation || petData.recommendation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
export default ResultsList;
