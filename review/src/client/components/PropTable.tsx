import React from 'react';

// A "dumb" component that renders inputs based on type
export function PropTable({ meta, values, onChange }: any) {
  if (!meta || !meta.props) return <div style={{padding: 20}}>No props detected</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#71717a', marginBottom: '15px', fontWeight: 'bold' }}>Controls</h3>
      
      {Object.entries(meta.props).map(([name, detail]: [string, any]) => {
        const val = values[name];
        const type = detail.type.name;
        
        return (
            <div key={name} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: '#27272a' }}>{name}</label>
                    {detail.required && <span style={{ fontSize: '10px', color: '#ef4444' }}>req</span>}
                </div>
                
                {/* Input Switcher */}
                {type === 'boolean' ? (
                    <input 
                        type="checkbox" 
                        checked={!!val} 
                        onChange={(e) => onChange(name, e.target.checked)} 
                    />
                ) : type === 'number' ? (
                    <input 
                        type="number"
                        value={val || ''}
                        onChange={(e) => onChange(name, parseFloat(e.target.value))}
                        style={inputStyle}
                    />
                ) : (type === 'string' && (type.includes('"') || type.includes("'"))) ? (
                     // Detected Enum (rough check)
                     <select style={inputStyle} value={val} onChange={(e) => onChange(name, e.target.value)}>
                        <option value="">-</option>
                        {type.split('|').map((opt: string) => {
                            const clean = opt.trim().replace(/['"]/g, '');
                            return <option key={clean} value={clean}>{clean}</option>
                        })}
                     </select>
                ) : (
                    <input 
                        type="text" 
                        value={typeof val === 'object' ? JSON.stringify(val) : (val || '')} 
                        onChange={(e) => onChange(name, e.target.value)} 
                        placeholder={type}
                        style={inputStyle}
                    />
                )}
                
                <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>{detail.description}</div>
            </div>
        )
      })}
    </div>
  );
}

const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #e4e4e7',
    fontSize: '13px',
    outline: 'none'
};
