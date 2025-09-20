import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ToastContainerComponent } from './components/toast-container';
import { CartFabComponent } from './components/cart-fab';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, CartFabComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('lojadofilipe');
  readonly year = new Date().getFullYear();

  private readonly router = inject(Router);

  // Track if we're on checkout page to hide cart fab
  isCheckoutPage = signal(false);

  constructor() {
    // Listen to route changes to update checkout page status
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url)
    ).subscribe(url => {
      this.isCheckoutPage.set(url.includes('/checkout'));
    });
  }
}
