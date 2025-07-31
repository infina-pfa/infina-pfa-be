export type OptionalProps<T> = {
  [key in keyof T]?: T[key];
};

export type OptionalProp<T, K extends keyof T> = T & {
  [P in K]?: T[P];
};

export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
