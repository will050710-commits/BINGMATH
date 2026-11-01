function loadEndpoints(platform, development) {
  jest.resetModules();
  jest.doMock('react-native', () => ({Platform: {OS: platform}}));
  global.__DEV__ = development;
  return require('../src/config/endpoints');
}

afterEach(() => {
  global.__DEV__ = true;
  jest.dontMock('react-native');
});

test('Android emulator connects to the host backend and web server', () => {
  const endpoints = loadEndpoints('android', true);
  expect(endpoints.API_BASE_URL).toBe('http://10.0.2.2:8000');
  expect(endpoints.WEB_BASE_URL).toBe('http://10.0.2.2:3000');
});

test('iOS simulator uses localhost for both services', () => {
  const endpoints = loadEndpoints('ios', true);
  expect(endpoints.API_BASE_URL).toBe('http://localhost:8000');
  expect(endpoints.WEB_BASE_URL).toBe('http://localhost:3000');
});

test.each(['android', 'ios'])('%s standalone packages use production HTTPS', platform => {
  const endpoints = loadEndpoints(platform, false);
  expect(endpoints.API_BASE_URL).toBe('https://duomath.onrender.com');
  expect(endpoints.WEB_BASE_URL).toBe('https://duomath.vercel.app');
});
