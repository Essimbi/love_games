import { trigger, transition, style, animate, keyframes } from '@angular/animations';

/**
 * Wheel spin animation with easing
 */
export const wheelSpinAnimation = trigger('wheelSpin', [
  transition(':enter', [
    style({ transform: 'rotate(0deg)' }),
    animate('3000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({ transform: 'rotate(var(--rotation))' }))
  ])
]);

/**
 * Celebration animation for result
 */
export const celebrationAnimation = trigger('celebration', [
  transition(':enter', [
    animate('600ms ease-out', keyframes([
      style({ transform: 'scale(0.8)', opacity: 0, offset: 0 }),
      style({ transform: 'scale(1.1)', opacity: 1, offset: 0.5 }),
      style({ transform: 'scale(1)', opacity: 1, offset: 1 })
    ]))
  ])
]);

/**
 * Confetti particle animation
 */
export const confettiAnimation = trigger('confetti', [
  transition(':enter', [
    animate('2000ms ease-out', keyframes([
      style({ transform: 'translateY(0) rotate(0deg)', opacity: 1, offset: 0 }),
      style({ transform: 'translateY(300px) rotate(360deg)', opacity: 0, offset: 1 })
    ]))
  ])
]);

/**
 * Bounce animation
 */
export const bounceAnimation = trigger('bounce', [
  transition(':enter', [
    animate('600ms ease-in-out', keyframes([
      style({ transform: 'translateY(0)', offset: 0 }),
      style({ transform: 'translateY(-20px)', offset: 0.5 }),
      style({ transform: 'translateY(0)', offset: 1 })
    ]))
  ])
]);

/**
 * Pulse animation
 */
export const pulseAnimation = trigger('pulse', [
  transition(':enter', [
    animate('1000ms ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.1)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

/**
 * Shake animation for error
 */
export const shakeAnimation = trigger('shake', [
  transition(':enter', [
    animate('400ms ease-in-out', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.25 }),
      style({ transform: 'translateX(10px)', offset: 0.5 }),
      style({ transform: 'translateX(-10px)', offset: 0.75 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

/**
 * Glow animation
 */
export const glowAnimation = trigger('glow', [
  transition(':enter', [
    animate('1500ms ease-in-out', keyframes([
      style({ boxShadow: '0 0 0 0 rgba(255, 107, 157, 0.7)', offset: 0 }),
      style({ boxShadow: '0 0 0 20px rgba(255, 107, 157, 0)', offset: 1 })
    ]))
  ])
]);
