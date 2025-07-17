export type Props<T> = {
  [key in keyof T]?: T[key];
};

export type RequiredProps<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

export type FindManyOptions = {
  skip: number;
  take: number;
};
