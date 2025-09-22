[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / Typography

# Variable: Typography

> `const` **Typography**: `ForwardRefExoticComponent`\<[`TypographyProps`](../interfaces/TypographyProps.md) & `RefAttributes`\<`Text`\>\>

Defined in: [packages/@mapples/style/src/components/Typography.tsx:58](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/components/Typography.tsx#L58)

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
