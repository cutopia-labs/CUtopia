export type DiscussionMessage = {
  _id: number;
  text: string;
  user: string;
};

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
