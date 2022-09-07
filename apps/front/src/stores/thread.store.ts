/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.store.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/07 19:39:32 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* eslint-disable no-underscore-dangle */

import { defineStore } from 'pinia';
import { mande, MandeError } from 'src/libs/mande';
import { Dialog, Notify } from 'quasar';
import { User } from 'src/types/user';
import { onError } from 'src/utils/mande-error';
import { useAuthStore } from './auth.store';

export const threadApi = mande('/api/thread', { onError });
export const channelApi = mande('/api/channel', { onError });

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
  joined: boolean;
  privacy: 'public' | 'private' | 'protected';
}

export interface BaseThread extends BaseObject {
  id: number;
  participants: Participant[];
  channel?: Channel;
  threadName: string;
}

export interface Thread extends BaseThread {
  lastMessage: Message;
  recipient: User;
  avatar: string;
  unreadMessages: Message[];
}

export interface ChannelItem extends Channel {
  thread: Thread;
}

export interface ActiveThread extends BaseThread {
  messages: Message[];
}

interface ChannelSettings {
  name: string;
  privacy: 'public' | 'private' | 'protected';
  password: string;
}
interface ThreadState {
  _threads: Thread[];
  _channels: ChannelItem[];
  _current: ActiveThread | null;
  channelSettings: ChannelSettings;
}

export const useThreadStore = defineStore('thread', {
  state: () => ({
    _threads: [],
    _channels: [],
    _current: null,
    channelSettings: {
      name: '',
      privacy: 'public',
      password: '',
    },
  } as ThreadState),
  getters: {
    channels(state): ChannelItem[] {
      console.log('Channels', state._channels);
      return state._channels.map((c) => ({
        ...c,
        name: c.name
          || (c.thread as Thread).participants
            .map((p) => p.user.name)
            .join(', '),

      }));
    },
    threads(state) {
      const $auth = useAuthStore();
      const threads = state._threads.map((thread) => {
        const recipient = thread.participants.find((p) => p.user.id !== $auth.user.id)?.user;
        const mapped = {
          ...thread,
          recipient,
          threadName: thread.channel
            ? thread.channel.name || thread.participants.map((p) => p.user.name).join(', ')
            : recipient?.name,
          avatar: !thread.channel
            ? recipient?.avatar
            : (thread.channel.avatar || 'group'),
          lastMessage: thread.lastMessage || null,
        };
        return mapped;
      });
      return threads;
    },

    totalUnread(state): number {
      return state._threads.reduce((acc, thread) => acc + thread.unreadMessages.length, 0);
    },
    current(state) {
      const thread = state._current;
      if (!thread) return null;
      const $auth = useAuthStore();
      const recipient = thread.participants.find((p) => p.user.id !== $auth.user.id)?.user;
      return {
        ...state._current,
        recipient,
        threadName: thread.channel
          ? thread.channel.name || thread.participants.map((p) => p.user.name).join(', ')
          : recipient?.name,
        avatar: !thread.channel
          ? recipient?.avatar
          : (thread.channel.avatar || 'group'),
      };
    },

  },
  actions: {
    async fetchThreads() {
      this._threads = await threadApi.get<Thread[]>('');
    },

    async fetchChannels() {
      this._channels = await channelApi.get<ChannelItem[]>('');
    },

    async getThread(threadId: number | null | undefined, password = null) {
      if (threadId) {
        try {
          const opts = password ? { query: { password } } : {};
          this._current = await threadApi.get<ActiveThread>(threadId, opts);
          this._threads.find((t) => t.id === threadId)?.unreadMessages.splice(0);
          this.channelSettings = {
            name: this._current.channel?.name || '',
            privacy: this._current.channel?.privacy || 'public',
            password: '',
          };
        } catch (e: MandeError<{ message: string, status: number }>) {
          if (e.body.status === 466) {
            console.log('Thread join error', e, e.body);
            Dialog.create({
              title: 'Password required',
              message: 'This thread require a password, please fill it',
              prompt: {
                model: 'password',
                type: 'password',
              },
              cancel: true,
            }).onOk(async (data) => {
              this.getThread(threadId, data);
            }).onCancel(() => {
              this.router.push('/inbox');
            });
          } else {
            this.router.push('/inbox');
          }
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
      if (!id || !content) return;
      await threadApi.post(`${id}/message`, { content });
    },

    async newDirectMessage(userId: number) {
      await threadApi.post<Thread[]>(userId);
    },

    async newChannel() {
      const channel = await channelApi.post<{ thread: Thread }>();
      await this.fetchThreads();
      this.router.push({ name: 'thread', params: { id: channel.thread.id } });
    },

    async updateChannel(settings: ChannelSettings) {
      const id = this._current?.id;
      const patched = await threadApi.patch(`${id}/channel`, settings);
    },

    async getChannels() {
      const channels = await channelApi.get<Channel[]>('');
      return channels;
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
        message: 'Are you sure you want to join this thread ?',
        cancel: true,
      }).onOk(async () => {
        // const response = await threadApi.delete(`${id}`);
        // this._threads = this._threads..
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
        this._threads = this._threads.filter((t) => t.id !== id);
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
            { label: 'Unmute', value: -1 },
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
        options: {
          model: 'duration',
          type: 'radio',
          items: [
            { label: 'Unban', value: -1 },
            { label: '10 mins', value: 10 },
            { label: '1 hour', value: 60, color: 'accent' },
            { label: 'Forever', value: null, color: 'negative' },
          ],
        },
        message: `Are you sure you want to ban ${participant.user.name} ?`,
        cancel: true,
      }).onOk(async (duration: number) => {
        const response = await threadApi.put(`${id}/ban`, {
          targetId: participant.user.id,
          duration,
        });
      });
    },

  },
});
