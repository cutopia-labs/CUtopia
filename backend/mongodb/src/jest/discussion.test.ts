import { describe, beforeAll, afterAll, it } from '@jest/globals';

import {
  getDiscussion,
  sendDiscussionMessage,
} from '../controllers/discussion';
import DiscussionModel from '../models/discussion';

import { setup, teardown } from './env';

describe('Discussion', () => {
  beforeAll(async () => {
    await setup();
    // Empty the discussion documents
    await DiscussionModel.deleteMany({});
  });

  afterAll(teardown);

  it('Send and Get Discussion', async () => {
    const id = await sendDiscussionMessage({
      courseId: 'ABCD1234',
      text: 'Leng grade course',
      user: 'Someone',
    });

    const discussion = await getDiscussion({
      courseId: 'ABCD1234',
      page: 0,
    });
    expect(discussion).toMatchObject({
      messages: [
        {
          id,
          text: 'Leng grade course',
          user: 'Someone',
        },
      ],
      nextPage: null,
    });
  });
});
