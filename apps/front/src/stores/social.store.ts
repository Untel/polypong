import { defineStore, Pinia } from 'pinia';
import { mande, defaults, MandeError } from 'mande';
import { Notify } from 'quasar';
import { useLobbiesStore } from './lobbies.store';
import { useAuthStore } from './auth.store';

export const relsApi = mande('/api/rels');

export type Relationship = {
  id: number, // the relationship's unique id
  fromId: number, // user id of self
  toId: number, // user id of other
  status: string, // neutral / friend / block
  friendship_sent: boolean, // true if self has invited other to be friendly
  friendship_received: boolean, // true if self received an invite from other to be friendly
}

type SocialState = {
  relationships: Relationship[],
}

export const useSocialStore = defineStore('social', {
  state: () => ({
    relationships: [],
    error: {},
  } as SocialState),
  getters: {
    getRelationships: (state) => state.relationships,
  },
  actions: {
    async fetchRelationships() {
      try {
        this.relationships = await relsApi.get('');
      } catch (err) {
        console.log('err', err);
        Notify.create({
          type: 'negative', message: 'Error while fetching relationships',
        });
      }
    },
  },
});
