import { Notify } from 'quasar';
import { useLobbiesStore } from 'src/stores/lobbies.store';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export default async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  try {
    const lobbies = useLobbiesStore();
    const id = to.params['id'] as string;
    const response = await lobbies.fetchAndJoinLobby(id);
    console.log("retrieved values", response);
    next(vm => vm.setData(response));
  } catch (error) {
    console.log("Error", error);
    Notify.create({
      message: "Requested lobby does not exist",
      type: 'negative'
    });
    return next({ name: 'lobbies' });
  }
};
