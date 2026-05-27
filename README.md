# TalentServ AI Hackathon — Group 10 UI

React SPA built with Vite, TypeScript, Auth0, and React Router.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain |
| `VITE_AUTH0_CLIENT_ID` | SPA client ID |
| `VITE_AUTH0_AUDIENCE` | Auth0 API identifier |
| `VITE_API_BASE_URL` | Backend base URL |

## Vercel deployment

1. Import the repo and set the root directory to `talentserv-ai-hackathon-group-10-ui`.
2. Add the environment variables above (use your Railway backend URL for `VITE_API_BASE_URL`).
3. In Auth0 SPA settings, add your Vercel URL to:
   - Allowed Callback URLs
   - Allowed Logout URLs
   - Allowed Web Origins

Build command: `npm run build`  
Output directory: `dist`
