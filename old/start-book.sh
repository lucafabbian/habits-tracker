#!/bin/bash
cd "$(dirname "$0")"
SOCK="$(pwd)/../.dtach/bookreader.sock"
mkdir -p "$(pwd)/../.dtach"

dtach -A "$SOCK" -e "@" python3 server.py
#dtach -A "$SOCK" -e "@" busybox httpd -f -h webapp -p 0.0.0.0:8091