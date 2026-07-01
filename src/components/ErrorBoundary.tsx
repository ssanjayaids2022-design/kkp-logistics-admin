import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

/**
 * Catches render-time crashes (e.g. a bad map, an undefined field) so one broken
 * screen shows a recoverable fallback instead of freezing the whole dashboard.
 * Addresses the "Loads page hangs / never recovers" finding (System Design §1.2).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="warning"
          title="This screen hit an error"
          subTitle={this.state.message || 'Something went wrong while rendering this page.'}
          extra={[
            <Button key="retry" type="primary" onClick={this.handleReset} style={{ background: '#0B4C8C' }}>
              Try again
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              Reload dashboard
            </Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}
