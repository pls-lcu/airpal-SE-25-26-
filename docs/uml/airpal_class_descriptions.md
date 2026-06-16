# AirPal — Class Descriptions

---

## Domain: Identity & Access Management

### `User` *(abstract)*
Central abstract class representing any authenticated actor in the system. Holds credentials shared by all user types.

| Element | Detail |
|---|---|
| `username` | Unique display name |
| `name` | User's first name — required at registration (FR2) |
| `surname` | User's last name — required at registration (FR2) |
| `email` | Used for login and notifications |
| `password` | Stored as a hash |
| `login()` | Validates credentials, issues session token — UC02 |
| `logout()` | Invalidates session — UC03 |
| `resetPassword()` | Triggers reset email flow — UC04 |
| `deleteAccount()` | Soft-deletes the account — UC05 |

---

### `Passenger` *(extends User)*
Represents a traveller who books flights and uses self-service features.

| Element | Detail |
|---|---|
| `passportNo` | Required for check-in validation |
| `register()` | Creates a new account with email verification — UC01 |
| `accessDashboard()` | Loads personal area with bookings and check-in status — UC12 |

---

### `AirportStaff` *(abstract, extends User)*
Abstract base for all employees working for the airport itself (as opposed to an airline). Distinguishes airport-side staff from airline-side staff and from passengers at the model level.

| Element | Detail |
|---|---|
| `employeeID` | Unique staff identifier |
| `role` | Concrete role label (e.g. "GroundManager") |
| `performAssignedTask()` | Generic entry point for role-specific operations |

---

### `AirlineStaff` *(abstract, extends User)*
Abstract base for all employees working for an airline rather than the airport. Kept separate from `AirportStaff` since airline employees are not airport personnel.

| Element | Detail |
|---|---|
| `employeeID` | Unique staff identifier |
| `role` | Concrete role label (e.g. "AirlineManager") |
| `performAssignedTask()` | Generic entry point for role-specific operations |

---

### `AirportAdministrator` *(extends AirportStaff)*
Oversees airport-level operations including schedules, customer support, user management, and system feedback.

| Element | Detail |
|---|---|
| `createWorkerAccount()` | Creates accounts for new staff members — UC25 |
| `receiveBugReport()` | Receives and reviews submitted bug tickets — UC16 |
| `updateSchedule()` | Applies changes to the flight schedule — UC23 |
| `receiveCustomerSupportTicket()` | Handles support issues escalated from passengers — UC17 |

---

### `GroundManager` *(extends AirportStaff)*
Coordinates ground operations and passenger assistance on the airport floor.

| Element | Detail |
|---|---|
| `receiveLostItemReport()` | Receives and processes lost item submissions — UC14 |
| `receiveAssistanceRequest()` | Manages special assistance needs — UC15 |
| `assignStaff()` | Assigns ground staff to shifts and tasks — UC24 |

---

### `GroundStaff` *(extends AirportStaff)*
Represents general airport ground personnel who carry out tasks assigned by the Ground Manager (e.g. baggage handling, gate support, passenger assistance).

| Element | Detail |
|---|---|
| `performAssignedTask()` | Carries out the task assigned via shift assignment — UC24 |

---

### `AirlineManager` *(extends AirlineStaff)*
Represents the airline-side manager responsible for scheduling and crew.

| Element | Detail |
|---|---|
| `submitFlightSchedule()` | Sends a new schedule to the airport system — UC18 |
| `assignCrew()` | Assigns flight crew members to scheduled flights — UC21 |

---

### `FlightCrew` *(extends AirlineStaff)*
Represents flight crew members (pilots, cabin crew) assigned to a specific flight by the Airline Manager.

| Element | Detail |
|---|---|
| `performAssignedTask()` | Carries out duties for the assigned flight — UC21 |

**Relationships:**
- Association with `Flight` (`0..* — 0..*`, role `assignedCrew`) — a flight crew member can be assigned to multiple flights over time, and a flight has multiple crew members

---

## Domain: Aviation Operations

### `Flight`
Core entity representing a single scheduled flight.

| Element | Detail |
|---|---|
| `flightNo` | Unique IATA/ICAO flight identifier |
| `origin` | Departure airport code |
| `destination` | Arrival airport code |
| `departureTime` | Scheduled departure datetime |
| `arrivalTime` | Scheduled arrival datetime |
| `type` | Passenger or cargo |
| `search()` | Supports flight lookup by route and date — UC06 |
| `updateStatus()` | Updates delay, cancellation, or on-time status — UC26 |
| `assignGate()` | Links the flight to a gate — UC22 |
| `assignCrew()` | Links crew members to the flight — UC21 |

**Relationships:**
- Composition with `Schedule` (1 to 1) — a schedule belongs entirely to its flight
- Aggregation with `Aircraft` (1 to 0..1) — an aircraft can exist independently of a specific flight
- Aggregation with `Gate` (1 to 0..1) — a gate can exist without a flight assigned

---

### `Schedule`
Holds the operational status of a flight's timing plan.

| Element | Detail |
|---|---|
| `status` | e.g. On Time, Delayed, Cancelled |
| `updateStatus()` | Modifies the current status — UC23 |
| `compareWithNewSchedule()` | Checks compatibility with an incoming airline schedule — UC18 |

---

### `Aircraft`
Represents a physical aircraft registered in the system.

| Element | Detail |
|---|---|
| `tailNumber` | Unique registration identifier |
| `updateStatus()` | Marks aircraft as available, in-service, or under maintenance — UC26 |

---

### `Gate`
A physical departure or arrival gate at the airport.

| Element | Detail |
|---|---|
| `gateID` | Gate label (e.g. "B12") |
| `terminal` | Terminal containing this gate |
| `assignToFlight()` | Associates the gate with a specific flight — UC22 |

---

## Domain: Commerce & Logistics

### `Booking`
The top-level record of a passenger's reservation. Owns all tickets and cargo shipments made in a single transaction.

| Element | Detail |
|---|---|
| `bookingRef` | Unique reference code sent to the passenger |
| `totalPrice` | Sum of all tickets and shipments in the booking |
| `status` | e.g. Confirmed, Modified, Cancelled |
| `create()` | Initiates a new booking — UC07, UC13 |
| `modify()` | Updates seats, luggage, or cargo — UC08 |
| `cancel()` | Cancels the booking with optional refund — UC08 |

**Relationships:**
- Composition with `Ticket` (1 to 0..*) — tickets cannot exist without a booking
- Composition with `CargoShipment` (1 to 0..*) — shipments cannot exist without a booking

---

### `Ticket`
Represents one passenger seat within a booking.

| Element | Detail |
|---|---|
| `seatNumber` | Assigned seat on the aircraft |
| `generateBoardingPass()` | Produces a digital boarding pass — UC09 |
| `checkIn()` | Marks the passenger as checked in — UC09 |

**Relationships:**
- Composition with `Baggage` (1 to 0..*) — baggage tags are created as part of a ticket

---

### `CargoShipment`
Represents a cargo booking on a flight.

| Element | Detail |
|---|---|
| `shipmentID` | Unique cargo reference |
| `weight` | Declared weight in kg |
| `create()` | Registers a new cargo booking — UC13 |
| `updatePricing()` | Reflects changes from the airline pricing engine — UC20 |

---

### `Baggage`
Represents a single piece of checked luggage tied to a ticket.

| Element | Detail |
|---|---|
| `tagID` | Unique baggage tag scanned at the carousel |
| `findCarousel()` | Returns the assigned baggage carousel for a flight — UC11 |

---

## Domain: Monitoring & Boundaries

### `BugReport`
Created when a user reports a technical issue with the system.

| Element | Detail |
|---|---|
| `bugID` | Auto-generated report identifier |
| `description` | User-submitted description of the issue |
| `create()` | Submits the report and notifies AirportAdministrator — UC16 |

---

### `CustomerSupportTicket`
Created when a passenger contacts airport support for a non-technical issue.

| Element | Detail |
|---|---|
| `ticketID` | Auto-generated ticket identifier |
| `description` | Nature of the support request |
| `create()` | Logs the request and notifies AirportAdministrator — UC17 |

---

### `AssistanceRequest`
Created by a passenger requiring special assistance (e.g. wheelchair, dietary needs).

| Element | Detail |
|---|---|
| `requestID` | Auto-generated request identifier |
| `type` | Category of assistance required |
| `create()` | Submits the request and notifies GroundManager — UC15 |

---

### `LostItemReport`
Filed when a passenger reports a lost item at the airport.

| Element | Detail |
|---|---|
| `reportID` | Auto-generated report identifier |
| `description` | Description of the lost item and flight details |
| `create()` | Validates passenger-flight match and notifies GroundManager — UC14 |

---

### `WeatherData`
Aggregates weather information from external and in-house sources.

| Element | Detail |
|---|---|
| `localConditions` | Data from the in-house weather station |
| `regionalConditions` | Data from the external weather API provider |
| `update()` | Saves new weather data from either source — UC27 |
| `notifyIfCritical()` | Triggers alerts to AirportAdministrator when conditions are severe — UC27 |

---

## Root Class

### `AirPal`
The system entry point. Aggregates the top-level operational entities.

| Element | Detail |
|---|---|
| `airportName` | Name of the airport running the system |
| `icaoCode` | Airport ICAO code |
| `run()` | System initialisation |

**Relationships:**
- Aggregation with `Flight` — flights exist independently of the system instance
- Aggregation with `Booking` — bookings exist independently of the system instance
