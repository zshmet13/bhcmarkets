import React, { useState } from 'react';

export function Sidebar({ files, selected, onSelect }: any) {
  const [filter, setFilter] = useState('');

  const filtered = files.filter((f: string) => f.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ width: '260px', background: '#18181b', color: '#d4d4d8', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #27272a' }}>
        <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>⚛️ X-Ray</h1>
        <div style={{ marginTop: '10px' }}>
          <input 
            placeholder="Filter components..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ 
              width: '100%', background: '#27272a', border: 'none', 
              color: 'white', padding: '8px', borderRadius: '4px', fontSize: '13px'
            }}
          />
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {filtered.map((file: string) => {
            const name = file.split('/').pop()?.replace(/\.(tsx|jsx)/, '');
            const isActive = selected === file;
            
            return (
                <div 
                    key={file}
                    onClick={() => onSelect(file)}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '2px',
                        background: isActive ? '#3f3f46' : 'transparent',
                        color: isActive ? 'white' : '#a1a1aa',
                        transition: 'all 0.2s'
                    }}
                >
                    {name}
                    <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>{file}</div>
                </div>
            )
        })}
      </div>
    </div>
  )
}
