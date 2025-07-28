# API Implementation Workflow

When implementing new APIs in this project, follow this established pattern based on Clean Architecture and DDD principles:

## 1. Define Domain Entity

Create the domain entity in `domain/entities/`:

```typescript
export interface EntityProps extends BaseProps {
  // Define entity properties
}

export class EntityName extends BaseEntity<EntityProps> {
  public static create(
    props: Omit<EntityProps, 'id'>,
    id?: string,
  ): EntityName {
    return new EntityName({ ...props }, id);
  }
}
```

## 2. Create Repository Interface

Define abstract repository in `domain/repositories/`:

```typescript
export abstract class EntityRepository extends BaseRepository<EntityName> {
  // Add domain-specific methods if needed
}
```

## 3. Implement Repository with Prisma

Create implementation in `infrastructure/repositories/`:

```typescript
@Injectable()
export class EntityRepositoryImpl extends EntityPrismaRepository {
  constructor(prismaClient: PrismaClient) {
    super(prismaClient);
  }
}

export class EntityPrismaRepository extends PrismaRepository<EntityName> {
  public toORM(entity: EntityName): EntityORM {
    // Map domain entity to database schema
  }

  public toEntity(data: EntityORM): EntityName {
    // Map database data to domain entity
  }
}
```

## 4. Create DTOs

Define DTOs in `controllers/dto/`:

```typescript
export class CreateEntityDto {
  @ApiProperty({ description: 'Field description', example: 'example' })
  @IsString()
  @IsNotEmpty()
  field: string;
}

export class EntityResponseDto {
  @ApiProperty({ description: 'ID', example: 'uuid' })
  id: string;
  // Map all entity fields with @ApiProperty
}
```

## 5. Implement Use Cases

Create use cases in `use-cases/`:

```typescript
@Injectable()
export class CreateEntityUseCase {
  constructor(private readonly entityRepository: EntityRepository) {}

  async execute(input: CreateEntityUseCaseInput): Promise<EntityName> {
    const entity = EntityName.create({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.entityRepository.create(entity);
  }
}
```

## 6. Create Controller

Implement controller in `controllers/`:

```typescript
@ApiTags('entities')
@ApiBearerAuth()
@Controller('entities')
export class EntityController {
  constructor(private readonly createEntityUseCase: CreateEntityUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({
    status: 201,
    description: 'Entity created successfully',
    type: EntityResponseDto,
  })
  async create(@Body() dto: CreateEntityDto) {
    return this.createEntityUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get entities for current user' })
  async getAll(@CurrentUser() user: AuthUser) {
    const entities = await this.getEntitiesUseCase.execute({ userId: user.id });
    return entities.map((entity) => entity.toObject());
  }
}
```

## 7. Configure Module

Update domain module in `module/`:

```typescript
@Module({
  controllers: [EntityController],
  providers: [
    ...repositories,
    ...useCases,
    {
      provide: EntityRepository,
      useClass: EntityRepositoryImpl,
    },
  ],
  exports: [EntityRepository, ...useCases],
})
export class DomainModule {}
```

## 8. Update Database Schema

Add new table/fields to `prisma/schema.prisma` and run migrations:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Key Implementation Guidelines

- **Authentication**: Most endpoints require JWT auth (global `SupabaseAuthGuard`). Use `@Public()` for public endpoints
- **User Context**: Use `@CurrentUser()` decorator to access authenticated user
- **Error Handling**: Leverage global exception filters for consistent error responses
- **Validation**: Use class-validator decorators on DTOs for automatic validation
- **Documentation**: Every endpoint needs `@ApiOperation`, `@ApiResponse`, and comprehensive `@ApiProperty` on DTOs
- **Response Format**: Entities should use `.toObject()` for serialization; global interceptor wraps responses
- **Repository Pattern**: Always use abstract repositories in use cases, implement with Prisma in infrastructure layer
- **Type Safety**: Maintain strict TypeScript types throughout all layers
- **Testing**: Follow existing patterns in `*.spec.ts` files for unit and integration tests