// Simple re-export so other modules can import AlphaTab from this local package boundary
import AlphaTabModule from '@coderline/alphatab';

const AlphaTabApi = AlphaTabModule.AlphaTabApi || AlphaTabModule.default || AlphaTabModule;

export { AlphaTabApi };
export default AlphaTabApi;
