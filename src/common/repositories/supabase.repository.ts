import { SupabaseClient } from '@supabase/supabase-js';
import { BaseEntity, BaseProps } from '../entities/base.entity';
import { FindManyOptions } from '../types/query.types';
import { Props } from '../utils/type';

export type TableNames =
  | 'budgets'
  | 'expenses'
  | 'incomes'
  | 'profiles'
  | 'quick_expense_presets'
  | 'worlds'
  | 'milestones'
  | 'personal_types'
  | 'tasks'
  | 'users'
  | 'user_progress'
  | 'user_quiz_answers'
  | 'quizzes'
  | 'quiz_questions'
  | 'quiz_answers'
  | 'user_personal_types'
  | 'videos'
  | 'user_conversations'
  | 'user_messages'
  | 'user_tasks_conversations'
  | 'user_milestones'
  | 'user_goals';

export abstract class SupabaseRepository<Entity extends BaseEntity<BaseProps>> {
  constructor(private readonly _client: SupabaseClient) {
    this._client = _client;
  }

  public get supabase() {
    return this._client;
  }

  public abstract get tableName(): TableNames;

  public abstract toORM(entity: Entity): unknown;

  public abstract toEntity(data: unknown): Entity;

  async update(entity: Entity): Promise<Entity> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...(this.toORM(entity) as Record<string, unknown>),
      })
      .eq('id', entity.id)
      .select('*');
    if (error) throw new Error(error.message);
    return this.toEntity(data[0]);
  }

  async delete(entity: Entity): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', entity.id);
    if (error) throw new Error(error.message);
  }

  async create(entity: Entity): Promise<Entity> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...(this.toORM(entity) as Record<string, unknown>),
      })
      .select();
    if (error) throw new Error(error.message);
    // Check if data is an array and has at least one element
    if (Array.isArray(data) && data.length > 0) {
      return this.toEntity(data[0]);
    }
    throw new Error('Failed to create entity: No data returned');
  }

  async findById(id: string): Promise<Entity> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.toEntity(data[0]);
  }

  async upsert(entity: Entity): Promise<Entity> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .upsert(this.toORM(entity))
      .select();
    if (error) throw new Error(error.message);
    return this.toEntity(data[0]);
  }

  async createMany(entities: Entity[]): Promise<Entity[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(entities.map((entity) => this.toORM(entity)))
      .select();
    if (error) throw new Error(error.message);
    return data.map((entity) => this.toEntity(entity));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Entity> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return this.toEntity(data[0]);
  }

  async findMany(
    props: Props<Entity>,
    options?: FindManyOptions,
  ): Promise<Entity[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(options?.select ? options.select.join(',') : '*');

    for (const [key, value] of Object.entries(props)) {
      if (value) {
        query = query.eq(key, value);
      }
    }

    if (options?.pagination) {
      const offset = (options.pagination.page - 1) * options.pagination.limit;
      query = query.range(offset, offset + options.pagination.limit - 1);
    }

    if (options?.sort) {
      for (const sortParam of options.sort) {
        query = query.order(sortParam.field, {
          ascending: sortParam.direction === 'asc',
        });
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data?.map((item) => this.toEntity(item)) || [];
  }
}
