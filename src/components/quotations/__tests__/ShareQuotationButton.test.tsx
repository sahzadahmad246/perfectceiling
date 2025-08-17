// components/quotations/__tests__/ShareQuotationButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareQuotationButton } from '../ShareQuotationButton';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ShareQuotationButton', () => {
  let queryClient: QueryClient;
  const mockOnShareStatusChange = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      quotationId: 'test-quotation-123',
      isShared: false,
      onShareStatusChange: mockOnShareStatusChange,
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <ShareQuotationButton {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Share URL Generation', () => {
    it('should generate share URL when not shared', async () => {
      const mockResponse = {
        success: true,
        shareUrl: 'http://localhost:3000/quotations/shared/token123',
        token: 'token123',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      renderComponent();

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/quotations/test-quotation-123/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      });

      await waitFor(() => {
        expect(mockOnShareStatusChange).toHaveBeenCalledWith(true, mockResponse.shareUrl);
        expect(toast.success).toHaveBeenCalledWith('Share URL generated successfully!');
      });
    });

    it('should show dialog when already shared', () => {
      renderComponent({
        isShared: true,
        shareUrl: 'http://localhost:3000/quotations/shared/existing-token',
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      expect(screen.getByText('Share Quotation')).toBeInTheDocument();
      expect(screen.getByDisplayValue('http://localhost:3000/quotations/shared/existing-token')).toBeInTheDocument();
    });

    it('should handle share generation errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Cannot share quotation without customer phone number',
          code: 'INVALID_QUOTATION',
        }),
      });

      renderComponent();

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cannot share quotation without customer phone number');
      });
    });
  });

  describe('Copy to Clipboard', () => {
    it('should copy share URL to clipboard', async () => {
      const shareUrl = 'http://localhost:3000/quotations/shared/token123';
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);

      renderComponent({
        isShared: true,
        shareUrl,
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      const copyButton = screen.getByRole('button', { name: '' }); // Copy button has no text, just icon
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl);
        expect(toast.success).toHaveBeenCalledWith('Share URL copied to clipboard!');
      });
    });

    it('should handle clipboard copy errors', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard error'));

      renderComponent({
        isShared: true,
        shareUrl: 'http://localhost:3000/quotations/shared/token123',
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      const copyButton = screen.getByRole('button', { name: '' });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to copy URL to clipboard');
      });
    });
  });

  describe('Revoke Access', () => {
    it('should revoke share access', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Share access revoked successfully',
        }),
      });

      renderComponent({
        isShared: true,
        shareUrl: 'http://localhost:3000/quotations/shared/token123',
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      const revokeButton = screen.getByRole('button', { name: /revoke access/i });
      fireEvent.click(revokeButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/quotations/test-quotation-123/share', {
          method: 'DELETE',
        });
      });

      await waitFor(() => {
        expect(mockOnShareStatusChange).toHaveBeenCalledWith(false);
        expect(toast.success).toHaveBeenCalledWith('Share access revoked successfully!');
      });
    });

    it('should handle revoke errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Quotation is not currently shared',
          code: 'NOT_SHARED',
        }),
      });

      renderComponent({
        isShared: true,
        shareUrl: 'http://localhost:3000/quotations/shared/token123',
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      const revokeButton = screen.getByRole('button', { name: /revoke access/i });
      fireEvent.click(revokeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Quotation is not currently shared');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during share generation', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, shareUrl: 'test', token: 'test' }),
        }), 100))
      );

      renderComponent();

      const shareButton = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareButton);

      expect(screen.getByRole('button', { name: /share/i })).toBeDisabled();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should show loading state during revoke', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      );

      renderComponent({
        isShared: true,
        shareUrl: 'http://localhost:3000/quotations/shared/token123',
      });

      const shareButton = screen.getByRole('button', { name: /shared/i });
      fireEvent.click(shareButton);

      const revokeButton = screen.getByRole('button', { name: /revoke access/i });
      fireEvent.click(revokeButton);

      expect(revokeButton).toBeDisabled();
    });
  });
});