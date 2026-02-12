import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('GET requests', () => {
    it('should make a GET request', () => {
      const mockData = { id: 1, name: 'Test' };

      service.get('/test').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle GET errors', () => {
      service.get('/test').subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('/test');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('POST requests', () => {
    it('should make a POST request', () => {
      const mockData = { id: 1, name: 'Test' };
      const payload = { name: 'Test' };

      service.post('/test', payload).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockData);
    });

    it('should handle POST errors', () => {
      const payload = { name: 'Test' };

      service.post('/test', payload).subscribe(
        () => {},
        (error) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('/test');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request', () => {
      const mockData = { id: 1, name: 'Updated' };
      const payload = { name: 'Updated' };

      service.put('/test/1', payload).subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('/test/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request', () => {
      service.delete('/test/1').subscribe(() => {
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne('/test/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      service.get('/test').subscribe(
        () => {},
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne('/test');
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.get('/test').subscribe(
        () => {},
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne('/test');
      req.flush(null, { status: 0, statusText: 'Unknown Error' });
    });
  });
});
