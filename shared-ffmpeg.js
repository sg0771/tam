(function (global) {
  const state = {
    instance: null,
    loadingPromise: null,
    config: null,
  };

  function ensureFFmpegGlobal() {
    if (!global.FFmpeg || typeof global.FFmpeg.createFFmpeg !== 'function') {
      throw new Error('wasm 全局对象未就绪，请先加载 ./lib/ffmpeg.min.js');
    }
    return global.FFmpeg;
  }

  function getOrCreate(config) {
    if (state.instance) return state.instance;
    const { createFFmpeg } = ensureFFmpegGlobal();
    state.config = config || state.config || {};
    state.instance = createFFmpeg(state.config);
    return state.instance;
  }

  async function load(config) {
    const ffmpeg = getOrCreate(config);
    if (ffmpeg.isLoaded && ffmpeg.isLoaded()) return ffmpeg;
    if (!state.loadingPromise) {
      state.loadingPromise = ffmpeg.load().finally(() => {
        state.loadingPromise = null;
      });
    }
    await state.loadingPromise;
    return ffmpeg;
  }

  global.SharedFFmpeg = {
    getOrCreate,
    load,
    get instance() {
      return state.instance;
    },
    get config() {
      return state.config;
    }
  };
})(window);
