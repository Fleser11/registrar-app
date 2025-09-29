import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideNoopAnimations } from '@angular/platform-browser/animations';


import { routes } from './app.routes';
import { BASE_PATH, Configuration } from '../generated/api';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false
        }
      }
    }),
    { provide: BASE_PATH, useValue: '/backend-service' },
    { 
      provide: Configuration, 
      useFactory: () => new Configuration({
        basePath: '/backend-service'
      })
    },
    provideNoopAnimations()
  ]
};
