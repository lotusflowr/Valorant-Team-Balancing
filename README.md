# Galorants Scripts

This repository contains automation scripts for the Galorants discord server, primarily focused on balancing teams for custom server games.

# Features
- Team balancing functionality for custom games
- Automated deployment pipeline
- Integration with Google Sheets
- Comprehensive test coverage

# Getting Started

## Prerequisites

- [NodeJS](https://nodejs.org/) (version 20 recommended)
- [Python 3.x](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- Google account
- [Copy of Sample Google Sheets document with form responses](https://docs.google.com/spreadsheets/d/1H2QT8lmpOd0E2y_pQzhXBWM0EFAr6FdH3MKlGqagp5k/edit)

## Step-by-Step Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lotusflowr/Galorants_scripts.git
   cd galorants-scripts
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Make a copy of the provided Google Sheets template for your development environment

4. Enable Google Apps Script API by visiting [Google Apps Script Settings](https://script.google.com/home/usersettings)

5. Authenticate with Clasp:
    - When authenticating with Clasp, grant the following permissions:
        - Create and update Google Apps Script deployments
        - Create and update Google Apps Script projects
   ```bash
   npx clasp login
   ```
   **Important**: The generated `.clasprc` file in your home directory contains sensitive access tokens. Do not share or commit this file.

6. Create your deployment configuration:
   - Navigate to `clasp_configs` directory
   - Create a new file `.clasp-{environment}.json`
        - The `{environment}` part will be what you'll use to for the `deploy.py` code.
   
   Example configuration:
   ```json
   {
     "scriptId": "your_script_id_here",
     "rootDir": "dist"
   }
   ```
   Find your script ID in the Google Apps Script project settings under "Project Settings".

## Testing

Run the Jest test suite:
```bash
npm run test
```

## Building and Deployment

### Build Only
To build the code without deploying:
```bash
npm run build
```

### Deploy with Python Script

The deployment script automatically scans the `clasp_configs` directory for available deployment modes. Any file matching the pattern `.clasp-*.json` will be recognized as a valid deployment configuration.

View available commands and options:
```bash
python deploy.py --help
```

This will display:
```
usage: deploy.py [-h] -m {dev_kili,dev_lotus,{environment}} [-n] [-f]

Build and deploy script.

options:
  -h, --help            show this help message and exit
  -m {dev_kili,dev_lotus,{environment}}, --mode {dev_kili,dev_lotus,{environment}}
                        Deployment mode
  -n, --nobuild        Skip the build step
  -f, --force          Force push to overwrite manifest changes
```

Available commands:

1. Standard deployment (with build):
   ```bash
   python deploy.py -m {environment}
   ```

2. Deploy without building:
   ```bash
   python deploy.py -m {environment} -n
   ```

3. Force deployment (overwrites manifest changes):
   ```bash
   python deploy.py -m {environment} -f
   ```

Where `{environment}` is your deployment environment name matching your `.clasp-{environment}.json` configuration file.

### After Deployment

Refresh your Google Sheet to see the updated changes. The SCRIPTS menu will reflect any modifications to the codebase.
