import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor básico preparado para futuras funcionalidades (auth, headers, etc)
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // No futuro, adicionar token JWT aqui
  // const authToken = 'Bearer token';
  // const authReq = req.clone({
  //   setHeaders: { Authorization: authToken }
  // });
  
  return next(req);
};
