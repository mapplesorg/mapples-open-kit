[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / useStyled

# Function: useStyled()

> **useStyled**\<`T`\>(`styled?`): `object`

Defined in: [hooks/useStyled.ts:56](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/hooks/useStyled.ts#L56)

Hook to process styled objects with theme and sizing interpolation and responsive parsing.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### styled?

`T`

The styled object containing theme and sizing references

## Returns

`object`

Processed styled object with resolved theme colors, sizing values, and responsive styles

## Examples

```tsx
const MyComponent = () => {
  const { getStyled } = useStyled();

  const processedStyle = getStyled({
    backgroundColor: 'theme.colors.primary',
    padding: 'sizing.md',
    fontSize: '2*', // 2 times base size
    '&:tablet': { fontSize: '3*' }
  });

  return <View style={processedStyle}>Styled content</View>;
};
```

```tsx
const MyComponent = () => {
  const styled = useStyled({
    container: {
      backgroundColor: 'theme.colors.background',
      padding: 'sizing.lg',
      '&:mobile': { padding: 'sizing.sm' }
    },
    text: {
      color: 'theme.colors.text',
      fontSize: 'sizing.base'
    }
  });

  return (
    <View style={styled.container}>
      <Text style={styled.text}>Responsive styled content</Text>
    </View>
  );
};
```
