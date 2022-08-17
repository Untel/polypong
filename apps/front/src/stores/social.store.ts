import { defineStore } from 'pinia';
import { mande } from 'mande';
import { Notify } from 'quasar';

export const relsApi = mande('/api/relationship');

export interface otherInfo {
  name: string,
  avatar: string,
}

export interface Relationship {
  id: number, // the relationship's unique id
  fromId: number, // user id of self
  toId: number, // user id of other
  friendship_sent: boolean, // true if self has invited other to be friendly
  friendship_received: boolean, // true if self received an invite from other to be friendly
  block_sent: boolean, // true if self has blocked other
  block_received: boolean, // true if other has blocked self
  to: otherInfo, // some relevant data about the 'other' user
}

type SocialState = {
  relationships: Relationship[],
  error: unknown,
  notifCount: number,
  searchedRel: Relationship | undefined,
}

export const useSocialStore = defineStore('social', {
  state: () => ({
    relationships: [],
    error: {},
    notifCount: 0,
    searchedRel: undefined as Relationship | undefined,
  } as SocialState),
  getters: {
    getRelationships(state): Relationship[] { return state.relationships; },
    getBlockSentRelations(): Relationship[] {
      return this.getRelationships.filter((r) => r.block_sent);
    },
    getFriendsRelationships(): Relationship[] {
      return this.getRelationships
        .filter((r) => r.friendship_sent && r.friendship_received);
    },
    getReceivedFriendships(): Relationship[] {
      return this.getRelationships
        .filter((r) => r.friendship_received && !r.friendship_sent);
    },
    getSentFriendships(): Relationship[] {
      return this.getRelationships
        .filter((r) => !r.friendship_received && r.friendship_sent);
    },
    getNotifCount(): number {
      return this.getReceivedFriendships.length;
    },
    getSearchedRel(state): Relationship | undefined {
      return state.searchedRel;
    },
  },
  actions: {
    async fetchRelationships() {
      try {
        this.relationships = await relsApi.get('rels');
      } catch (error) {
        console.log('error', error);
        Notify.create({
          type: 'negative', message: 'Error while fetching relationships',
        });
      }
    },

    getRelationship(name: string) {
      return this.getRelationships.find((r) => r.to.name === name);
    },

    async addRel(name: string) {
      try {
        this.relationships = await relsApi.post('addRel', { name });
      } catch (error: any) {
        Notify.create({
          type: 'warning', message: error.body.message,
        });
      }
    },

    async send_friendship(name: string) {
      try {
        this.relationships = await relsApi.post('sendFriendship', { name });
      } catch (error) {
        console.log('error', error);
        Notify.create({
          type: 'negative', message: 'Error while requesting friendship',
        });
      }
      Notify.create({
        type: 'positive', message: 'a friend invite has been sent',
      });
    },

    async unsend_friendship(name: string) {
      try {
        this.relationships = await relsApi.post('unsendFriendship', { name });
      } catch (error) {
        console.log('error', error);
        Notify.create({
          type: 'negative', message: 'Error while revoking friendship',
        });
      }
      Notify.create({
        type: 'positive', message: 'friendship has been revoked',
      });
    },

    async send_block(name: string) {
      try {
        this.relationships = await relsApi.post('sendBlock', { name });
      } catch (error) {
        console.log('error', error);
        Notify.create({
          type: 'negative', message: 'Error while blocking',
        });
      }
      Notify.create({
        type: 'positive', message: `${name} has been blocked`,
      });
    },

    async unsend_block(name: string) {
      try {
        this.relationships = await relsApi.post('unsendBlock', { name });
      } catch (error) {
        console.log('error', error);
        Notify.create({
          type: 'negative', message: 'Error while unblocking',
        });
      }
      Notify.create({
        type: 'positive', message: `${name} has been unblocked`,
      });
    },

    getRelByName(name: string): Relationship | undefined {
      return this.getRelationships.find((r) => r.to.name === name);
    },

    setSearchedRel(rel: Relationship | undefined): void {
      console.log('in setSearchedRel, rel = ', rel);
      this.searchedRel = rel;
    },

  },
});
