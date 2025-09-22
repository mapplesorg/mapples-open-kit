[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / useSizing

# Function: useSizing()

> **useSizing**(): `object`

Defined in: [packages/@mapples/style/src/hooks/useSizing.ts:52](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/hooks/useSizing.ts#L52)

Hook to access and manage sizing configuration with support for calculations and multipliers.

## Returns

`object`

Object containing sizing utilities

### sizing

> **sizing**: [`SizingMap`](../interfaces/SizingMap.md) = `sizingConfig.sizing`

### getSize()

> **getSize**: (`size`) => `DimensionValue`

#### Parameters

##### size

`string`

#### Returns

`DimensionValue`

## Examples

```tsx
const MyComponent = () => {
  const { getSize } = useSizing();

  return (
    <View style={{
      width: getSize('sm'),
      height: getSize('2*'), // 2 times base size
      padding: getSize('calc(100% - 20px)')
    }}>
      <Text>Sized content</Text>
    </View>
  );
};
```

```tsx
const MyComponent = () => {
  const { sizing, getSize } = useSizing();

  return (
    <View style={{
      margin: getSize('md'),
      borderRadius: getSize('lg'),
      minHeight: getSize('3*') // 3 times base size
    }}>
      <Text>Multiple sizes</Text>
    </View>
  );
};
```
