[**Mapples Open Kit - Types**](../../README.md)

***

[Mapples Open Kit - Types](../../packages.md) / @mapples/form

# @mapples/form

A comprehensive form management library for React and React Native with TypeScript support, validation, and advanced features like form history management.

## Features

- 🎯 **Type-safe** - Full TypeScript support with generic types
- ✅ **Validation** - Yup schema validation integration
- 📝 **Form History** - Built-in undo/redo functionality
- 🔄 **Reactive State** - Subscription-based reactive updates
- 🎣 **Hook-based API** - Comprehensive hooks for form management
- 🏗️ **Nested Objects** - Support for complex nested data structures
- 📱 **Cross-platform** - Works with React and React Native
- 👆 **Touch Tracking** - Built-in field touch state management

## Installation

```bash
npm install @mapples/form yup
# or
yarn add @mapples/form yup
```

## Quick Start

```tsx
import { Form, useFormField, useFormSubmit } from '@mapples/form';
import * as yup from 'yup';

// Define your form schema
const userSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup.number().min(18, 'Must be at least 18').required('Age is required'),
});

interface UserForm {
  name: string;
  email: string;
  age: number;
}

// Form component
const UserForm = () => (
  <Form<UserForm>
    initialValues={{ name: '', email: '', age: 0 }}
    validationSchema={userSchema}
    onSubmit={async (values) => {
      console.log('Submitting:', values);
      // Handle form submission
    }}
  >
    <NameField />
    <EmailField />
    <AgeField />
    <SubmitButton />
  </Form>
);

// Individual field components
const NameField = () => {
  const { value, error, isTouched, setValue, touch } = useFormField<string>(
    'name',
    '',
  );

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => touch('name')}
        placeholder="Enter your name"
      />
      {isTouched && error && <span className="error">{error}</span>}
    </div>
  );
};

const SubmitButton = () => {
  const { submitting, submitForm } = useFormSubmit();

  return (
    <button onClick={submitForm} disabled={submitting}>
      {submitting ? 'Submitting...' : 'Submit'}
    </button>
  );
};
```

## API Reference

### Components

#### `<Form<T>>`

The main form component that provides form context to its children.

**Props:**

- `initialValues: T` - Initial values for the form
- `validationSchema?: ObjectSchema<T>` - Optional Yup validation schema
- `onSubmit?: (values: T) => void | Promise<void>` - Form submission handler
- `ref?: RefObject<FormState<T> | null>` - Optional ref to access FormState directly
- `historyItems?: number` - Number of history items for undo/redo (0 to disable)
- `historyItemThrottle?: number` - Throttle for saving history items (default: 5)
- `filterHistoryKeys?: string[]` - Field paths to exclude from history tracking
- `onChange?: (values: T) => void` - Callback for form value changes

### Hooks

#### `useFormContext()`

Access the form context containing form state and methods.

```tsx
const {
  form,
  submitting,
  submitForm,
  validationErrors,
  validate,
  touch,
  touched,
} = useFormContext();
```

#### `useFormField<T>(fieldPath, fallbackValue?, subscribe?)`

Manage a single form field with value, validation, and touch state.

```tsx
const { value, error, errors, isTouched, setValue, validate, touch } =
  useFormField<string>('name', '');
```

**Parameters:**

- `fieldPath: string` - Dot notation path to the field (e.g., 'user.name')
- `fallbackValue?: T` - Default value if field is undefined
- `subscribe?: boolean` - Whether to subscribe to real-time changes (default: true)

#### `useFormValue<T>(fieldPath?)`

Get a reactive value from the form state.

```tsx
const userName = useFormValue<string>('user.name');
const allValues = useFormValue<UserForm>(); // Gets all form values
```

#### `useFormState<T>()`

Manage the entire form state with reactive values and control methods.

```tsx
const { values, setValues, getValues } = useFormState<UserForm>();
```

#### `useFormSubmit()`

Access form submission state and submit function.

```tsx
const { submitting, submitForm } = useFormSubmit();
```

#### `useFormHistory()`

Manage form history for undo/redo functionality.

```tsx
const { prev, next, canPrev, canNext } = useFormHistory();
```

#### `useFormArrayField<T>(fieldPath, fallbackValue?)`

Manage array fields with specialized array manipulation methods.

```tsx
const { value, api } = useFormArrayField<string>('tags', []);

// Available methods:
// api.push(item) - Add item to end
// api.remove(index) - Remove item at index
// api.paste(item, index) - Insert item at index
// api.dropLeft(count?) - Remove items from start
// api.dropRight(count?) - Remove items from end
// api.toggle(item) - Toggle item presence
```

#### `useFormFieldToggle(fieldPath)`

Manage boolean toggle fields.

```tsx
const { value, toggleValue } = useFormFieldToggle('isActive');
```

#### `useBindFormField<T>(fieldPath, fallBackPath?, fallbackValue?, subscribe?)`

Bind a form field with optional fallback path synchronization.

```tsx
const { value, error, setValue } = useBindFormField<string>(
  'user.name',
  'displayName', // Also updates displayName when user.name changes
  '',
);
```

### FormState Class

For advanced usage, you can access the FormState instance directly:

```tsx
const formRef = useRef<FormState<UserForm>>(null);

<Form ref={formRef} initialValues={initialValues}>
  {/* form content */}
</Form>;

// Access FormState methods
formRef.current?.getValues();
formRef.current?.setValue('name', 'John');
formRef.current?.validate();
```

**FormState Methods:**

- `getValues()` - Get all form values
- `setValues(values)` - Set all form values
- `getValue<V>(path?)` - Get value at specific path
- `setValue<V>(path, value)` - Set value at specific path
- `validate()` - Validate form using schema
- `subscribeOnChange<V>(callback, path?)` - Subscribe to value changes
- `subscribeOnHistoryChange(callback)` - Subscribe to history changes
- `prev()` - Move to previous history state (undo)
- `next()` - Move to next history state (redo)
- `canPrev()` - Check if undo is possible
- `canNext()` - Check if redo is possible

### Utility Functions

#### `objectDiff<T>(obj1, obj2, excludeKeys?)`

Compare two objects and return differences.

```tsx
const diff = objectDiff(oldValues, newValues, ['timestamp']);
```

#### `isEmpty(obj)`

Check if an object is empty.

```tsx
const isFormEmpty = isEmpty(formValues);
```

## Advanced Examples

### Nested Objects

```tsx
interface UserForm {
  personal: {
    name: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

const PersonalInfo = () => {
  const { value, setValue } = useFormField<string>('personal.name', '');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};

const AddressField = () => {
  const { value, setValue } = useFormField<string>('address.street', '');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};
```

### Form History Management

```tsx
const FormWithHistory = () => (
  <Form
    initialValues={initialValues}
    historyItems={50} // Keep 50 history items
    historyItemThrottle={3} // Save every 3rd change
    filterHistoryKeys={['timestamp']} // Don't track timestamp changes
  >
    <FormFields />
    <HistoryControls />
  </Form>
);

const HistoryControls = () => {
  const { prev, next, canPrev, canNext } = useFormHistory();

  return (
    <div>
      <button onClick={prev} disabled={!canPrev}>
        Undo
      </button>
      <button onClick={next} disabled={!canNext}>
        Redo
      </button>
    </div>
  );
};
```

### Array Field Management

```tsx
const TagsField = () => {
  const { value, api } = useFormArrayField<string>('tags', []);

  return (
    <div>
      {value.map((tag, index) => (
        <div key={index}>
          <span>{tag}</span>
          <button onClick={() => api.remove(index)}>Remove</button>
        </div>
      ))}
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            api.push(e.target.value);
            e.target.value = '';
          }
        }}
        placeholder="Add tag"
      />
    </div>
  );
};
```

### Custom Validation

```tsx
const customSchema = yup.object({
  password: yup.string().required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordField = () => {
  const { value, error, setValue, touch } = useFormField<string>(
    'password',
    '',
  );

  return (
    <div>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => touch('password')}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
```

## TypeScript Support

The library is fully typed with TypeScript. All hooks and components are generic and provide full type safety:

```tsx
interface MyFormData {
  name: string;
  age: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Type-safe form
<Form<MyFormData> initialValues={initialValues}>
  {/* Type-safe field access */}
  <MyFormFields />
</Form>;

// Type-safe field hooks
const { value } = useFormField<string>('name'); // value is typed as string
const { value: age } = useFormField<number>('age'); // value is typed as number
const { value: theme } = useFormField<'light' | 'dark'>('preferences.theme');
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Classes

- [FormState](classes/FormState.md)

## Interfaces

- [ValueSubscription](interfaces/ValueSubscription.md)
- [FormContextType](interfaces/FormContextType.md)
- [FormProps](interfaces/FormProps.md)

## Type Aliases

- [AnyValue](type-aliases/AnyValue.md)
- [SubscriptionCallBack](type-aliases/SubscriptionCallBack.md)

## Functions

- [Form](functions/Form.md)
- [useBindFormField](functions/useBindFormField.md)
- [useFormArrayField](functions/useFormArrayField.md)
- [useFormContext](functions/useFormContext.md)
- [useFormField](functions/useFormField.md)
- [useFormFieldToggle](functions/useFormFieldToggle.md)
- [useFormHistory](functions/useFormHistory.md)
- [useFormState](functions/useFormState.md)
- [useFormSubmit](functions/useFormSubmit.md)
- [useFormValue](functions/useFormValue.md)
