/* eslint-disable */

import { Prisma } from '../../../../generated/prisma';

export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async delete<T>(this: T, args: Prisma.Args<T, 'delete'>) {
        const context = Prisma.getExtensionContext(this);

        return await (context as any).update({
          where: args.where,
          data: {
            deleted_at: new Date(),
          },
        });
      },
    },
  },
});

export const softDeleteMany = Prisma.defineExtension({
  name: 'softDeleteMany',
  model: {
    $allModels: {
      deleteMany<M, A>(
        this: M,
        args: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this);

        return (context as any).updateMany({
          where: args.where,
          data: {
            deleted_at: new Date(),
          },
        });
      },
    },
  },
});

export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const _args = args as any;
        if (
          operation === 'findUnique' ||
          operation === 'findFirst' ||
          operation === 'findMany'
        ) {
          _args.where = { ..._args.where, deleted_at: null };

          return query(args);
        }

        return query(args);
      },
    },
  },
});
