import { useAuthStore } from 'src/stores/auth.store';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

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
    const redirect = JSON.stringify({
      name: to.name,
      query: to.query,
      params: to.params,
    });
    next({ name: 'login', query: { redirect } });
  }
};
