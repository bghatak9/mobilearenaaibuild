import {
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

import {
  PASSWORD_REQUIREMENT_TEXT,
  isPasswordValid,
} from '../password-policy';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: {
        message: PASSWORD_REQUIREMENT_TEXT,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isPasswordValid(value);
        },
      },
    });
  };
}
