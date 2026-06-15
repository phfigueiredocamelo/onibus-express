FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY OnibusExpress.sln ./
COPY src/OnibusExpress.Domain/OnibusExpress.Domain.csproj src/OnibusExpress.Domain/
COPY src/OnibusExpress.Application/OnibusExpress.Application.csproj src/OnibusExpress.Application/
COPY src/OnibusExpress.Infrastructure/OnibusExpress.Infrastructure.csproj src/OnibusExpress.Infrastructure/
COPY src/OnibusExpress.Api/OnibusExpress.Api.csproj src/OnibusExpress.Api/
COPY tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj tests/OnibusExpress.Tests/

RUN dotnet restore OnibusExpress.sln

COPY . .
RUN dotnet publish src/OnibusExpress.Api/OnibusExpress.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OnibusExpress.Api.dll"]
