import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./routes/brand-select').then(m => m.BrandSelectComponent)
	},
	{
		path: 'checkout',
		canActivate: [() => import('./guards/cart-not-empty.guard').then(m => m.cartNotEmptyGuard)],
		loadComponent: () => import('./routes/checkout').then(m => m.CheckoutPageComponent)
	},
	{
		path: 'order-confirmation',
		loadComponent: () => import('./routes/order-confirmation').then(m => m.OrderConfirmationPageComponent)
	},
	{
		path: ':brand',
		loadComponent: () => import('./routes/brand-products').then(m => m.BrandProductsComponent)
	},
	{ path: '**', redirectTo: '' }
];
