/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.store.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/29 22:21:06 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* eslint-disable no-underscore-dangle */

import { defineStore } from 'pinia';
import { mande, MandeError } from 'mande';
import { Dialog, Notify } from 'quasar';
import { User } from 'src/types/user';
import { useAuthStore } from './auth.store';

export const threadApi = mande('/api/thread');
export const channelApi = mande('/api/channel');

export interface BaseObject {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export enum ThreadMemberStatus {
  MEMBER,
  ADMIN,
  OWNER,
}
export interface Participant extends BaseObject {
  user: User;
  sawUntil: Date;
  status: ThreadMemberStatus,
}

export interface Message extends BaseObject {
  content: string;
  contents: string[];
  sender?: User;
}

export interface Channel extends BaseObject {
  name: string;
  avatar: string;
}

export interface BaseThread extends BaseObject {
  id: number;
  participants: Participant[];
  channel?: Channel;
}

export interface Thread extends BaseThread {
  lastMessage: Message;
  recipient: User;
  avatar: string;
  unreadMessages: Message[];
}

export interface ActiveThread extends BaseThread {
  messages: Message[];
}

interface ThreadState {
  _threads: Thread[];
  _current: ActiveThread | null;
}

export const useThreadStore = defineStore('thread', {
  state: () => ({
    _threads: [],
    _current: null,
  } as ThreadState),
  getters: {
    threads(state): Thread[] {
      const $auth = useAuthStore();
      const threads = state._threads.map((thread) => {
        const recipient = thread.participants.find((p) => p.user.id !== $auth.user.id)?.user;
        const mapped = {
          ...thread,
          recipient,
          avatar: !thread.channel
            ? recipient?.avatar
            : (thread.channel.avatar || 'group'),
          lastMessage: thread.lastMessage || { createdAt: Date.now(), content: 'Empty thread' },
        };
        return mapped;
      });
      return threads;
    },
    totalUnread(state): number {
      return state._threads.reduce((acc, thread) => acc + thread.unreadMessages.length, 0);
    },
    current(state): ActiveThread | null {
      if (!state._current) return null;
      return state._current;
    },

  },
  actions: {
    async fetchThreads() {
      this._threads = await threadApi.get<Thread[]>('');
    },

    async getThread(threadId: number | null | undefined) {
      if (threadId) {
        try {
          this._current = await threadApi.get<ActiveThread>(threadId);
          this._threads.find((t) => t.id === threadId)?.unreadMessages.splice(0);
        } catch (e: MandeError<unknown>) {
          this.router.push('/inbox');
          Notify.create({
            message: e.message,
            color: 'negative',
          });
        }
      } else {
        this._current = null;
      }
    },

    async getDmThreadByUserId(userId: number | null | undefined) {
      if (userId) {
        const res = await threadApi.get<ActiveThread>(`/user/${userId}`);
        return res;
      }
      return null;
    },

    async sendMessage(content: string) {
      const id = this._current?.id;
      if (!id) return;
      try {
        const response = await threadApi.post(`${id}/message`, { content });
      } catch (e: MandeError) {
        Notify.create({
          message: `${e.message}`,
          caption: `${e.body.message}`,
          icon: 'fas fa-bug',
          color: 'negative',
        });
      }
    },

    async newDirectMessage(userId: number) {
      await threadApi.post<Thread[]>(userId);
    },

    async newChannel() {
      const channel = await channelApi.post<{ thread: Thread }>();
      await this.fetchThreads();
      this.router.push({ name: 'inbox', params: { id: channel.thread.id } });
    },

    async socketAddMessage(thread: Thread, message: Message) {
      if (this._current && this._current.id === thread.id) {
        this.getThread(thread.id);
      }
      this.fetchThreads();
    },

    async join() {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Leave thread',
        message: 'Are you sure you want to leave this thread ?',
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.delete(`${id}`);
        this._threads = this.threads.filter((t) => t.id !== id);
        this.router.push('/inbox');
      });
    },

    async leave() {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Leave thread',
        message: 'Are you sure you want to leave this thread ?',
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.delete(`${id}`);
        this.router.push('/inbox');
        this._threads = this.threads.filter((t) => t.id !== id);
      });
    },

    async invite(user: User) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Invite user',
        message: `Are you sure you want to invite ${user.name} in this thread ?`,
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.get(`${id}/invite/${user.id}`);
      });
    },

    async promote(participant: Participant) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Promote user',
        message: `Are you sure you want to promote ${participant.user.name} ?`,
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.put(`${id}/promote`, {
          targetId: participant.user.id,
        });
      });
    },

    async demote(participant: Participant) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Demote user',
        message: `Are you sure you want to demote ${participant.user.name} ?`,
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.put(`${id}/demote`, {
          targetId: participant.user.id,
        });
      });
    },

    async kick(participant: Participant) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Kick user',
        message: `Are you sure you want to kick ${participant.user.name} ?`,
        cancel: true,
      }).onOk(async () => {
        const response = await threadApi.put(`${id}/kick`, {
          targetId: participant.user.id,
        });
      });
    },

    async mute(participant: Participant) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: 'Mute user',
        message: `How much time do you want to mute ${participant.user.name} on this thread ?`,
        options: {
          model: 'duration',
          type: 'radio',
          items: [
            { label: '10 mins', value: 10 },
            { label: '1 hour', value: 60, color: 'accent' },
            { label: 'Forever', value: null, color: 'negative' },
          ],
        },
        cancel: true,
      }).onOk(async (duration) => {
        const response = await threadApi.put(`${id}/mute`, {
          targetId: participant.user.id,
          duration,
        });
      });
    },

    async ban(participant: Participant) {
      const id = this._current?.id;
      if (!id) return;
      Dialog.create({
        title: `Ban ${participant.user.name} thread`,
        prompt: {
          label: 'Duration',
          type: 'number',
          model: '42',
        },
        message: `Are you sure you want to ban ${participant.user.name} ?`,
        cancel: true,
      }).onOk(async (duration: number) => {
        const response = await threadApi.put(`${id}/ban`, { duration });
      });
    },
  },
});
