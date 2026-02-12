import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  describe('success', () => {
    it('should create a success toast', (done) => {
      service.getToasts().subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('success');
          expect(toasts[0].message).toBe('Success message');
          done();
        }
      });

      service.success('Success message');
    });
  });

  describe('error', () => {
    it('should create an error toast', (done) => {
      service.getToasts().subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('error');
          expect(toasts[0].message).toBe('Error message');
          done();
        }
      });

      service.error('Error message');
    });
  });

  describe('info', () => {
    it('should create an info toast', (done) => {
      service.getToasts().subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('info');
          expect(toasts[0].message).toBe('Info message');
          done();
        }
      });

      service.info('Info message');
    });
  });

  describe('warning', () => {
    it('should create a warning toast', (done) => {
      service.getToasts().subscribe(toasts => {
        if (toasts.length > 0) {
          expect(toasts[0].type).toBe('warning');
          expect(toasts[0].message).toBe('Warning message');
          done();
        }
      });

      service.warning('Warning message');
    });
  });

  describe('remove', () => {
    it('should remove a toast by id', (done) => {
      let toastId = '';

      service.getToasts().subscribe(toasts => {
        if (toasts.length > 0 && !toastId) {
          toastId = toasts[0].id;
          service.remove(toastId);
        } else if (toasts.length === 0 && toastId) {
          expect(toasts.length).toBe(0);
          done();
        }
      });

      service.success('Test message');
    });
  });

  describe('clear', () => {
    it('should clear all toasts', (done) => {
      service.success('Message 1');
      service.error('Message 2');
      service.info('Message 3');

      setTimeout(() => {
        service.clear();
        service.getToasts().subscribe(toasts => {
          expect(toasts.length).toBe(0);
          done();
        });
      }, 100);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss toast after duration', (done) => {
      vi.useFakeTimers();

      service.success('Auto-dismiss message', 1000);

      service.getToasts().subscribe(toasts => {
        if (toasts.length === 0) {
          expect(toasts.length).toBe(0);
          vi.useRealTimers();
          done();
        }
      });

      vi.advanceTimersByTime(1100);
    });

    it('should not auto-dismiss if duration is 0', (done) => {
      service.success('Persistent message', 0);

      setTimeout(() => {
        service.getToasts().subscribe(toasts => {
          expect(toasts.length).toBe(1);
          done();
        });
      }, 100);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple toasts', (done) => {
      service.success('Message 1');
      service.error('Message 2');
      service.info('Message 3');

      setTimeout(() => {
        service.getToasts().subscribe(toasts => {
          expect(toasts.length).toBe(3);
          expect(toasts[0].type).toBe('success');
          expect(toasts[1].type).toBe('error');
          expect(toasts[2].type).toBe('info');
          done();
        });
      }, 100);
    });
  });
});
