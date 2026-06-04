FROM mcr.microsoft.com/powershell:latest

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create non-root user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install base dependencies + draw.io deps
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    ca-certificates \
    git \
    unzip \
    xvfb \
    libgbm1 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (for Claude Code CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install OpenCode CLI
RUN npm install -g opencode-ai

# Install Pi Coding Agent
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash \
    && az extension add --name azure-devops \
    && az extension add --name resource-graph

# Install Bicep
RUN az bicep install

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Install prettier
RUN npm install -g prettier

# Install PowerShell modules
RUN pwsh -NoProfile -Command " \
    Install-Module -Name Az.Accounts -Force -Scope AllUsers; \
    Install-Module -Name Az.Resources -Force -Scope AllUsers; \
    Install-Module -Name Az.KeyVault -Force -Scope AllUsers; \
    Install-Module -Name Pester -Force -Scope AllUsers; \
    Install-Module -Name PSReadLine -Force -Scope AllUsers; \
    Install-Module -Name PSRule.Rules.Azure -Force -Scope AllUsers; \
    Install-Module -Name Terminal-Icons -Force -Scope AllUsers"

# Install draw.io Desktop (latest amd64 .deb from GitHub releases)
RUN apt-get update \
    && DRAWIO_URL=$(curl -sL https://api.github.com/repos/jgraph/drawio-desktop/releases/latest \
    | python3 -c "import json,sys; data=json.load(sys.stdin); print(next(a['browser_download_url'] for a in data['assets'] if 'amd64' in a['name'] and a['name'].endswith('.deb')))") \
    && curl -L "$DRAWIO_URL" -o /tmp/drawio.deb \
    && apt-get install -y /tmp/drawio.deb \
    && rm /tmp/drawio.deb \
    && rm -rf /var/lib/apt/lists/*

# Create drawio-cli wrapper (runs draw.io headless via xvfb)
RUN printf '#!/usr/bin/env bash\nxvfb-run -a drawio --no-sandbox "$@"\n' > /usr/local/bin/drawio-cli \
    && chmod +x /usr/local/bin/drawio-cli

USER $USERNAME
