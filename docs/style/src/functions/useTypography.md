[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / useTypography

# Function: useTypography()

> **useTypography**(): `object`

Defined in: [packages/@mapples/style/src/hooks/useTypography.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/hooks/useTypography.ts#L41)

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
