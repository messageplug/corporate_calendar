# Calendar API Backend

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

## Тестирование
Проект содержит xUnit тесты в папке CalendarApi.Tests. Запустить:
dotnet test