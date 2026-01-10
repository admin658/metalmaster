const createMock = jest.fn();
const OpenAIMock = jest.fn(() => ({
  chat: {
    completions: {
      create: createMock,
    },
  },
}));

jest.mock('openai', () => ({
  OpenAI: OpenAIMock,
}));

const loadModule = async () => {
  const mod = await import('../utils/getToneSettings');
  return mod.getToneSettings;
};

describe('getToneSettings', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    createMock.mockReset();
    OpenAIMock.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws when the OpenAI API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const getToneSettings = await loadModule();

    await expect(getToneSettings('Metallica', 'ESP LTD')).rejects.toThrow(
      'OpenAI API key not configured. Tone settings service is unavailable.'
    );
  });

  it('throws when GPT returns invalid JSON', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    createMock.mockResolvedValue({
      choices: [{ message: { content: 'not-json' } }],
    });
    const getToneSettings = await loadModule();

    await expect(getToneSettings('Metallica', 'ESP LTD')).rejects.toThrow(
      'Failed to parse GPT response as JSON'
    );
  });

  it('throws when GPT returns an invalid tone payload', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    createMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ artist: 'Metallica' }) } }],
    });
    const getToneSettings = await loadModule();

    await expect(getToneSettings('Metallica', 'ESP LTD')).rejects.toThrow(
      'Invalid tone settings format'
    );
  });

  it('returns validated tone settings', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    const payload = {
      artist: 'Metallica',
      gear: 'ESP LTD, Mesa Boogie Dual Rectifier',
      amp: 'Mesa Boogie Dual Rectifier',
      cab: 'Mesa 4x12',
      pedals: ['Tube Screamer', 'Noise Gate'],
      settings: {
        gain: '7',
        bass: '6',
        mid: '5',
        treble: '7',
        presence: '6',
        notes: 'Slight scoop',
      },
      description: 'Classic Metallica rhythm tone with tight low end and scooped mids.',
    };
    createMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(payload) } }],
    });
    const getToneSettings = await loadModule();

    await expect(getToneSettings('Metallica', 'ESP LTD')).resolves.toEqual(payload);
  });
});