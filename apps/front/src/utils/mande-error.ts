import { MandeError } from 'src/libs/mande';
import { Notify } from 'quasar';

export function onError(e: MandeError<{ message: string, status: number }>) {
  if (e.body.status < 466) {
    Notify.create({
      message: `${e.message}`,
      caption: `${e.body.message}`,
      icon: 'fas fa-bug',
      color: 'negative',
    });
  }
  throw e;
}
