import { BaseEntity, BaseProps } from '../entities/base.entity';

export abstract class BaseWatchList<T extends BaseEntity<BaseProps>> {
  private readonly _items: T[] = [];
  private readonly _addIds: Set<string> = new Set();
  private readonly _removeIds: Set<string> = new Set();
  private readonly _updateIds: Set<string> = new Set();

  constructor(items: T[]) {
    this._items = items;
  }

  public get items(): T[] {
    return this._items.filter((i) => !this._removeIds.has(i.id));
  }

  public add(item: T): void {
    this._items.push(item);
    this._addIds.add(item.id);
  }

  public remove(item: T): void {
    this._removeIds.add(item.id);
  }

  public update(item: T): void {
    const updatedIndex = this._items.findIndex((i) => i.id === item.id);
    if (updatedIndex !== -1) {
      this._items[updatedIndex] = item;
      this._updateIds.add(item.id);
    }
  }

  public get addedItems(): T[] {
    return this._items.filter((i) => this._addIds.has(i.id));
  }

  public get removedItems(): T[] {
    return this._items.filter((i) => this._removeIds.has(i.id));
  }

  public get updatedItems(): T[] {
    return this._items.filter((i) => this._updateIds.has(i.id));
  }
}
