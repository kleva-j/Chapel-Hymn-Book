module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bundle drizzle migration .sql files inline as string imports so they
      // are usable at runtime in the Metro bundle.
      ['inline-import', { extensions: ['.sql'] }],
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
          },
        },
      ],
    ],
  };
};
