```
# troubleshoot:
https://copilot.microsoft.com/shares/xj2SYehntHQh1y3ABYvYb
```

LibreChat can be installed on Ubuntu 24.04 most reliably with Docker Compose, then configured to use OpenRouter.ai as a custom OpenAI-compatible endpoint via the `librechat.yaml` configuration.  The outline below assumes a fresh Ubuntu 24.04 server and ends with LibreChat running on a browser, talking to OpenRouter models.[1][2][3][4]

***

## Overview and prerequisites

LibreChat is an open‑source ChatGPT‑style web UI that lets you connect multiple AI providers (OpenAI, Anthropic, OpenRouter, local models, etc.) through a single interface.  The maintainers recommend Docker Compose because it bundles LibreChat, MongoDB, MeiliSearch, and the RAG/vector components into one reproducible deployment.[5][6][4][1]

Before starting on Ubuntu 24.04, ensure:

- A non‑root user with `sudo` privileges and basic firewall access to ports 80/443 or 3080 (LibreChat’s default internal port varies with configuration).[6][2]
- A working Docker Engine and Docker Compose plugin (or `docker compose` integrated into Docker).[2][1]

***

## Step 1 – Install system dependencies on Ubuntu 24.04

On a fresh Ubuntu 24.04 system, install Git and Docker:

1. Update packages and install Git:

   ```bash
   sudo apt update
   sudo apt install -y git ca-certificates curl gnupg
   ```
   Git is required to clone the LibreChat repository.[7][2]

2. Install Docker Engine using the official repository (recommended for current Docker on 24.04):

   - Add Docker’s GPG key and repo (if not already configured), following the Docker docs for Ubuntu 24.04.[6]
   - Install Docker packages:

     ```bash
     sudo apt update
     sudo apt install -y docker-ce docker-ce-cli containerd.io
     ```

   Docker is required to run LibreChat and its supporting services as containers.[4][2]

3. Enable and test Docker:

   ```bash
   sudo systemctl enable --now docker
   sudo docker run --rm hello-world
   ```

   This confirms Docker is installed correctly and can pull images from Docker Hub.[2][6]

4. Install the Docker Compose plugin if `docker compose` is not present:

   - On recent Docker, `docker compose` is included; verify with:

     ```bash
     docker compose version
     ```

   If missing, install `docker-compose-plugin` from Ubuntu’s repo:

   ```bash
   sudo apt install -y docker-compose-plugin
   ```

   LibreChat’s docs use `docker compose up -d` with the plugin‑style syntax.[1][4]

***

## Step 2 – Clone the LibreChat repository

1. Choose a directory (for example `/opt`), then clone the official repo:

   ```bash
   cd /opt
   sudo git clone https://github.com/danny-avila/LibreChat.git
   sudo chown -R "$USER":"$USER" LibreChat
   cd LibreChat
   ```

   The repo contains `docker-compose.yml`, `.env.example`, and optional `librechat.yaml` used for configuration.[8][1][2]

2. Optionally check out a tagged release for stability (example):

   ```bash
   git tag --list
   git checkout <latest_stable_tag>
   ```

   The project recommends watching the releases page for breaking changes.[5][4]

***

## Step 3 – Prepare the `.env` configuration

LibreChat uses a `.env` file (copied from `.env.example`) to configure core environment variables such as UID/GID, ports, database settings, and certain feature flags.[9][1]

1. Create `.env` from the example:

   ```bash
   cd /opt/LibreChat
   cp .env.example .env
   ```

2. Edit `.env` with a text editor:

   ```bash
   nano .env
   ```

   At minimum on Ubuntu 24.04:

   - Ensure `UID` and `GID` match your user (typically 1000/1000 on a single‑user system):

     ```env
     UID=1000
     GID=1000
     ```

     This avoids permission issues between host files and containers.[9][2]

   - Confirm the external web port if exposed via `docker-compose.yml` (often `3080:3080` or `3000:3000` depending on the version).[6][2]
   - If you have any global provider keys (like OpenAI or Google), you can set them now; otherwise, you can configure providers later through the UI.[7][1]

   Save and exit when done.

***

## Step 4 – Start LibreChat using Docker Compose

With `.env` in place, Docker Compose can bring up the full stack: LibreChat backend/frontend, MongoDB, MeiliSearch, and RAG/vector services.[4][2]

1. Start all services in detached mode:

   ```bash
   cd /opt/LibreChat
   docker compose up -d
   ```

   The docs highlight this as the main step to run the app locally.[1][2]

2. Check status:

   ```bash
   docker compose ps
   docker compose logs -f
   ```

   All core services (e.g. `api`, `client`, `mongodb`, `meilisearch`) should be healthy or running.[2][6]

3. Access the web UI in a browser:

   - From the same machine: `http://localhost:3080` or whichever host port is mapped.[4][1]
   - From another device: `http://<server-ip>:<port>` (ensure firewall allows that port).[8][6]

4. Complete any on‑screen initial setup (account creation, etc.) if prompted. LibreChat supports multi‑user authentication and can use email/OAuth/LDAP when configured.[5][4]

***

## Step 5 – Understand provider configuration options

LibreChat supports two broad ways to configure AI providers: environment variables and a structured YAML config file (`librechat.yaml`).[1][4]

- The `.env` file is primarily for system/environment settings and some provider keys.[7][9]
- `librechat.yaml` unlocks richer per‑endpoint configuration (custom endpoints, rate limits, default models, etc.), including defining OpenRouter as a custom OpenAI‑compatible endpoint.[3][4]

The docs point to a “Configuring a Custom Endpoint” section for services like OpenRouter, DeepSeek, Mistral, Groq, etc., all of which use the same pattern.[4][1]

***

## Step 6 – Create `librechat.yaml` for OpenRouter

OpenRouter is supported as a custom OpenAI‑compatible endpoint using the `custom` endpoint configuration in `librechat.yaml`.[3][5]

1. Create `librechat.yaml` in the project root (same directory as `docker-compose.yml`):

   ```bash
   cd /opt/LibreChat
   nano librechat.yaml
   ```

2. Add a minimal configuration defining OpenRouter as a custom endpoint (adapting from a working configuration shared by the maintainer and users):[3][4]

   ```yaml
   endpoints:
     custom:
       - name: "OpenRouter"
         apiKey: "${OPENROUTER_KEY}"
         baseURL: "https://openrouter.ai/api/v1"
         models:
           default: ["meta-llama/llama-3-70b-instruct"]
           fetch: true
         titleConvo: true
         titleModel: "meta-llama/llama-3-70b-instruct"
         dropParams: ["stop"]
         modelDisplayLabel: "OpenRouter"
   ```

   Key points from the project discussion and docs:

   - `custom` defines a list of OpenAI‑compatible endpoints.[3][4]
   - `apiKey` and `baseURL` can reference environment variables; here, `OPENROUTER_KEY` is used instead of `OPENROUTER_API_KEY` to avoid accidentally overriding the core OpenAI endpoint.[3]
   - `models.default` can contain one or more default model IDs from OpenRouter (for example `meta-llama/llama-3-70b-instruct`), and `fetch: true` tells LibreChat to query OpenRouter’s model list dynamically.[5][3]
   - `dropParams: ["stop"]` is recommended because OpenRouter models use varied stop tokens and may not accept a generic `stop` parameter consistently.[3]

   Save and exit.

3. Export your OpenRouter API key as an environment variable that Docker Compose will pick up:

   ```bash
   echo 'OPENROUTER_KEY=sk-or-xxxxxxxxxxxxxxxx' | sudo tee -a .env
   ```

   Appending this to `.env` ensures the value is available to containers at startup.[4][3]

***

## Step 7 – Ensure Docker sees `librechat.yaml`

By default, the backend container will look for `librechat.yaml` inside the application directory in the container; for Docker setups, the file must be mounted in via a volume as described in the Docker override configuration docs.[4][3]

1. Check for guidance on enabling `librechat.yaml` with Docker:

   - The maintainer points to the “docker_override” configuration guide which shows sample volume mappings for `librechat.yaml`.[3]

2. Create or edit a `docker-compose.override.yml` (or modify `docker-compose.yml` if comfortable) to mount the config file into the backend container:

   ```bash
   cd /opt/LibreChat
   nano docker-compose.override.yml
   ```

   Example structure (names may differ depending on your version; adjust to match the `api` service name in your existing `docker-compose.yml`):[4][3]

   ```yaml
   services:
     api:
       volumes:
         - ./librechat.yaml:/app/librechat.yaml:ro
   ```

   - `./librechat.yaml` is the file you created in the project root.[3]
   - `/app/librechat.yaml` is where the backend expects to find the config; the error in the discussion shows this path when the file is missing.[3]

   Save and exit.

3. Restart the stack so the new config is loaded:

   ```bash
   docker compose down
   docker compose up -d
   ```

   The maintainer emphasizes that any changes to the config file require a container restart to take effect.[3]

4. Confirm in the logs that the YAML file is detected and parsed successfully:

   ```bash
   docker compose logs -f api
   ```

   If the path or YAML syntax is wrong, you will see an error similar to “Config file YAML format is invalid” or “no such file or directory”.[3]

***

## Step 8 – Verify OpenRouter inside the LibreChat UI

Once the backend has loaded `librechat.yaml` correctly, OpenRouter should appear as a selectable provider in the LibreChat UI.[4][3]

1. Open LibreChat in your browser (for example `http://<server-ip>:3080`).[6][1]

2. Log in as an admin or your main user.

3. Open the model or endpoint selector (usually near the message input bar or in settings):

   - Look for a provider labeled “OpenRouter” or with the `modelDisplayLabel` you configured.[5][3]
   - If `models.fetch` is enabled and your API key is correct, you should see model IDs fetched from OpenRouter’s API alongside the default you specified.[3]

4. Start a conversation using an OpenRouter model:

   - Select `OpenRouter` as the provider.
   - Pick a model such as `meta-llama/llama-3-70b-instruct`.
   - Send a prompt and confirm responses are returned without errors.

If OpenRouter does not appear:

- Recheck `librechat.yaml` indentation and keys (YAML is indentation‑sensitive).[3]
- Confirm that the config file is actually being mounted at `/app/librechat.yaml` by inspecting the container (`docker exec -it <api-container> ls /app`).[3]
- Verify `OPENROUTER_KEY` is present in the container environment (`docker exec -it <api-container> env | grep OPENROUTER`). [3]

***

## Step 9 – Useful operational tips on Ubuntu

After LibreChat is working with OpenRouter, several operational improvements on Ubuntu 24.04 are recommended.

- **Run Docker without sudo**: Add your user to the `docker` group (`sudo usermod -aG docker $USER` and re‑log). This makes day‑to‑day management easier.[2][6]
- **Automatic start on boot**: Docker’s systemd unit is already enabled, but confirm that `docker compose` services come up after reboot (Docker restarts containers by default if `restart` policies are set in `docker-compose.yml`).[6][4]
- **Backups**: LibreChat stores data in MongoDB and local volumes. Snapshot the relevant Docker volumes or the `/opt/LibreChat` directory (including `data` directories defined in `docker-compose.yml`) regularly.[2][6]
- **Updates**: To update LibreChat, pull the latest changes or a newer tag and recreate the containers:

  ```bash
  cd /opt/LibreChat
  git pull
  docker compose pull
  docker compose up -d --build
  ```

  The docs recommend checking the changelog for breaking changes before updating.[5][4]

***

## Summary table – Key components

| Aspect                | Where to configure / run                          | Notes                                                                 |
|-----------------------|---------------------------------------------------|------------------------------------------------------------------------|
| Code & stack          | `/opt/LibreChat` repo                            | Cloned from GitHub; contains Docker files and configs. [2][8] |
| Environment vars      | `.env` in project root                           | Includes `UID`, `GID`, ports, `OPENROUTER_KEY`, etc. [9][1]   |
| Custom endpoints      | `librechat.yaml` mounted as `/app/librechat.yaml` | Defines OpenRouter and other OpenAI‑compatible APIs. [3][4]  |
| Container orchestration | `docker compose up -d`                           | Starts LibreChat, MongoDB, MeiliSearch, RAG stack. [1][2]     |
| Web access            | `http://<server-ip>:<port>`                      | Default port from Docker mapping (e.g. 3080). [6][4]         |
| OpenRouter config     | `endpoints.custom` in `librechat.yaml`           | `apiKey`, `baseURL`, models, labels, and `dropParams`. [3]        |

Following these steps on Ubuntu 24.04 yields a working LibreChat instance with OpenRouter.ai integrated as a selectable, fully functional provider in the UI.[2][4][3]

[1](https://www.librechat.ai/docs/quick_start/local_setup)
[2](https://www.tecmint.com/librechat-linux/)
[3](https://github.com/danny-avila/LibreChat/discussions/4676)
[4](https://www.librechat.ai/docs/local)
[5](https://www.youtube.com/watch?v=DmObFH_RX6E)
[6](https://modernizingtech.com/tips/ai/librechat-your-own-open-source-ai-chat-platform/)
[7](https://itsfoss.com/librechat-linux/)
[8](https://www.youtube.com/watch?v=M8YJAZCnWRs)
[9](https://github.com/fuegovic/Libre-Chat/blob/main/.env.example)
[10](https://www.youtube.com/watch?v=aEc2GDXIFHc)

---

https://www.perplexity.ai/search/do-a-deep-dive-research-into-t-G0fmotQaTXqF7wPL8j56ZQ#0 
