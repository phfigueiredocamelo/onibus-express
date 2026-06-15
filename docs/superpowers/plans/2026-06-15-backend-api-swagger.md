# Backend API and Swagger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add thin API controllers, Swagger/CORS wiring, startup migrations/seed, and a focused endpoint test for the bus reservation backend.

**Architecture:** Keep controllers thin and push read behavior into application services with explicit DTOs for routes and trips. Reuse the existing reservation command services, add code-based reservation lookup/cancel services only where needed, and let the API translate `Result<T>` failures into Portuguese HTTP responses. Start the app only after migrations and seed data have been applied.

**Tech Stack:** ASP.NET Core controllers, Swashbuckle OpenAPI, EF Core migrations, SQLite-backed integration tests, `WebApplicationFactory`.

---

### Task 1: Add application query contracts and services

**Files:**
- Create: `backend/src/OnibusExpress.Application/Routes/RouteSummaryDto.cs`
- Create: `backend/src/OnibusExpress.Application/Routes/GetRoutesService.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/TripSearchRequest.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/TripSeatDto.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/TripSummaryDto.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/TripDetailsDto.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/SearchTripsService.cs`
- Create: `backend/src/OnibusExpress.Application/Trips/GetTripByIdService.cs`
- Modify: `backend/src/OnibusExpress.Application/Abstractions/IReservationRepository.cs`
- Create: `backend/src/OnibusExpress.Application/Abstractions/ITripQueryRepository.cs`

- [ ] **Step 1: Write the failing test**

Create a unit/integration-style test that can resolve routes and trips through the new service contract and asserts seeded routes and future trip data are returned.

- [ ] **Step 2: Run test to verify it fails**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~Route`

Expected: compile failure because the new services/contracts do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement the query DTOs, services, and EF-backed repository methods needed to return seeded routes and searchable trips.

- [ ] **Step 4: Run test to verify it passes**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~Route`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/OnibusExpress.Application docs/superpowers/plans/2026-06-15-backend-api-swagger.md
git commit -m "feat: add query services for routes and trips"
```

### Task 2: Add API controllers, startup wiring, and HTTP translation

**Files:**
- Create: `backend/src/OnibusExpress.Api/Controllers/RoutesController.cs`
- Create: `backend/src/OnibusExpress.Api/Controllers/TripsController.cs`
- Create: `backend/src/OnibusExpress.Api/Controllers/ReservationsController.cs`
- Create: `backend/src/OnibusExpress.Api/ApiErrorMapper.cs`
- Modify: `backend/src/OnibusExpress.Api/Program.cs`
- Modify: `backend/src/OnibusExpress.Api/OnibusExpress.Api.csproj`

- [ ] **Step 1: Write the failing test**

Add a WebApplicationFactory-based endpoint test for `POST /reservas` with invalid CPF returning `400` and a Portuguese error payload.

- [ ] **Step 2: Run test to verify it fails**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~ReservationsApi`

Expected: compile/runtime failure until controllers and startup wiring exist.

- [ ] **Step 3: Write minimal implementation**

Wire controllers, CORS, Swagger, startup migrations/seed, and `Result<T>` translation helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~ReservationsApi`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/OnibusExpress.Api
git commit -m "feat: expose bus API controllers"
```

### Task 3: Add EF migration and verify the app builds

**Files:**
- Create: `backend/src/OnibusExpress.Infrastructure/Migrations/20260615000000_InitialCreate.cs`
- Create: `backend/src/OnibusExpress.Infrastructure/Migrations/OnibusExpressDbContextModelSnapshot.cs`

- [ ] **Step 1: Write the failing test**

Run the app or tests against a fresh SQLite database and confirm `Database.MigrateAsync()` fails until the initial migration exists.

- [ ] **Step 2: Run test to verify it fails**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~Integration`

Expected: startup/migration failure on a clean database before migration files are added.

- [ ] **Step 3: Write minimal implementation**

Add the initial EF migration and model snapshot reflecting the current domain model.

- [ ] **Step 4: Run test to verify it passes**

Run: `DOTNET_ROLL_FORWARD=Major /usr/local/share/dotnet/dotnet test backend/tests/OnibusExpress.Tests/OnibusExpress.Tests.csproj --filter FullyQualifiedName~Integration`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/OnibusExpress.Infrastructure
git commit -m "feat: add initial database migration"
```
