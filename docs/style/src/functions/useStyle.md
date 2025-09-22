[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / useStyle

# Function: useStyle()

> **useStyle**(`customStyleConfig?`): [`StyleContextType`](../interfaces/StyleContextType.md)

Defined in: [packages/@mapples/style/src/hooks/useStyle.ts:38](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/hooks/useStyle.ts#L38)

Hook to access the current style configuration from the StyleContext.

## Parameters

### customStyleConfig?

[`StyleContextType`](../interfaces/StyleContextType.md)

Optional custom style configuration to override the context value

## Returns

[`StyleContextType`](../interfaces/StyleContextType.md)

The style configuration object containing theme, typography, sizing, and responsive settings

## Examples

```tsx
const MyComponent = () => {
  const style = useStyle();

  return (
    <View style={{ backgroundColor: style.themeConfig.light.primary }}>
      <Text>Styled content</Text>
    </View>
  );
};
```

```tsx
const MyComponent = () => {
  const customStyle = {
    themeConfig: { / custom theme / },
    typographyConfig: { / custom typography / }
  };
  const style = useStyle(customStyle);

  return <Text>Using custom style</Text>;
};
```
