/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import OnboardingScreen from '../src/screens/onboarding/OnboardingScreen';

test('a fresh install renders onboarding with the native navigation theme', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.root.findAllByType(OnboardingScreen)).toHaveLength(1);
  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});
