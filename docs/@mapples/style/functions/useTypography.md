[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / useTypography

# Function: useTypography()

> **useTypography**(): `object`

Defined in: [hooks/useTypography.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/hooks/useTypography.ts#L41)

Hook to access and manage typography configuration and styles.

## Returns

`object`

Object containing typography utilities

### typographyConfig

> **typographyConfig**: [`TypographyConfig`](../interfaces/TypographyConfig.md)

### getTypographyStyle()

> **getTypographyStyle**: (`key`) => `object`

#### Parameters

##### key

`string` = `typographyConfig.default`

#### Returns

`object`

## Examples

```tsx
const MyComponent = () => {
  const { getTypographyStyle } = useTypography();

  return (
    <Text style={getTypographyStyle('heading1')}>
      Large Heading
    </Text>
  );
};
```

```tsx
const MyComponent = () => {
  const { typographyConfig, getTypographyStyle } = useTypography();

  return (
    <View>
      <Text style={getTypographyStyle('heading1')}>Title</Text>
      <Text style={getTypographyStyle('body')}>Body text</Text>
      <Text style={getTypographyStyle('caption')}>Caption</Text>
    </View>
  );
};
```
