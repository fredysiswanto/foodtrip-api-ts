# 🚀 FoodTrip API TypeScript

## 🌟 Introduction

Welcome to FoodTrip API TypeScript — a lightweight, production-ready backend built with Express.js and TypeScript.

This project includes health checks, user routes, request validation, Swagger API docs, error handling, logging, and test coverage.

## 💡 Why We Made This

This starter kit helps you:

- ✨ Start new projects faster
- 📊 Write clean, consistent code
- ⚡ Build things quickly
- 🛡️ Follow best practices for security and testing

## 🚀 What's Included

- 📁 Well-organized folders: Files grouped by feature so you can find things easily
- 💨 Fast development: Quick code running with `tsx` and error checking with `tsc`
- 🌐 Latest Node.js: Uses the newest stable Node.js version from `.tool-versions`
- 🔧 Safe settings: Environment settings checked with Zod to prevent errors
- 🔗 Short import paths: Clean code with easy imports using path shortcuts
- 🔄 Auto-updates: Keeps dependencies up-to-date with Renovate
- 🔒 Better security: Built-in protection with Helmet and CORS settings
- 📊 Easy tracking: Built-in logging with `pino-http`
- 🧪 Ready-to-test: Testing tools with Vitest and Supertest already set up
- ✅ Clean code: Consistent coding style with `Biomejs`
- 📃 Standard responses: Unified API responses using `ServiceResponse`
- 🐳 Easy deployment: Ready for Docker containers
- 📝 Input checking: Request validation using Zod
- 🧩 API browser: Interactive API docs with Swagger UI

## 🛠️ Getting Started

### Video Demo

For a visual guide, watch the [video demo](https://github.com/user-attachments/assets/b1698dac-d582-45a0-8d61-31131732b74e) to see the setup and running of the project.

### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone <YOUR_REPO_URL>`
- Navigate: `cd foodtrip-api-ts`
- Install dependencies: `pnpm install`

#### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `pnpm start:dev`
- Building: `pnpm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`

## 🚀 Production Deployment

This project supports a release-based deployment flow to a VPS at `/home/ubuntu/foodtrip-api-ts`.

The GitHub Actions workflow now builds a release artifact, uploads it to the VPS, extracts it into `releases/<timestamp>`, updates the `current` symlink, runs `pnpm prisma migrate deploy`, and reloads the app with PM2.

The workflow uses `appleboy/scp-action` and `appleboy/ssh-action` to transfer files and execute the remote deploy script.

Deployment only runs on `master` branch pushes.

### GitHub Actions secrets

- `VPS_HOST`
- `VPS_USER`
- `VPS_PRIVATE_KEY`
- `VPS_SSH_PORT` (optional, default `22`)

### Server layout

- `/home/ubuntu/foodtrip-api-ts/releases/` — each deployed release
- `/home/ubuntu/foodtrip-api-ts/current` — symlink ke release aktif
- `/home/ubuntu/foodtrip-api-ts/shared/.env` — environment variables runtime
- `/home/ubuntu/foodtrip-api-ts/shared/logs/` — PM2 logs
- `/home/ubuntu/foodtrip-api-ts/shared/public/uploads/` — file upload persisten

This repository also contains helper scripts for server-side deployment:
- `scripts/deploy.sh` — deploy new release artifact on VPS
- `scripts/rollback.sh` — switch `current` back to a previous release and reload PM2

### Server requirements

- `pnpm` tersedia secara global
- `pm2` tersedia secara global
- `shared/.env` sudah dibuat sebelum deploy pertama

## 📘 Documentation

Detailed project documentation is available in the `docs/` folder:

- `docs/README.md` — project overview and API reference
- `docs/DEVELOPER_GUIDE.md` — developer setup, project structure, and extension guide

## 🤝 Feedback and Contributions

We'd love to hear your feedback and suggestions for further improvements. Feel free to contribute and join us in making backend development cleaner and faster!

🎉 Happy coding!

## 📁 Folder Structure

```code
├── biome.json
├── Dockerfile
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── src
│   ├── api
│   │   ├── healthCheck
│   │   │   ├── __tests__
│   │   │   │   └── healthCheckRouter.test.ts
│   │   │   └── healthCheckRouter.ts
│   │   └── user
│   │       ├── __tests__
│   │       │   ├── userRouter.test.ts
│   │       │   └── userService.test.ts
│   │       ├── userController.ts
│   │       ├── userModel.ts
│   │       ├── userRepository.ts
│   │       ├── userRouter.ts
│   │       └── userService.ts
│   ├── api-docs
│   │   ├── __tests__
│   │   │   └── openAPIRouter.test.ts
│   │   ├── openAPIDocumentGenerator.ts
│   │   ├── openAPIResponseBuilders.ts
│   │   └── openAPIRouter.ts
│   ├── common
│   │   ├── __tests__
│   │   │   ├── errorHandler.test.ts
│   │   │   └── requestLogger.test.ts
│   │   ├── middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── requestLogger.ts
│   │   ├── models
│   │   │   └── serviceResponse.ts
│   │   └── utils
│   │       ├── commonValidation.ts
│   │       ├── envConfig.ts
│   │       └── httpHandlers.ts
│   ├── index.ts
│   └── server.ts
├── tsconfig.json
└── vite.config.mts
```



### User Demo
| Role | Username |Pass |
|---|---|---|
| Customer | customer@example.com | Password123! |
| Staff | staff@example.com | Password123! |
| Owner | owner@example.com | Password123! |
| Admin | admin@example.com | Password123! |

### Link Swagger 
[API DOCS](https://foodtrip-api-v2.panduanqa.blog/docs/)

note : 
i'm using this [source](https://github.com/edwinhern/express-typescript) template for my project  