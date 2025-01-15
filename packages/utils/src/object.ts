/**
 * check if the object is undefined
 * @param obj object to check
 * @returns true if the object is undefined, false otherwise
 */
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined';

/**
 * Check if the object is null or undefined
 * @param val object to check
 * @returns true if the object is null or undefined, false otherwise
 */
export const isNil = (val: any): val is null | undefined =>
  isUndefined(val) || val === null;

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object';

export const isPlainObject = (fn: any): fn is object => {
  if (!isObject(fn)) {
    return false;
  }
  const proto = Object.getPrototypeOf(fn);
  if (proto === null) {
    return true;
  }
  const ctor =
    Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
    proto.constructor;
  return (
    typeof ctor === 'function' &&
    ctor instanceof ctor &&
    Function.prototype.toString.call(ctor) ===
      Function.prototype.toString.call(Object)
  );
};

export const isFunction = (val: any): val is Function =>
  typeof val === 'function';
export const isString = (val: any): val is string => typeof val === 'string';
export const isNumber = (val: any): val is number => typeof val === 'number';
