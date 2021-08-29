export type DiscussionMessage = {
  id: number;
  _id: number;
  text: string;
  user: string;
};

export type Discussion = {
  _id: string;
  messages: [DiscussionMessage];
};

export type DiscussionRecent = {
  courseId: string;
  text: string;
  time?: number;
  user: string;
};
