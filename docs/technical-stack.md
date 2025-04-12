# Technical Stack

This document provides an overview of the technologies used in the PM Restaurant project.

## Technology Overview

```mermaid
graph TD
    A[PM Restaurant System] --> B[Frontend]
    A --> C[Backend]
    A --> D[Database]
    A --> E[Deployment]

    B --> B1[Next.js 15.2.4]
    B --> B2[React 19.0.0]
    B --> B3[Material UI 7.0.1]
    B --> B4[TailwindCSS 4.x]
    B --> B5[React Hook Form]

    C --> C1[Next.js API Routes]
    C --> C2[Prisma ORM]
    C --> C3[NextAuth.js]

    D --> D1[MySQL]

    E --> E1[Docker]
    E --> E2[Docker Compose]
    E --> E3[AWS EC2]
    E --> E4[Nginx]
```

## Frontend

| Technology         | Version | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| Next.js            | 15.2.4  | React framework with App Router                      |
| React              | 19.0.0  | UI library                                           |
| Material UI        | 7.0.1   | React component library implementing Material Design |
| TailwindCSS        | 4.x     | Utility-first CSS framework                          |
| React Hook Form    | 7.55.0  | Form validation and handling                         |
| TypeScript         | 5.x     | Static typing for JavaScript                         |
| Day.js             | 1.11.10 | Date manipulation library                            |
| Notistack          | 3.0.2   | Notification system                                  |
| Lucide React       | 0.487.0 | Icon library                                         |
| MUI X Date Pickers | 6.19.7  | Date and time picker components                      |

## Backend

| Technology         | Version | Description              |
| ------------------ | ------- | ------------------------ |
| Next.js API Routes | 15.2.4  | RESTful API endpoints    |
| Prisma             | 6.5.0   | ORM for database access  |
| NextAuth.js        | 4.24.11 | Authentication system    |
| bcryptjs           | 3.0.2   | Password hashing         |
| JSON Web Token     | 9.0.2   | JWT implementation       |
| MySQL2             | 3.14.0  | MySQL client for Node.js |

## Database

| Technology        | Version | Description                        |
| ----------------- | ------- | ---------------------------------- |
| MySQL             | 8.x     | Relational database                |
| Prisma Schema     | 6.5.0   | Database schema definition         |
| Prisma Migrations | 6.5.0   | Database versioning and migrations |

## Development Tools

| Technology | Version | Description                      |
| ---------- | ------- | -------------------------------- |
| ESLint     | 9.x     | JavaScript/TypeScript linter     |
| TypeScript | 5.x     | JavaScript type checking         |
| ts-node    | 10.9.2  | TypeScript execution environment |
| npm        | 11.2.0  | Package manager                  |

## Deployment Infrastructure

| Technology     | Version | Description                   |
| -------------- | ------- | ----------------------------- |
| Docker         | Latest  | Container platform            |
| Docker Compose | Latest  | Multi-container orchestration |
| AWS EC2        | N/A     | Cloud hosting                 |
| Nginx          | Latest  | Web server and reverse proxy  |

## System Architecture

```mermaid
flowchart TD
    Client[Client Browser/Device]

    subgraph AWS["AWS EC2 Instance"]
        subgraph Docker["Docker Environment"]
            Nginx[Nginx]
            NextApp[Next.js App]
            MySQL[(MySQL Database)]
        end
    end

    Client <--> Nginx
    Nginx <--> NextApp
    NextApp <--> MySQL

    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Nginx fill:#A3E4D7,stroke:#333,stroke-width:2px
    style NextApp fill:#D5F5E3,stroke:#333,stroke-width:2px
    style MySQL fill:#D6EAF8,stroke:#333,stroke-width:2px
    style Docker fill:#F8F9F9,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style AWS fill:#F5EEF8,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
```

## Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Client as Browser
    participant NextApp as Next.js App
    participant API as API Routes
    participant Auth as NextAuth.js
    participant Prisma as Prisma ORM
    participant DB as MySQL Database

    User->>Client: Interacts with UI

    %% Authentication Flow
    alt Authentication
        Client->>API: Login Request
        API->>Auth: Authenticate User
        Auth->>Prisma: Verify Credentials
        Prisma->>DB: Query User Data
        DB-->>Prisma: Return User Data
        Prisma-->>Auth: User Data
        Auth-->>API: Session Token
        API-->>Client: Authentication Response
    end

    %% Data Fetching Flow
    alt Data Fetching
        Client->>API: Request Data
        API->>Auth: Verify Session
        Auth-->>API: Session Valid
        API->>Prisma: Query Data
        Prisma->>DB: Execute Query
        DB-->>Prisma: Return Results
        Prisma-->>API: Processed Data
        API-->>Client: Response Data
        Client-->>User: Display Data
    end

    %% Data Mutation Flow
    alt Data Mutation
        User->>Client: Submit Form
        Client->>API: Create/Update Request
        API->>Auth: Verify Session & Permissions
        Auth-->>API: Authorization Result
        API->>Prisma: Execute Mutation
        Prisma->>DB: Update Database
        DB-->>Prisma: Confirm Update
        Prisma-->>API: Operation Result
        API-->>Client: Response
        Client-->>User: Show Confirmation
    end
```

## Key Dependencies in package.json

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^2.8.0",
    "@emotion/cache": "^11.14.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@hookform/resolvers": "^5.0.1",
    "@mui/icons-material": "^7.0.1",
    "@mui/material": "^7.0.1",
    "@mui/material-nextjs": "^7.0.0",
    "@mui/x-date-pickers": "^6.19.7",
    "@prisma/client": "^6.5.0",
    "@radix-ui/react-slot": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dayjs": "^1.11.10",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.487.0",
    "mysql2": "^3.14.0",
    "next": "15.2.4",
    "next-auth": "^4.24.11",
    "notistack": "^3.0.2",
    "prisma": "^6.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^3.1.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^3.0.0",
    "bcryptjs": "^3.0.2",
    "eslint": "^9",
    "eslint-config-next": "15.2.4",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

## Notes on Technology Choices

- **Next.js**: Used for both frontend and backend functionality, enabling server-side rendering and API routes in a single codebase.
- **Material UI**: Provides a comprehensive set of pre-styled components that follow Material Design guidelines.
- **Prisma**: Modern ORM that simplifies database operations with type safety and migrations.
- **Docker**: Ensures consistent environments across development and production.
- **NextAuth.js**: Provides authentication with multiple providers and session management.
- **TypeScript**: Adds static typing to improve code quality and developer experience.
- **TailwindCSS**: Complements Material UI by providing utility classes for custom styling.
