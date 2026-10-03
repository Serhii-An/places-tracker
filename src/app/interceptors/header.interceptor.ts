import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environments';


export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Places-Api-Version': '2025-06-17',
      accept: 'application/json',
      Authorization: `Bearer ${environment.foursquareToken}`
    }
  });

  return next(modifiedReq);
};
