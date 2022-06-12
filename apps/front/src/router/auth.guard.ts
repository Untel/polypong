import { useAuthStore } from 'src/stores/auth.store';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

function buildRedirectObject(to: RouteLocationNormalized): any {
  if (to.name === 'home')
    return {};
  const redirect: any = { name: to.name };
  if (to.query)
    redirect.query = to.query;
  if (to.params)
    redirect.params = to.params;
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
