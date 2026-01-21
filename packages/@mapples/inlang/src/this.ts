import { DATA_THIS, DOT_SEPARATOR, FN_SEPARATOR } from './constants';

const actionThisRegExp = new RegExp(`^"this(${FN_SEPARATOR}\\d+)?"$`);

export type This = ['this', string?];

export const isThis = (value?: string) => {
  return actionThisRegExp.test(value || '');
};

export const isDataThis = (value?: string) => {
  return value?.startsWith(DATA_THIS);
};

export const parseDataThis = (value: string) => {
  return value.replace(DATA_THIS, '').split(DOT_SEPARATOR);
};

export const parseThis = (value?: string): This => {
  return value ? (value.slice(1, -1).split(FN_SEPARATOR) as This) : ['this'];
};
