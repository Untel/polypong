/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.store.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/26 18:51:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* eslint-disable no-underscore-dangle */

import { defineStore } from 'pinia';
import { mande } from 'mande';
import { User } from './lobbies.store';
import { useAuthStore } from './auth.store';

export const threadApi = mande('/api/thread');
export const channelApi = mande('/api/channel');

export interface BaseObject {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface Channel extends BaseObject {
  name: string;
  avatar: string;
}

export interface Participant extends BaseObject {
  user: User;
  sawUntil: Date;
}

export interface Message extends BaseObject {
  content: string;
  contents: string[];
  sender: Participant;
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
        this._current = await threadApi.get<ActiveThread>(threadId);
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
      console.log('Sendiiiing msg', content);
      const response = await threadApi.post(`${id}/message`, { content });
      console.log('Message sent', response);
    },

    async newDirectMessage(userId: number) {
      await threadApi.post<Thread[]>(userId);
    },

    async newChannel() {
      const thread = await channelApi.post<Thread>();
      await this.fetchThreads();
      this.router.push({ name: 'inbox', params: { id: thread.id } });
    },

    async socketAddMessage(thread: Thread, message: Message) {
      if (this._current && this._current.id === thread.id) {
        this.getThread(thread.id);
      }
      this.fetchThreads();
    },
  },
});
