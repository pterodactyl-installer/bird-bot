# bird-bot

![GitHub](https://img.shields.io/github/license/vilhelmprytz/bird-bot)

Discord bot for the [Pterodactyl Installation Script Discord](https://pterodactyl-installer.se/discord) server!

## Requirements

Nodejs v12.0.0 or newer is recommended. You can install that using:
(If you can't use Nodejs 12 or newer you can compile with a lower target version)

```bash
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Installation

```bash
git clone https://github.com/vilhelmprytz/bird-bot.git
```

```bash
npm i --production
```

## Configuration

Triggers are defined in `dist/triggers.js`.
For all the other things you will be prompted automatically.

## Running

One-time start: `node dist/index.js`

You can also start it in `pm2`

```bash
sudo npm -g i pm2
```

```bash
pm2 start dist/index.js
```

## Staying updated

A pm2 addon can help!

```bash
pm2 install pm2-auto-pull
```

For updating every 60 seconds use

```bash
pm2 set pm2-auto-pull:interval 60000
```
