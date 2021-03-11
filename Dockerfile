FROM node:14-buster-slim
LABEL author="Linux123123" maintainer="linas.alexx@gmail.com"

# Install git, python3 and build deps.
RUN apt-get update 
RUN apt-get -y install git python3 build-essential

WORKDIR /usr/src/bot

# Set temprary ENV var
ARG TOKEN=NOTHING

# copy app
COPY . /usr/src/bot

# Install dependencies
RUN npm i --production --unsafe-perm

# Remove not needed src folder
RUN rm -rf src/

# Run the bot
CMD ["node", "dist/index.js"]
