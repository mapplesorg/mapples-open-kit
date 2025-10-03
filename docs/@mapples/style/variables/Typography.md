[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / Typography

# Variable: Typography

> `const` **Typography**: `ForwardRefExoticComponent`\<[`TypographyProps`](../interfaces/TypographyProps.md) & `RefAttributes`\<`Text`\>\>

Defined in: [components/Typography.tsx:58](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/components/Typography.tsx#L58)

Typography component that provides consistent text styling with theme and responsive support.
This component automatically applies typography styles based on the configured typography system.

## Param

The component props

## Param

The typography variant to apply

## Param

Custom color override

## Param

Additional styles

## Param

Styled props for advanced styling

## Param

Whether text should be selectable

## Param

The text content

## Example

```tsx
import { Typography } from '@mapples/style';

const MyComponent = () => {
  return (
    <View>
      <Typography variant="heading1">Main Title</Typography>
      <Typography variant="body" color="theme.colors.primary">
        Body text with custom color
      </Typography>
      <Typography selectable>
        Selectable text content
      </Typography>
    </View>
  );
};
```
