import { CreateJamTrackSchema, JamTrackSchema } from '../jam-track.schemas';

describe('JamTrackSchema', () => {
  it('accepts a valid jam track payload', () => {
    const payload = {
      id: '9c2d56cb-3d85-4c6b-a07b-b3a58e4adf6b',
      title: 'Midnight Riff',
      description: 'A moody backing track',
      bpm: 120,
      time_signature: '4/4',
      key: 'Em',
      duration_seconds: 180,
      difficulty_level: 'beginner',
      created_by: 'e7cc9a88-792d-41a6-a44b-9ecf6e36b9d4',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(JamTrackSchema.parse(payload).title).toBe(payload.title);
  });

  it('rejects invalid time signatures', () => {
    const payload = {
      title: 'Odd Time',
      description: 'Bad time signature',
      bpm: 120,
      time_signature: 'four/four',
      key: 'Em',
      duration_seconds: 180,
      difficulty_level: 'beginner',
    };

    expect(() => CreateJamTrackSchema.parse(payload)).toThrow();
  });
});
