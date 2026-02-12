import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HeaderComponent', () => {
  it('should render header with title', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule]
    });

    const title = screen.getByText(/Valentine Games/i);
    expect(title).toBeDefined();
  });

  it('should render navigation links', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule]
    });

    expect(screen.getByText(/Secret Message/i)).toBeDefined();
    expect(screen.getByText(/Memory Game/i)).toBeDefined();
    expect(screen.getByText(/Treasure Hunt/i)).toBeDefined();
    expect(screen.getByText(/Love Wheel/i)).toBeDefined();
  });

  it('should have correct navigation links', async () => {
    const { fixture } = await render(HeaderComponent, {
      imports: [RouterTestingModule]
    });

    const links = fixture.nativeElement.querySelectorAll('a.nav-link');
    expect(links.length).toBe(4);
  });

  it('should display emoji icons', async () => {
    await render(HeaderComponent, {
      imports: [RouterTestingModule]
    });

    expect(screen.getByText('🔐')).toBeDefined();
    expect(screen.getByText('🧠')).toBeDefined();
    expect(screen.getByText('🗺️')).toBeDefined();
    expect(screen.getByText('🎡')).toBeDefined();
  });
});
