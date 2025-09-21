[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / useStyled

# Function: useStyled()

> **useStyled**\<`T`\>(`styled?`): `object`

Defined in: [packages/@mapples/style/src/hooks/useStyled.ts:56](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/hooks/useStyled.ts#L56)

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
