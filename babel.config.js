module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'react',
          lazyImports: true,
        },
      ],
    ],
    plugins: [
      // Temporarily disabled due to worklets plugin issue
      // 'react-native-reanimated/plugin',
    ],
  };
};
