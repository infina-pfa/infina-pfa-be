export type OptionalProps<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
} & {
  [P in K]?: T[P];
};

export type OptionalProp<T, K extends keyof T> = T & {
  [P in K]?: T[P];
};

export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};
