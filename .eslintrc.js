module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    requireConfigFile: false,
  },
  rules: {
    'prettier/prettier': 'error',
  },
};
