import { DiscussionMessage as DiscussionMessageRaw } from 'cutopia-types';

export type DiscussionMessage = DiscussionMessageRaw & {
  id?: number;
};
