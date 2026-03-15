FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CalendarApi/CalendarApi.csproj", "CalendarApi/"]
RUN dotnet restore "CalendarApi/CalendarApi.csproj"
COPY . .
WORKDIR "/src/CalendarApi"
RUN dotnet build "CalendarApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CalendarApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CalendarApi.dll"]