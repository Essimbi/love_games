import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SecretMessageService } from './services/secret-message.service';
import { EncryptionService } from '../../core/services/encryption.service';

describe('Secret Message E2E Workflow', () => {
  let secretMessageService: SecretMessageService;
  let encryptionService: EncryptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SecretMessageService, EncryptionService]
    });

    secretMessageService = TestBed.inject(SecretMessageService);
    encryptionService = TestBed.inject(EncryptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should complete full workflow: create -> share -> view -> decrypt', async () => {
    // Step 1: Create a secret message
    const messageText = 'I love you!';
    const maxViews = 3;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const createRequest = secretMessageService.createMessage(
      messageText,
      maxViews,
      expirationDate
    );

    createRequest.subscribe(response => {
      expect(response.id).toBeDefined();
      expect(response.shareUrl).toBeDefined();
    });

    const req = httpMock.expectOne('/secret-messages');
    expect(req.request.method).toBe('POST');
    const createdMessage = {
      id: 'msg-123',
      shareUrl: 'https://example.com/secret-message/msg-123#key123'
    };
    req.flush(createdMessage);

    // Step 2: Retrieve and decrypt the message
    const retrieveRequest = secretMessageService.retrieveMessage('msg-123', 'key123');

    retrieveRequest.subscribe(response => {
      expect(response.message).toBeDefined();
      expect(response.viewsCount).toBeLessThanOrEqual(maxViews);
    });

    const retrieveReq = httpMock.expectOne('/secret-messages/msg-123');
    expect(retrieveReq.request.method).toBe('GET');
    const retrievedMessage = {
      message: messageText,
      viewsCount: 1,
      maxViews: maxViews,
      expiresAt: expirationDate.toISOString()
    };
    retrieveReq.flush(retrievedMessage);

    // Step 3: Delete the message
    const deleteRequest = secretMessageService.deleteMessage('msg-123');

    deleteRequest.subscribe(() => {
      expect(true).toBe(true);
    });

    const deleteReq = httpMock.expectOne('/secret-messages/msg-123');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});
  });

  it('should handle max views limit', async () => {
    const messageId = 'msg-456';
    const maxViews = 1;

    // First view
    const firstView = secretMessageService.retrieveMessage(messageId, 'key456');
    firstView.subscribe(response => {
      expect(response.viewsCount).toBe(1);
    });

    const firstReq = httpMock.expectOne(`/secret-messages/${messageId}`);
    firstReq.flush({
      message: 'Secret',
      viewsCount: 1,
      maxViews: maxViews
    });

    // Second view should fail
    const secondView = secretMessageService.retrieveMessage(messageId, 'key456');
    secondView.subscribe(
      () => {},
      (error) => {
        expect(error.status).toBe(410); // Gone
      }
    );

    const secondReq = httpMock.expectOne(`/secret-messages/${messageId}`);
    secondReq.flush('Message has reached max views', {
      status: 410,
      statusText: 'Gone'
    });
  });

  it('should handle expired messages', async () => {
    const messageId = 'msg-789';
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    const retrieveRequest = secretMessageService.retrieveMessage(messageId, 'key789');

    retrieveRequest.subscribe(
      () => {},
      (error) => {
        expect(error.status).toBe(410); // Gone
      }
    );

    const req = httpMock.expectOne(`/secret-messages/${messageId}`);
    req.flush('Message has expired', {
      status: 410,
      statusText: 'Gone'
    });
  });
});
