import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';


import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideClientHydration(), provideHttpClient(),
    provideAnimations(),provideRouter(routes)]
};
