# Tensaw Skills Studio UI

Tensaw Skills Studio UI is the frontend React web application designed for visually building, managing, and debugging autonomous workflow skills. It provides an intuitive canvas interface powered by React Flow for complex node-based orchestration.

## 🚀 Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Graph Engine:** React Flow (`@xyflow/react`)
- **UI Library:** Ant Design
- **Networking:** Axios
- **Icons:** Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- `npm` (Node Package Manager)

## ⚙️ Environment Variables

The project uses Vite's environment system (`VITE_*`) to handle configurations across Local, Staging, and Production deployments. 

You must define these variables for the application to properly route API requests and find static assets like logos.

| Variable | Description |
|---|---|
| `VITE_ENV_NAME` | The name of the environment (e.g., `local`, `staging`, `production`) |
| `VITE_API_URL` | The base URL for the backend API |
| `VITE_IMAGE_BASE_URL` | The domain/bucket URL where static images are hosted |

### Example Local `.env`
```properties
VITE_ENV_NAME=local
VITE_API_URL=http://127.0.0.1:8000
VITE_IMAGE_BASE_URL=
```

## 🛠️ Quick Start

Install project dependencies:
```bash
npm install
```

### Running Locally
To spin up the development server pointing to your local `.env`:
```bash
npm run dev
```

### Running Staging Locally
To run the local UI but point your API requests specifically to the Trillium Health staging backend (using `.env.staging`):
```bash
npm run dev:staging
```

## 📦 Building for Production

When you are ready to prepare the interface for deployment, run the corresponding build command. This compiles the TypeScript and produces a minified bundle in the `/dist` directory.

```bash
# Build using standard production env
npm run build:production

# Build using staging env
npm run build:staging
```

## 📁 Project Architecture

```
src/
├── components/       # Reusable UI components (Modals, Cards, etc.)
├── contexts/         # Global React context providers (Execution state, etc.)
├── layouts/          # Structural page wrappers (Sidebar, Headers)
├── pages/            # Top-level Page components (Login, Canvas View)
├── services/         # Axios API clients and endpoint configurations
├── constants/        # Centralized Enums, Static Mapping, and UI rules
└── interfaces/       # Global TypeScript Types & Interfaces
```