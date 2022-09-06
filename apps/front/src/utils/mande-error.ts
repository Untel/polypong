import { MandeError } from 'src/libs/mande';
import { Notify } from 'quasar';

export function onError(e: MandeError<{ message: string}>) {
  Notify.create({
    message: `${e.message}`,
    caption: `${e.body.message}`,
    icon: 'fas fa-bug',
    color: 'negative',
  });
}
