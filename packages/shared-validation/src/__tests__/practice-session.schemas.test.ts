import { CreatePracticeSessionSchema, PracticeSessionSchema } from '../practice-session.schemas';

describe('PracticeSessionSchema', () => {
  it('accepts a full practice session payload', () => {
    const payload = {
      id: '45c98016-7c94-4c1b-836a-1f9f2f7d06af',
      user_id: 'b7f4d2d0-1f6b-4c10-9a7b-1a2b3c4d5e6f',
      session_type: 'lesson',
      duration_seconds: 120,
      xp_earned: 10,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    expect(PracticeSessionSchema.parse(payload).session_type).toBe('lesson');
  });

  it('rejects negative durations', () => {
    const payload = {
      session_type: 'lesson',
      duration_seconds: -1,
      xp_earned: 0,
    };

    expect(() => CreatePracticeSessionSchema.parse(payload)).toThrow();
  });
});
