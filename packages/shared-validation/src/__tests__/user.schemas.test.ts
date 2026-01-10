import { UserProfileSchema, UpdateUserProfileSchema } from '../user.schemas';

describe('UserProfileSchema', () => {
  it('accepts a valid user profile', () => {
    const profile = {
      id: '1b6f7c63-0f17-4a40-a2c2-17b1f4a9a2b1',
      email: 'user@example.com',
      username: 'shredder',
      skill_level: 'intermediate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(UserProfileSchema.parse(profile).email).toBe(profile.email);
  });

  it('rejects invalid email addresses', () => {
    const profile = {
      id: '1b6f7c63-0f17-4a40-a2c2-17b1f4a9a2b1',
      email: 'not-an-email',
      username: 'shredder',
      skill_level: 'intermediate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(() => UserProfileSchema.parse(profile)).toThrow();
  });
});

describe('UpdateUserProfileSchema', () => {
  it('accepts partial updates', () => {
    const update = { bio: 'Metal riffs only' };
    expect(UpdateUserProfileSchema.parse(update).bio).toBe(update.bio);
  });
});
