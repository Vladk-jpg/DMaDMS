# Подключение к PostgreSQL без ORM в Next.js

Этот проект демонстрирует подключение к PostgreSQL базе данных без использования ORM, используя нативный драйвер `pg`.

## Установка зависимостей

```bash
npm install
```

Это установит пакет `pg` и типы `@types/pg`.

## Настройка переменных окружения

1. Создайте файл `.env.local` в корне проекта `hrm-system/`
2. Добавьте следующие переменные:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
```

Или используйте connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## Структура проекта

### `lib/db.ts`
Основной файл для подключения к базе данных:
- Создает пул соединений (`Pool`) для эффективного управления подключениями
- Экспортирует функцию `query()` для выполнения SQL запросов
- Экспортирует функцию `getClient()` для работы с транзакциями

### `lib/db-transaction.ts`
Пример использования транзакций в PostgreSQL.

### API Routes
- `app/api/users/route.ts` - CRUD операции для пользователей (GET, POST)
- `app/api/users/[id]/route.ts` - операции с конкретным пользователем (GET, PUT, DELETE)

### Server Components
- `app/users/page.tsx` - пример использования базы данных в Server Component

## Использование

### В API Routes (Route Handlers)

```typescript
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM users');
  return Response.json(result.rows);
}
```

### В Server Components

```typescript
import { query } from '@/lib/db';

export default async function MyPage() {
  const result = await query('SELECT * FROM users');
  return <div>{/* render users */}</div>;
}
```

### Выполнение запросов с параметрами

```typescript
const result = await query(
  'SELECT * FROM users WHERE id = $1 AND email = $2',
  [userId, email]
);
```

### Использование транзакций

```typescript
import { getClient } from '@/lib/db';

const client = await getClient();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO users ...');
  await client.query('UPDATE users ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Примеры SQL запросов

### SELECT
```typescript
const result = await query('SELECT * FROM users ORDER BY id ASC');
```

### INSERT
```typescript
const result = await query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  ['John Doe', 'john@example.com']
);
```

### UPDATE
```typescript
const result = await query(
  'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
  ['Jane Doe', userId]
);
```

### DELETE
```typescript
const result = await query('DELETE FROM users WHERE id = $1', [userId]);
```

## Важные замечания

1. **Используйте параметризованные запросы** (`$1, $2, ...`) для предотвращения SQL инъекций
2. **Всегда освобождайте клиента** (`client.release()`) после использования в транзакциях
3. **Обрабатывайте ошибки** - PostgreSQL может возвращать специфичные коды ошибок
4. **Пул соединений** управляет подключениями автоматически, не создавайте новые подключения вручную

## Коды ошибок PostgreSQL

- `23505` - Нарушение уникальности (UNIQUE constraint violation)
- `23503` - Нарушение внешнего ключа (FOREIGN KEY constraint violation)
- `23502` - Нарушение NOT NULL constraint

Пример обработки:

```typescript
try {
  await query('INSERT INTO users ...');
} catch (error) {
  const pgError = error as { code?: string };
  if (pgError.code === '23505') {
    // Обработка дубликата
  }
}
```

