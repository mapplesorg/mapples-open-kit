import { Component, ErrorInfo, PropsWithChildren } from 'react';

interface ElementErrorBoundaryProps {
  /** How the element is reported: its component and `$sid`. */
  label: string;
}

interface ElementErrorBoundaryState {
  failed: boolean;
}

/**
 * Keeps one element's render error to that element. A component that
 * refuses its props — a chart handed `null` by a backend, a bound value
 * that has not arrived in the shape it expects — is reported through
 * `console.error` (the dev overlay shows it) and leaves a gap where it
 * stood, instead of taking the whole app down with it.
 */
class ElementErrorBoundary extends Component<
  PropsWithChildren<ElementErrorBoundaryProps>,
  ElementErrorBoundaryState
> {
  state: ElementErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ElementErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[mapples] ${this.props.label} failed to render and is left out: ${error.message}`,
      info.componentStack,
    );
  }

  componentDidUpdate(previous: PropsWithChildren<ElementErrorBoundaryProps>) {
    // New props are a new attempt: the value that broke it may have arrived
    // in shape since (a request that has now answered).
    if (this.state.failed && previous.children !== this.props.children) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default ElementErrorBoundary;
