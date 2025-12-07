import { CreateLessonSchema } from '../lesson.schemas';

describe('CreateLessonSchema', () => {
  it('parses valid lesson payload', () => {
    const payload = {
      title: 'Speed Picking Basics',
      description: 'Short drills for speed',
      category: 'technique',
      difficulty_level: 'beginner',
      duration_minutes: 8,
      content: 'Detailed lesson content',
    };

    const parsed = CreateLessonSchema.parse(payload);
    expect(parsed.title).toBe(payload.title);
    expect(parsed.duration_minutes).toBe(payload.duration_minutes);
  });

  it('rejects missing title', () => {
    const payload = {
      description: 'No title here',
    } as any;

    expect(() => CreateLessonSchema.parse(payload)).toThrow();
  });
});
