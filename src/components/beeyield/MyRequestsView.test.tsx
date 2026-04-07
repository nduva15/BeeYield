import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MyRequestsView from './MyRequestsView';

type MockRequest = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  type?: string;
  apiary_id?: string;
  hive_id?: string;
  category?: string;
  created_at: string;
  updated_at?: string | null;
};

type MockComment = {
  id: string;
  request_id: string;
  author_id: string;
  message: string;
  created_at: string;
};

const apiariesStore = [
  { id: 'apiary-1', name: 'North Yard' },
  { id: 'apiary-2', name: 'South Yard' },
];

const hivesStore = [
  { id: 'hive-1', apiary_id: 'apiary-1', hive_code: 'HIVE-001' },
  { id: 'hive-2', apiary_id: 'apiary-2', hive_code: 'HIVE-002' },
];

let requestsStore: MockRequest[] = [];
let commentsStore: Record<string, MockComment[]> = {};
let requestCounter = 1;
let commentCounter = 1;

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const MotionDiv = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  MotionDiv.displayName = 'MotionDiv';

  return {
    motion: new Proxy(
      {},
      {
        get: () => MotionDiv,
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/hooks/useApiaries', () => ({
  useApiaries: () => ({ data: apiariesStore }),
  useHives: (apiaryId?: string) => ({
    data: apiaryId ? hivesStore.filter((hive) => hive.apiary_id === apiaryId) : hivesStore,
  }),
}));

vi.mock('@/hooks/useRequests', () => ({
  useRequests: () => ({
    data: requestsStore,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useRequestDetail: (id: string) => ({
    data: requestsStore.find((request) => request.id === id) ?? null,
  }),
  useRequestComments: (requestId: string | null) => ({
    data: requestId ? commentsStore[requestId] ?? [] : [],
    isLoading: false,
  }),
  useCreateRequest: () => ({
    isPending: false,
    mutateAsync: async (input: any) => {
      const created: MockRequest = {
        id: `request-${requestCounter++}`,
        user_id: 'user-1',
        subject: input.subject,
        description: input.description,
        status: input.status || 'Open',
        priority: input.priority || 'Medium',
        type: input.type || 'support',
        apiary_id: input.apiary_id,
        hive_id: input.hive_id,
        category: input.category || 'General',
        created_at: new Date('2026-04-07T09:00:00Z').toISOString(),
        updated_at: null,
      };
      requestsStore = [created, ...requestsStore];
      return { data: created, error: null };
    },
  }),
  useUpdateRequest: () => ({
    isPending: false,
    mutateAsync: async ({ id, data }: { id: string; data: Partial<MockRequest> }) => {
      requestsStore = requestsStore.map((request) =>
        request.id === id
          ? {
              ...request,
              ...data,
              updated_at: new Date('2026-04-07T10:00:00Z').toISOString(),
            }
          : request,
      );
      return { data: requestsStore.find((request) => request.id === id) ?? null, error: null };
    },
  }),
  useDeleteRequest: () => ({
    isPending: false,
    mutateAsync: async (id: string) => {
      requestsStore = requestsStore.filter((request) => request.id !== id);
      delete commentsStore[id];
      return id;
    },
  }),
  useAddRequestComment: () => ({
    isPending: false,
    mutateAsync: async ({ requestId, message }: { requestId: string; message: string }) => {
      const comment: MockComment = {
        id: `comment-${commentCounter++}`,
        request_id: requestId,
        author_id: 'user-1',
        message,
        created_at: new Date('2026-04-07T11:00:00Z').toISOString(),
      };
      commentsStore[requestId] = [...(commentsStore[requestId] ?? []), comment];
      return { data: comment, error: null };
    },
  }),
}));

describe('MyRequestsView', () => {
  beforeEach(() => {
    requestsStore = [
      {
        id: 'request-seed',
        user_id: 'user-1',
        subject: 'Existing request',
        description: 'Seed ticket for regression coverage.',
        status: 'Open',
        priority: 'Medium',
        type: 'support',
        category: 'General',
        apiary_id: 'apiary-1',
        hive_id: 'hive-1',
        created_at: new Date('2026-04-06T09:00:00Z').toISOString(),
        updated_at: null,
      },
    ];
    commentsStore = {
      'request-seed': [],
    };
    requestCounter = 2;
    commentCounter = 1;
  });

  it('creates, edits, comments on, and deletes a request', async () => {
    render(<MyRequestsView onTabChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /new request/i }));
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Hive sensor battery issue' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Battery alert keeps firing after replacement in apiary north.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create request/i }));

    await waitFor(() => {
      expect(screen.getByText('Hive sensor battery issue')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    fireEvent.change(subjectInput, { target: { value: 'Hive sensor battery issue updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Hive sensor battery issue updated')).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText(/add a follow-up note/i), {
      target: { value: 'Confirmed on-site and attached additional diagnostics.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add comment/i }));

    await waitFor(() => {
      expect(screen.getByText('Confirmed on-site and attached additional diagnostics.')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
      expect(deleteButtons.length).toBeGreaterThan(1);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^delete$/i }).at(-1)!);

    await waitFor(() => {
      expect(screen.queryByText('Hive sensor battery issue updated')).toBeNull();
    });
  });
});
