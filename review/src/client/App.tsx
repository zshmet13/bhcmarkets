import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { PropTable } from './components/PropTable';
import { ErrorBoundary } from './components/ErrorBoundary';

// Types
interface ComponentDoc {
  displayName: string;
  props: Record<string, {
    type: { name: string };
    defaultValue?: { value: string };
    description: string;
    required: boolean;
  }>;
}

export default function App() {
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [componentMeta, setComponentMeta] = useState<ComponentDoc | null>(null);
  const [SelectedComponent, setSelectedComponent] = useState<any>(null);
  const [propValues, setPropValues] = useState<Record<string, any>>({});

  // 1. Initial Scan
  useEffect(() => {
    fetch('/__xray/api/scan')
      .then(res => res.json())
      .then(setFileList)
      .catch(console.error);
  }, []);

  // 2. Load Component & Metadata when selection changes
  useEffect(() => {
    if (!selectedFile) return;

    // Reset
    setComponentMeta(null);
    setSelectedComponent(null);
    setPropValues({});

    const load = async () => {
      // A. Fetch Metadata (AST)
      try {
        const metaRes = await fetch(`/__xray/api/props?file=${selectedFile}`);
        const metaJson = await metaRes.json();
        // docgen returns an array (for multiple exports), we take the first/default
        if (metaJson && metaJson.length > 0) {
          const doc = metaJson[0];
          setComponentMeta(doc);
          
          // Hydrate default props
          const defaults: Record<string, any> = {};
          Object.entries(doc.props || {}).forEach(([key, val]: [string, any]) => {
            if (val.defaultValue) {
              // Try to parse basic defaults, otherwise ignore
              try { defaults[key] = JSON.parse(val.defaultValue.value); } catch(e) {}
            } else if (val.type.name === 'boolean') {
                defaults[key] = false;
            } else if (val.type.name === 'string') {
                defaults[key] = '';
            }
          });
          setPropValues(defaults);
        }
      } catch (e) {
        console.error("Failed to load meta", e);
      }

      // B. Dynamic Import the User's Component
      // We use Vite's native dynamic import capabilities here. 
      // Since we are running in the same Vite instance as the user code, this works!
      try {
        const mod = await import(/* @vite-ignore */ selectedFile);
        const Comp = mod.default || Object.values(mod)[0];
        setSelectedComponent(() => Comp);
      } catch (e) {
        console.error("Failed to load component module", e);
      }
    };

    load();
  }, [selectedFile]);

  return (
    <div className="xray-layout" style={{ display: 'flex', height: '100vh', width: '100vw', background: '#f4f4f5' }}>
      
      {/* Sidebar */}
      <Sidebar 
        files={fileList} 
        selected={selectedFile} 
        onSelect={setSelectedFile} 
      />

      {/* Main Stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Toolbar / Header */}
        <div style={{ height: '50px', borderBottom: '1px solid #e4e4e7', background: 'white', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>
                {componentMeta?.displayName || selectedFile || 'Select a component'}
            </h2>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
            
            {/* Component Render Area (Centered) */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                {selectedFile ? (
                    <div style={{ background: 'white', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderRadius: '8px', minWidth: '100px', minHeight: '50px' }}>
                       <ErrorBoundary>
                         <Suspense fallback={<div>Loading...</div>}>
                            {SelectedComponent ? (
                                <SelectedComponent {...propValues} />
                            ) : (
                                <div style={{color: '#999'}}>Loading Component Source...</div>
                            )}
                         </Suspense>
                       </ErrorBoundary>
                    </div>
                ) : (
                    <div style={{ color: '#a1a1aa' }}>Select a component to X-Ray</div>
                )}
            </div>

            {/* Right Panel: Prop Editor */}
            {componentMeta && (
                <div style={{ width: '300px', background: 'white', borderLeft: '1px solid #e4e4e7', overflowY: 'auto' }}>
                    <PropTable 
                        meta={componentMeta} 
                        values={propValues} 
                        onChange={(key, val) => setPropValues(prev => ({...prev, [key]: val}))} 
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
