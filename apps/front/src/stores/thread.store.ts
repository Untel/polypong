/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.store.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:06 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/18 18:55:48 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* eslint-disable no-underscore-dangle */

import { defineStore } from 'pinia';
import { mande } from 'mande';

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

export interface Message extends BaseObject {
  content: string;
}

export interface Thread extends BaseObject {
  lastMessage: Message;
  messages: Message[];
}

interface ThreadState {
  _threads: Thread[];
  _current: Thread | null;
}

export const useThreadStore = defineStore('thread', {
  state: () => ({
    _threads: [],
    _current: null,
  } as ThreadState),
  getters: {
    threads(state): Thread[] {
      return state._threads;
    },
    current(state): Thread | null {
      return state._current;
    },
  },
  actions: {
    async fetchThreads() {
      this._threads = await threadApi.get<Thread[]>('');
    },

    async getOrCreateThread(userId: number | null | undefined) {
      if (userId) {
        this._current = await threadApi.get<Thread>(userId);
      } else {
        this._current = null;
      }
    },

    async newDirectMessage(userId: number) {
      await threadApi.post<Thread[]>(userId);
    },

    async newChannel() {
      await threadApi.post<Thread[]>('/channel');
    },
  },
});
