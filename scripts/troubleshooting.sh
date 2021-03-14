#!/bin/bash

######## General checks #########

# exit with error status code if user is not root
if [[ $EUID -ne 0 ]]; then
  echo "* This script must be executed with root privileges (not sudo)." 1>&2
  exit 1
fi

# check for curl
if ! [ -x "$(command -v curl)" ]; then
  echo "* curl is required in order for this script to work."
  echo "* install using apt (Debian and derivatives) or yum/dnf (CentOS)"
  exit 1
fi

####### Visual functions ########

print() {
  echo "* $1"
}

##### Main functions #####

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
    panel_log="$(nc termbin.com 9999 < /var/www/pterodactyl/storage/logs/laravel-"$(date +%F)".log | tr -d '\0')"
  else
    panel_log='Empty'
  fi
}

wings_logs(){
  if [ -x "$(command -v wings)" ]; then
    wings_log="Empty" # Todo
  else
    wings_log="Empty"
  fi
}

check_nginx(){
  if [ -x "$(command -v nginx)" ]; then
    nginx_check="$(nginx -t 2>&1 | nc termbin.com 9999 | tr -d '\0')"
  else
    nginx_check="Empty"
  fi
}

post(){
  Data="{\"os\":\"$OS\", \"os_ver\":\"$OS_VER_MAJOR\", \"panel_log\":\"$panel_log\", \"wings_log\":\"$wings_log\", \"nginx_check\":\"$nginx_check\"}"
  curl -s \
    --header "Content-Type: application/json" \
    --request POST \
    --data "$Data" \
    LINK
}

main(){
  print "Starting the troubleshooting script."
  print "Detecting OS."
  detect_distro
  print "Retrieving panel logs."
  panel_logs
  print "Retrieving wings logs."
  wings_logs
  print "Retrieving nginx logs."
  check_nginx
  print "Sending the data to server."
  post
}

main
