import { useAuthStore } from 'src/stores/auth';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export default async (
  from: RouteLocationNormalized,
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  console.log(from, to, next);
  const auth = useAuthStore();
  try {
    await auth.whoAmI();
    await auth.connectToSocket();
    // next();
  } catch (error) {
    console.log('Auth guard fail');
    // next({ name: 'auth' });
  }
};
