## Multi-stage Dockerfile for Aspirra.Api
## Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

## Copy csproj + solution first for better layer caching on restore
COPY Aspirra.slnx ./
COPY Directory.Build.props ./
COPY src/Aspirra.Domain/Aspirra.Domain.csproj         src/Aspirra.Domain/
COPY src/Aspirra.Application/Aspirra.Application.csproj src/Aspirra.Application/
COPY src/Aspirra.Infrastructure/Aspirra.Infrastructure.csproj src/Aspirra.Infrastructure/
COPY src/Aspirra.Api/Aspirra.Api.csproj               src/Aspirra.Api/
RUN dotnet restore src/Aspirra.Api/Aspirra.Api.csproj

## Copy the rest and publish
COPY . .
RUN dotnet publish src/Aspirra.Api/Aspirra.Api.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

## Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:8080 \
    ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Aspirra.Api.dll"]
