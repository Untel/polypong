/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.store.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 22:44:06 by adda-sil         ###   ########.fr       */
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
}

export interface Participant extends BaseObject {
  user: User;
  sawUntil: Date;
}

export interface Message extends BaseObject {
  content: string;
  sender: Participant;
}
export interface Thread extends BaseObject {
  lastMessage: Message;
  participants: Participant[];
}

export interface ActiveThread extends Thread {
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
        const mapped = {
          ...thread,
        };
        console.log('Mapped', mapped);
        return mapped;
      });

      return threads;
    },
    current(state): ActiveThread | null {
      return state._current;
    },
  },
  actions: {
    async fetchThreads() {
      this._threads = await threadApi.get<Thread[]>('');
    },

    async getOrCreateThread(userId: number | null | undefined) {
      if (userId) {
        this._current = await threadApi.get<ActiveThread>(userId);
      } else {
        this._current = null;
      }
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
      await threadApi.post<Thread[]>('/channel');
    },
  },
});
