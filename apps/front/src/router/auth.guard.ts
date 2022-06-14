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
  if (to.query) redirect.query = to.query;
  if (to.params) redirect.params = to.params;
  return { redirect: JSON.stringify(redirect) };
}

export default async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  console.log("Ah ?", from, to);
  try {
    const auth = useAuthStore();
    await auth.whoAmI();
    await auth.connectToSocket();
    next();
  } catch (error) {
    console.log('Auth guard fail', error, to.name);
    next({ name: 'login', ...buildRedirectObject(to) });
  }
};
