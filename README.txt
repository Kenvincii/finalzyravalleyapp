ZYRA WEBSITE + APP + AI (Cloudflare Pages edition)

PROJECT CONTENTS
- index.html: complete Zyra website and Lab
- assets/: images and videos
- icons/, manifest.json: installable app assets
- functions/api/chat.js: Cloudflare Pages Function for POST /api/chat

DEPLOY TO CLOUDFLARE PAGES (Git integration)
1. Put the contents of this ZIP in the ROOT of your GitHub repository.
   index.html must be at the repository root, not inside another nested folder.
2. In Cloudflare, create a Pages project using Workers & Pages > Create application > Pages > Connect to Git.
3. Select the GitHub repository and branch.
4. For a plain HTML site, choose no framework preset, leave the build command empty, and set the build output directory to "." (the repository root).
5. Do not use `npx wrangler deploy` as the Pages build/deploy command. Use the Pages Git integration deployment flow.
6. Deploy. The `functions/` folder must be at the repository root so Cloudflare detects the `/api/chat` function.

AI KEY SETUP
1. Create an API key in your Anthropic Console.
2. In Cloudflare, open the Pages project > Settings > Variables and Secrets.
3. Add a secret named ANTHROPIC_API_KEY and paste the key as its value.
4. Save and trigger a new deployment so the Function receives the secret.
5. Never put the API key in index.html, script.js, GitHub, or this ZIP.

The AI endpoint uses Claude Haiku 5.5. Anthropic account/API access and billing must be active.
The static website and Lab simulations do not need the AI key. Eve's live chat does.

IMPORTANT ABOUT THE CURRENT CLONING ERROR
A "Failed: error occurred while fetching repository" error happens before Cloudflare builds this project.
This ZIP fixes project compatibility, but it cannot repair GitHub authorization or repository-fetch access.
If cloning still fails, reconnect/authorize the GitHub integration and confirm Cloudflare has access to the selected repository.

LOCAL TESTING
The site can be previewed as static HTML, but the AI function requires Cloudflare Pages Functions or a compatible local Pages dev environment.
