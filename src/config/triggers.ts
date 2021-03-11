import { Trigger } from "../interfaces/Triggers";

export const triggers: Trigger[] = [
  {
    keys: ["exception while attempting to communicate with the daemon"],
    lines: [
      "Your panel cannot connect to your daemon. Check: Is it online? (`systemctl status wings`) Is your firewall blocking the connections? (If so, run `ufw allow 8080` and `ufw allow 2022`).",
    ],
  },
  {
    keys: ["the content must be served over HTTPS"],
    lines: [
      "Enable SSL on the server you are trying to access. Clearing the config cache might help as well.",
    ],
  },
  {
    keys: ["driver failed programming external connectivity"],
    lines: [
      "Your daemon failed to bind to the IP and port needed for the service. If this is an error you get while trying to start a Pterodactyl server, the allocations are probably misconfigured. Unless you're using a special setup, bind to `0.0.0.0`, not your external IP address. If that doesn't work, check if your port is in use with `netstat -tulpn | grep <port>`.",
    ],
  },
  {
    keys: ["address already in use 0.0.0.0:2022"],
    lines: ["Port 2022, the port for the SFTP server, is in use."],
  },
  {
    keys: ["locate a suitable socket at path specified in configuration"],
    lines: [
      "Docker might not be running. Run `systemctl status docker` to check its status",
    ],
  },
  {
    keys: [
      "does it work on ubuntu",
      "does it work on debian",
      "does it work on centos",
      "does it work with apache",
      "does it work with ubuntu",
      "does it work with debian",
      "does it work with centos",
    ],
    lines: [
      "The installation script supports the NGINX webserver and these operating systems:",
      "Ubuntu: 18.04, 20.04.",
      "Debian: 9, 10.",
      "CentOS: 7, 8.",
    ],
  },
  {
    keys: ["panel logs I get No such file or directory"],
    lines: [
      "The logs for that day don't exist. Instead, look in the log directory itself.",
      "```",
      "cd /var/www/pterodactyl/storage/logs/",
      "```",
    ],
  },
  {
    keys: [
      "ssl failed",
      "letsencrypt failed",
      "The process of obtaining a Let's Encrypt certificate failed!",
      "certificate failed",
    ],
    lines: [
      "Your certificates weren't generated.",
      "You need to make sure ports 80, 443 are open.",
      "Also make sure your domains DNS settings are correct.",
      "To try obtaining certificates again use:",
      "```certbot certonly --standalone -d panel.example.com```",
    ],
  },
  {
    keys: ["for reading: No such file or directory"],
    lines: [
      "There are no panel logs for today. This error may not be related directly to the panel. If you want to check earlier logs, go into the `/var/pterodactyl/storage/logs` directory",
    ],
  },
];
