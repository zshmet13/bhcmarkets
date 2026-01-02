import React from 'react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("X-Ray Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '8px', color: '#991b1b', maxWidth: '400px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>💥 Component Crashed</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>The component failed to render. This usually happens when mandatory props are missing.</p>
          <pre style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.5)', overflow: 'auto', fontSize: '11px' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ marginTop: '10px', padding: '5px 10px', border: '1px solid #991b1b', background: 'transparent', color: '#991b1b', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
