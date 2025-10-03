[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / useResponsive

# Function: useResponsive()

> **useResponsive**(): `object`

Defined in: [hooks/useResponsive.ts:110](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/hooks/useResponsive.ts#L110)

Hook to access and manage responsive design utilities and breakpoint information.

## Returns

`object`

Object containing responsive utilities

### currentBreakpoint

> **currentBreakpoint**: `string`

### isBreakpoint()

> **isBreakpoint**: (`breakpoint`) => `boolean`

#### Parameters

##### breakpoint

`string`

#### Returns

`boolean`

### isSmaller()

> **isSmaller**: (`width`) => `boolean`

#### Parameters

##### width

`number`

#### Returns

`boolean`

### isLarger()

> **isLarger**: (`width`) => `boolean`

#### Parameters

##### width

`number`

#### Returns

`boolean`

### getResponsiveStyle()

> **getResponsiveStyle**: \<`T`\>(`style`) => `T`

#### Type Parameters

##### T

`T`

#### Parameters

##### style

`T`

#### Returns

`T`

## Examples

```tsx
const MyComponent = () => {
  const { currentBreakpoint, isBreakpoint, getResponsiveStyle } = useResponsive();

  const responsiveStyle = getResponsiveStyle({
    fontSize: 16,
    '&:tablet': { fontSize: 20 },
    '&:desktop': { fontSize: 24 }
  });

  return (
    <Text style={responsiveStyle}>
      Current breakpoint: {currentBreakpoint}
    </Text>
  );
};
```

```tsx
const MyComponent = () => {
  const { isSmaller, isLarger, isBreakpoint } = useResponsive();

  return (
    <View>
      {isBreakpoint('mobile') && <Text>Mobile view</Text>}
      {isSmaller(768) && <Text>Small screen</Text>}
      {isLarger(1024) && <Text>Large screen</Text>}
    </View>
  );
};
```
