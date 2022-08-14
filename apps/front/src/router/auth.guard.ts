import { useAuthStore } from 'src/stores/auth.store';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

interface IRedirect {
  name?: string;
  query?: object;
  params?: object;
}

function buildRedirectObject(to: RouteLocationNormalized): any {
  if (to.name === 'home') return {};

  const redirect: IRedirect = { name: to.name as string };
  if (Object.keys(to.query).length) redirect.query = to.query;
  if (Object.keys(to.params).length) redirect.params = to.params;
  return { redirect: JSON.stringify(redirect) };
}

export default async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const auth = useAuthStore();

  /**
   * Si on etait deja log, on clear la precedente connection
   * (Pour eviter d'overlap les websockets)
   */
  if (auth.socket.connected) auth.socket.disconnect();

  /**
   * Si un token est passe en params query, alors on tente de s'auto connect via se token
   */
  const autoToken: string = to.query.token as string;
  console.log(`authguard - parsed token from URI : ${autoToken}`);
  if (autoToken) {
    localStorage.setItem('token', autoToken);
    delete to.query.token;
    return next(to);
  }

  try {
    await auth.whoAmI();
    await auth.connectToSocket();
    return next();
  } catch (error: any) {
    if (Object.hasOwn(error, 'body')) {
      if (error.body.statusCode === 401) {
        if (error.body.message === '2FA') {
          return next({ name: '2fa' });
        }
      }
    }
    const redirect = buildRedirectObject(to);
    console.log('Auth guard fail', error, to.name, redirect);
    return next({ name: 'login', query: redirect });
  }
};
