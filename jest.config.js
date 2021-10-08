// https://nextjs.org/docs/testing#jest-and-react-testing-library

module.exports = {
  clearMocks: true,
  collectCoverageFrom: ['{api,app}/{helpers,hooks,libs}/**/*.js'],
  maxWorkers: '50%',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    /* Use babel-jest to transpile tests with the next/babel preset
    https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}
