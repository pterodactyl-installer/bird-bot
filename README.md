# bird-bot

![GitHub](https://img.shields.io/github/license/pterodactyl-installer/bird-bot)
![Workflow Status](https://github.com/pterodactyl-installer/bird-bot/actions/workflows/node.js.yml/badge.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/pterodactylinstaller/bird-bot)

Discord bot for the [Pterodactyl Installation Script Discord](https://pterodactyl-installer.se/discord) server!

# Docker image

We provide an easy to use `docker-compose.yml` file. Just install `docker` and `docker-compose`.
Then fill in the `env` variables in the `docker-compose.yml` file and run `docker-compose up -d`

## Requirements

Nodejs v12.0.0 or newer is recommended. You can install that using:
(If you can't use Nodejs 12 or newer you can compile with a lower target version)

```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Manual Installation

```bash
git clone https://github.com/pterodactyl-installer/bird-bot.git
```

```bash
npm i --production
```

```bash
npm run build && npm run configure
```

## Configuration

Triggers are defined in `src/triggers.js`.
After editing triggers you will need to recompile with `npm run build`
For all the other things you will be prompted automatically.
