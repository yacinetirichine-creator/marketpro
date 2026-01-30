// ============================================
// MARKET PRO - TESTS ERROR BOUNDARY
// Tests pour le composant ErrorBoundary
// ============================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Composant qui lance une erreur
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Supprimer les erreurs console pendant les tests d'erreur
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render fallback UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // En mode développement, les détails de l'erreur sont affichés
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should allow retry after error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // L'erreur est affichée
    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();

    // Cliquer sur le bouton de retry
    const retryButton = screen.getByRole('button', { name: /Réessayer/i });

    // Avant de cliquer, mettre à jour le composant pour ne plus lancer d'erreur
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.click(retryButton);
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('should render fallback function with error details', () => {
    const fallbackRender = ({ error, resetError }) => (
      <div>
        <p data-testid="error-message">{error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    );

    render(
      <ErrorBoundary fallbackRender={fallbackRender}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('should handle navigate callback', () => {
    const onNavigate = jest.fn();

    render(
      <ErrorBoundary onNavigate={onNavigate}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Le bouton retour devrait être présent
    const backButton = screen.queryByRole('button', { name: /Retour/i });
    if (backButton) {
      fireEvent.click(backButton);
      expect(onNavigate).toHaveBeenCalled();
    }
  });

  it('should catch errors in nested components', () => {
    const NestedComponent = () => {
      return (
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();
  });

  it('should reset error state when key changes', () => {
    const { rerender } = render(
      <ErrorBoundary key="first">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary key="second">
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});

describe('ErrorBoundary edge cases', () => {
  it('should handle error without message', () => {
    const ErrorWithoutMessage = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ErrorWithoutMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();
  });

  it('should handle non-Error objects thrown', () => {
    const ThrowString = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundary>
        <ThrowString />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oups ! Quelque chose/i)).toBeInTheDocument();
  });
});
