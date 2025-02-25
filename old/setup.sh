#!/bin/bash
cd "$(dirname "$0")"

sudo apt update -y
sudo apt install -y dtach unzip wget

# Download the latest Pocketbase
wget -qO pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.25.5/pocketbase_0.25.5_linux_amd64.zip"
unzip -o pocketbase.zip -d .
rm pocketbase.zip
chmod +x pocketbase


# Set backup cron job
JOB="* * * * * /path/to/your/script.sh"

current_cron=$(crontab -l 2>/dev/null)
if echo "$current_cron" | grep -Fq "$JOB"; then
    echo "Cron job already exists."
else
    (echo "$current_cron"; echo "$JOB") | crontab -
    echo "Cron job added."
fi