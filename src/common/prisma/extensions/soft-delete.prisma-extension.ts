/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Prisma } from '../../../../generated/prisma';

export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async delete<T>(this: T, where: Prisma.Args<T, 'delete'>['where']) {
        const context = Prisma.getExtensionContext(this);
        console.log('🚀 ~ delete ~ context:', context);

        return await (context as any).update({
          where,
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
        where: Prisma.Args<M, 'deleteMany'>['where'],
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this);

        return (context as any).updateMany({
          where,
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
        if (
          operation === 'findUnique' ||
          operation === 'findFirst' ||
          operation === 'findMany'
        ) {
          args.where = { ...args.where, deleted_at: null };
          return query(args);
        }
        return query(args);
      },
    },
  },
});
