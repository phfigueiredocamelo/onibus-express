# OniBus Express Design

Date: 2026-06-12

## Goal

Build a full-stack MVP for the OniBus Express technical challenge. The project will include a .NET 8 backend, a React 18 frontend, Docker Compose, automated tests, Swagger documentation, seed data, and a clear README.

The implementation will prioritize a complete and reliable reservation flow over extra features. Payment processing is out of scope for this MVP.

## Scope

In scope:

- Search bus trips by origin, destination, and departure date.
- View trip details and seat availability.
- Select an available seat.
- Enter passenger data and create a reservation.
- Validate CPF on backend and frontend.
- Consult a reservation by code.
- Cancel a reservation when the business rule allows it.
- Run the full system with Docker Compose.
- Run backend and frontend tests locally.

Out of scope:

- Real or simulated payment.
- Admin screens for managing routes and trips.
- User authentication.
- Seat holds or expiring pending reservations.
- Production deployment configuration.

## Repository Structure

The repository will follow the challenge's suggested full-stack structure:

```text
onibus-express/
  backend/
    src/OnibusExpress.Api/
    src/OnibusExpress.Application/
    src/OnibusExpress.Domain/
    src/OnibusExpress.Infrastructure/
    tests/OnibusExpress.Tests/
    Dockerfile
  frontend/
    src/
    Dockerfile
  docker-compose.yml
  README.md
```

## Backend Architecture

The backend will be an ASP.NET Core Web API on .NET 8. It will use a layered structure:

- `OnibusExpress.Domain`: entities, value objects, enums, and core business rules.
- `OnibusExpress.Application`: use cases, DTOs, validators, and service interfaces.
- `OnibusExpress.Infrastructure`: Entity Framework Core, PostgreSQL configuration, migrations, seed data, repositories, and code-generation persistence checks.
- `OnibusExpress.Api`: controllers, dependency injection, Swagger, CORS, error handling, and startup behavior.

Entity Framework Core will use PostgreSQL for the running app. Tests that need persistence will use SQLite in-memory to keep the suite fast and simple.

## Domain Model

`Route`:

- Origin.
- Destination.
- Estimated duration.

`Trip`:

- Associated route.
- Departure date and time.
- Base price.
- Total seats.
- Reservations.

Available seats will be derived from active reservations instead of stored as a mutable counter.

`Passenger`:

- Full name.
- CPF.
- Email.
- Birth date stored as a nullable backend field for alignment with the challenge entity list.

The frontend MVP will collect only full name, CPF, and email, matching the required frontend form.

`Reservation`:

- Trip.
- Passenger snapshot.
- Seat number.
- Status: `Active` or `Cancelled`.
- Unique readable reservation code, using a format such as `ONB-48291`.

## API Contract

The API will expose the required endpoints:

```text
GET    /rotas
GET    /viagens?origem=&destino=&data=
GET    /viagens/{id}
POST   /reservas
GET    /reservas/{codigo}
DELETE /reservas/{codigo}
```

Behavior:

- `GET /rotas` returns seeded routes.
- `GET /viagens` returns future trips matching origin, destination, and the requested date.
- `GET /viagens/{id}` returns route, departure, price, and seat map status.
- `POST /reservas` validates CPF, trip date, seat availability, and creates an active reservation.
- `GET /reservas/{codigo}` returns reservation details.
- `DELETE /reservas/{codigo}` cancels only active reservations with departure more than 2 hours away.

Errors will use consistent problem-style JSON with clear Portuguese messages.

Double booking will be prevented in two layers:

- Application validation before creating a reservation.
- A database uniqueness rule that prevents more than one active reservation for the same trip and seat.

## Frontend Architecture

The frontend will be React 18 with TypeScript and Vite. It will use React Router for explicit screens and routes.

The UI will use Tailwind CSS v4 and selected Untitled UI React components copied into the project. Only the components needed for the MVP will be versioned, such as buttons, inputs, selects, alerts, empty states, loading indicators, page headers, progress steps or tabs, and badges.

API access will go through typed service modules so components remain focused on user behavior and tests can mock requests cleanly.

Checkout state will be stored in a small React context. If a user opens checkout without a selected trip and seat, the app will redirect back to the search screen.

## Frontend Routes And Screens

`/` and `/buscar`:

- Search form with origin, destination, and departure date.
- Search button.
- Loading state.
- Trip results with price, departure time, and remaining seats.
- Empty state when no trips are found.

`/viagens/:id/assentos`:

- Visual bus seat map.
- Seat states: free, occupied, selected.
- Occupied seats disabled.
- Trip summary with route, departure date/time, and price.
- Continue action requiring a selected seat.

`/checkout`:

- Passenger form with full name, CPF, and email.
- Frontend validation for required fields, CPF format/check digits, and email format.
- Reservation summary before confirmation.
- API submission to create the reservation.

`/reservas/sucesso/:codigo`:

- Success state with the reservation code.
- Reservation details fetched from the API.
- Clear next action to search again or consult reservations.

`/reservas`:

- Bonus reservation lookup screen.
- Field for reservation code.
- Reservation details when found.
- Cancel action when allowed by the backend.
- Clear feedback for cancelled, not found, and cancellation-denied states.

The UI should feel like a practical transport booking product: responsive, scannable, accessible, and direct. It should open into the booking experience rather than a marketing landing page.

## Seed Data

The app will include curated demo data:

- A small set of Brazilian city routes.
- Several future trips.
- Total seat counts suitable for a simple bus seat map.
- A few active reservations to demonstrate occupied seats.

Seeded trip dates will be generated relative to startup time, so the demo remains useful after the delivery date.

## Docker And Runtime

`docker-compose up --build` will start:

- `postgres`: relational database.
- `api`: ASP.NET Core Web API.
- `frontend`: production-served React app using Nginx.

The API will apply migrations and seed demo data on startup. CORS will allow the frontend container to call the API in the local Compose environment.

## Testing Strategy

Backend tests with xUnit:

- CPF validation for valid and invalid values.
- Seat already occupied rule.
- Reservation blocked for trips already in the past.
- Cancellation allowed more than 2 hours before departure.
- Cancellation blocked within 2 hours of departure.
- Unique reservation code generation.
- At least one integration flow for creating and consulting a reservation with SQLite in-memory.

Frontend tests with Vitest and React Testing Library:

- Search screen fills fields, submits, and displays mocked results.
- Seat map allows selecting free seats and blocks occupied seats.
- Passenger form validates required fields, CPF, and email.
- Reservation lookup shows details and supports cancellation feedback.

Tests will focus on user-visible behavior rather than implementation details.

## README Requirements

The README will include:

- How to run with Docker Compose.
- How to run backend and frontend locally without Docker.
- How to run tests.
- Technologies and why they were chosen.
- Relevant architecture decisions.
- Implemented scope and out-of-scope items.
- Endpoint documentation or Swagger link.
- Future improvements.
- Screenshots of the main application flow.

## Success Criteria

The project is successful when:

- A reviewer can run the full system with one Docker Compose command.
- The seeded data supports a complete reservation flow immediately.
- The frontend includes all required screens as routed pages.
- The backend enforces the required business rules.
- The required tests pass.
- Swagger and README make the implementation easy to evaluate.
