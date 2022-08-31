export interface DiscussionMessageBase {
  text: string;
  user: string;
}

export interface DiscussionMessage extends DiscussionMessageBase {
  _id: number;
}

export type Discussion = {
  _id: string;
  messages: [DiscussionMessage];
  numMessages: number;
};

export type DiscussionRecent = {
  courseId: string;
  text: string;
  time?: number;
  user: string;
};
