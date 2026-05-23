import React from 'react';
const PetCardSkeleton = () => {
  const pulseAnimation = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <style>{pulseAnimation}</style>

      <div
        style={{
          width: '100%',
          height: '220px',
          backgroundColor: '#E2E8F0',
        }}
      />

      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              height: '28px',
              width: '50%',
              backgroundColor: '#E2E8F0',
              borderRadius: '6px',
            }}
          />
          <div
            style={{
              height: '28px',
              width: '25%',
              backgroundColor: '#E2E8F0',
              borderRadius: '6px',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              height: '24px',
              width: '35%',
              backgroundColor: '#EDF2F7',
              borderRadius: '6px',
            }}
          />
          <div
            style={{
              height: '24px',
              width: '35%',
              backgroundColor: '#EDF2F7',
              borderRadius: '6px',
            }}
          />
        </div>

        <div
          style={{
            height: '16px',
            width: '100%',
            backgroundColor: '#EDF2F7',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '80%',
            backgroundColor: '#EDF2F7',
            borderRadius: '4px',
            marginBottom: '24px',
          }}
        />

        <div
          style={{
            marginTop: 'auto',
            height: '44px',
            width: '100%',
            backgroundColor: '#E2E8F0',
            borderRadius: '12px',
          }}
        />
      </div>
    </div>
  );
};
export default PetCardSkeleton;
