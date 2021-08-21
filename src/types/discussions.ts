export type DiscussionMessage = {
  _id: number;
  text: string;
  user: string;
};

export type Discussion = {
  _id: string;
  messages: [DiscussionMessage];
};
