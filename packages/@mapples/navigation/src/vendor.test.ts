/// <reference types="jest" />

// Fails fast if a vendored expo-router React Navigation path moves in a minor
// release. We assert each specifier *resolves* rather than importing `./vendor`
// directly: importing pulls in react-native, which the node test environment
// can't transform. The named exports themselves are covered by the TS build.
// See https://docs.expo.dev/router/migrate/sdk-55-to-56/.
describe('vendored expo-router react-navigation paths', () => {
  it.each([
    'expo-router/react-navigation',
    'expo-router/build/react-navigation/bottom-tabs',
    'expo-router/build/react-navigation/drawer',
    'expo-router/build/react-navigation/native-stack',
  ])('resolves "%s"', (specifier) => {
    expect(() => require.resolve(specifier)).not.toThrow();
  });
});
