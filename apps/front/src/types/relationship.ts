import { CoalitionChoice } from './coalition';

export interface relationship {
  id: number, // the relationship's unique id
  fromId: number, // user id of self
  toId: number, // user id of other
  status: string, // neutral / friend / block
  friendship_sent: boolean, // true if self has invited other to be friendly
  friendship_received: boolean, // true if self received an invite from other to be friendly
}

/*
  If friendship was both sent and received, the relationship status is set to 'friend'.
  If any party revokes the friendhsip (frienship_sent = false) it will trigger an update of
  the other party's own 'friendship_sent' property to false.
  (thus the party that revokes the friendship must ask again if it wants to be friends
  once more).
*/
