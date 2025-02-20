#!/bin/bash

# Define the cron job you want to add (adjust the schedule and command as needed)
JOB="* * * * * /path/to/your/script.sh"

# Get the current crontab (suppress errors if none exists)
current_cron=$(crontab -l 2>/dev/null)

# Check if the job is already in the crontab
if echo "$current_cron" | grep -Fq "$JOB"; then
    echo "Cron job already exists."
else
    # Append the new job and update the crontab
    (echo "$current_cron"; echo "$JOB") | crontab -
    echo "Cron job added."
fi