import { PrismaClient } from '@/common/prisma';
import { DebtORM, TransactionORM } from '@/common/types/orms';
import {
  DebtAggregate,
  DebtAggregateRepository,
  DebtEntityProps,
  DebtPaymentRepository,
  DebtPaymentWatchList,
  DebtRepository,
} from '@/debt/domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DebtAggregateRepositoryImpl implements DebtAggregateRepository {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly debtRepository: DebtRepository,
    private readonly debtPaymentRepository: DebtPaymentRepository,
  ) {}

  toEntity(data: {
    id: string;
    debt: DebtORM;
    payments: TransactionORM[];
  }): DebtAggregate {
    return DebtAggregate.create(
      {
        debt: this.debtRepository.toEntity(data.debt),
        payments: new DebtPaymentWatchList(
          data.payments.map((payment) =>
            this.debtPaymentRepository.toEntity(payment),
          ),
        ),
      },
      data.id,
    );
  }

  async save(entity: DebtAggregate): Promise<void> {
    const debtORM = this.debtRepository.toORM(entity.props.debt) as DebtORM;

    return this.prismaClient.$transaction(async (tx) => {
      await tx.debts.upsert({
        where: { id: debtORM.id },
        create: {
          ...debtORM,
        },
        update: {
          ...debtORM,
        },
      });

      await tx.transactions.createMany({
        data: entity.props.payments.addedItems.map(
          (p) => this.debtPaymentRepository.toORM(p) as TransactionORM,
        ),
      });

      await tx.transactions.deleteMany({
        where: {
          id: { in: entity.props.payments.removedItems.map((p) => p.id) },
        },
      });

      await tx.transactions.updateMany({
        where: {
          id: { in: entity.props.payments.updatedItems.map((p) => p.id) },
        },
        data: {
          ...entity.props.payments.updatedItems.map((p) =>
            this.debtPaymentRepository.toORM(p),
          ),
        },
      });
    });
  }

  async findById(id: string): Promise<DebtAggregate | null> {
    const debtORM = await this.prismaClient.debts.findUnique({
      where: { id },
      include: {
        debt_transactions: { include: { transactions: true } },
      },
    });

    if (!debtORM) return null;

    return this.toEntity({
      id,
      debt: debtORM,
      payments: debtORM.debt_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }

  async findOne(
    props: Partial<Readonly<DebtEntityProps>>,
  ): Promise<DebtAggregate | null> {
    const debtORM = await this.prismaClient.debts.findFirst({
      where: {
        user_id: props.userId,
        lender: props.lender,
        purpose: props.purpose,
        rate: props.rate,
        due_date: props.dueDate,
        deleted_at: null,
      },
      include: {
        debt_transactions: { include: { transactions: true } },
      },
    });

    if (!debtORM) return null;

    return this.toEntity({
      id: debtORM.id,
      debt: debtORM,
      payments: debtORM.debt_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }
}
