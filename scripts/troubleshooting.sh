#!/bin/bash

detect_distro() {
  if [ -f /etc/os-release ]; then
    # freedesktop.org and systemd
    . /etc/os-release
    OS=$(echo "$ID" | awk '{print tolower($0)}')
    OS_VER=$VERSION_ID
  elif type lsb_release >/dev/null 2>&1; then
    # linuxbase.org
    OS=$(lsb_release -si | awk '{print tolower($0)}')
    OS_VER=$(lsb_release -sr)
  elif [ -f /etc/lsb-release ]; then
    # For some versions of Debian/Ubuntu without lsb_release command
    . /etc/lsb-release
    OS=$(echo "$DISTRIB_ID" | awk '{print tolower($0)}')
    OS_VER=$DISTRIB_RELEASE
  elif [ -f /etc/debian_version ]; then
    # Older Debian/Ubuntu/etc.
    OS="debian"
    OS_VER=$(cat /etc/debian_version)
  elif [ -f /etc/SuSe-release ]; then
    # Older SuSE/etc.
    OS="SuSE"
    OS_VER="?"
  elif [ -f /etc/redhat-release ]; then
    # Older Red Hat, CentOS, etc.
    OS="Red Hat/CentOS"
    OS_VER="?"
  else
    # Fall back to uname, e.g. "Linux <version>", also works for BSD, etc.
    OS=$(uname -s)
    OS_VER=$(uname -r)
  fi

  OS=$(echo "$OS" | awk '{print tolower($0)}')
  OS_VER_MAJOR=$(echo "$OS_VER" | cut -d. -f1)
}

panel_logs(){
  if [ -f "/var/www/pterodactyl/storage/logs/laravel-$(date +%F).log" ]; then 
    panel_log="$(tail -n 100 /var/www/pterodactyl/storage/logs/laravel-"$(date +%F)".log | nc bin.ptdl.co 99)"
  else
    panel_log='Empty'
  fi
}

post(){
  Data="{\"os\":\"$OS\", \"os_ver\":\"$OS_VER_MAJOR\", \"panel_log\":\"$panel_log\", \"wings_log\":\"Empty\", \"nginx_check\":\"Empty\"}"
  curl -s \
    --header "Content-Type: application/json" \
    --request POST \
    --data "$Data" \
    LINK
}

detect_distro
panel_logs
post