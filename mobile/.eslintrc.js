module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['scripts/*.cjs'],
      env: {node: true},
      parserOptions: {ecmaVersion: 2022},
    },
    {
      files: ['jest.setup.js'],
      env: {jest: true},
    },
  ],
};
