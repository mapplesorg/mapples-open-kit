[**@mapples/ui**](../README.md)

***

[@mapples/ui](../globals.md) / Image

# Variable: Image

> `const` **Image**: `ForwardRefExoticComponent`\<`Omit`\<`WithStyledProps`\<`ImageProps`\>, `"styled"`\> & `object` & `object` & `RefAttributes`\<`unknown`\>\>

Defined in: [packages/@mapples/ui/src/components/media/Image/Image.tsx:59](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/ui/src/components/media/Image/Image.tsx#L59)

A customizable image component with built-in styling support.

The Image component extends Expo's Image component with additional styling
capabilities through the @mapples/style system. It supports both container
and image-specific styling, and can use either the `source` or `dataSource` prop.

## Example

```tsx
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  alt="Example image"
  styled={{
    style: {
      width: 200,
      height: 200,
      borderRadius: 8
    },
    styleImage: {
      resizeMode: 'cover'
    }
  }}
/>
```
