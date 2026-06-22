# CRM Календарь

Система управления календарями и событиями с ролевой моделью доступа.

## Функционал

### Роли пользователей:
- **Администратор**: Полный доступ ко всем календарям и пользователям
- **Менеджер**: Создание календарей, управление пользователями, просмотр всех событий
- **Пользователь**: Просмотр назначенных календарей и событий

### Основные возможности:
- Создание и управление календарями
- Добавление событий с участниками
- Ролевой доступ к календарям и событиям
- Адаптивный интерфейс (от 320px)
- SSR (Server-Side Rendering)

## Технологии

- React.js 18
- Next.js 14 (SSR)
- TypeScript
- Tailwind CSS
- Zustand (управление состоянием)
- Axios (HTTP клиент)
- React Hook Form (формы)

## Установка и запуск

1. Клонирование репозитория:
\`\`\`bash
git clone <repository-url>
cd crm-calendar
\`\`\`

2. Установка зависимостей:
\`\`\`bash
npm install
\`\`\`

3. Запуск в режиме разработки:
\`\`\`bash
npm run dev
\`\`\`

4. Сборка для продакшена:
\`\`\`bash
npm run build
npm start
\`\`\`

## Структура проекта

\`\`\`
src/
├── components/     # React компоненты
├── pages/         # Страницы Next.js
├── services/      # API сервисы
├── store/         # Хранилище Zustand
├── types/         # TypeScript типы
├── utils/         # Вспомогательные функции
└── styles/        # Глобальные стили
\`\`\`

## Переменные окружения

Создайте файл \`.env.local\`:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

## Разработка

Проект использует:
- ESLint для проверки кода
- Prettier для форматирования
- TypeScript для типизации
- Tailwind CSS для стилей

## Лицензия

MIT

# API Backend

ASP.NET Core 8 Web API with PostgreSQL.

## Развертывание

### Локально (без Docker)
1. Установите .NET 8 SDK и PostgreSQL.
2. Создайте базу данных с именем calendar_db, пользователем calendar_user, паролем calendar_pass.
3. Примените миграции:
cd CalendarApi
dotnet ef database update
4. Запустите проект:
dotnet run
5. API будет доступно по адресу https://localhost:5001/swagger

### С Docker
1. Установите Docker Desktop.
2. В корневой папке выполните:
docker-compose up -d
3. API будет доступно по адресу http://localhost:5000/swagger

## Переменные окружения
- ConnectionStrings__DefaultConnection – строка подключения к БД.
- JwtSettings__Secret – секретный ключ для JWT (не менее 32 символов).
- Другие настройки можно переопределить через переменные окружения.

## Документация API
После запуска откройте Swagger UI по адресу /swagger.
