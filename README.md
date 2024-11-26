# 🎮 Galorants Scripts
This repository contains automation scripts for the Galorants discord server, primarily focused on balancing teams for custom server games.
# ✨ Features
- 🎯 Team balancing functionality for custom games
- 🚀 Automated deployment pipeline
- 📊 Integration with Google Sheets
- ✅ Comprehensive test coverage
# 🚀 Getting Started
## 📋 Prerequisites
- [NodeJS](https://nodejs.org/) (version 20 recommended) 📦
- [Python 3.x](https://www.python.org/downloads/) 🐍
- [Git](https://git-scm.com/downloads) 📥
- Google account 📧
- [Copy of Sample Google Sheets document with form responses](https://docs.google.com/spreadsheets/d/1H2QT8lmpOd0E2y_pQzhXBWM0EFAr6FdH3MKlGqagp5k/edit) 📑
## 🛠️ Step-by-Step Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/lotusflowr/Galorants_scripts.git
   cd Galorants_scripts
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Make a copy of the provided Google Sheets template for your development environment
4. Enable Google Apps Script API by visiting [Google Apps Script Settings](https://script.google.com/home/usersettings) 🔑
5. Authenticate with Clasp:
    - When authenticating, grant the following permissions:
        - ✅ Create and update Google Apps Script deployments
        - ✅ Create and update Google Apps Script projects
   ```bash
   npx clasp login
   ```
   ⚠️ **Important**: The generated `.clasprc` file in your home directory contains sensitive access tokens. Do not share or commit this file.
6. Create your deployment configuration:
   - Navigate to `clasp_configs` directory
   - Create configuration files following the pattern `.clasp-{environment}.json`
        - The `{environment}` part can be any name you choose
        - For example: `.clasp-prod-na.json`
   
   Example configurations:
   ```json
   {
     "scriptId": "script-id-1",
     "rootDir": "dist"
   }
   ```
   Find your script ID in the Google Apps Script project settings under "Project Settings". You can access the Apps Script of the Spreadsheet through `Extensions/Apps Script`.
## 🧪 Testing
Run the Jest test suite:
```bash
npm run test
```
## 🔨 Building and Deployment
### 🏗️ Build Only
To build the code without deploying:
```bash
npm run build
```
### 🚀 Deploy with Python Script
The deployment script automatically scans the `clasp_configs` directory for available deployment modes. Any file matching the pattern `.clasp-*.json` will be recognized as a valid deployment configuration.

View available commands and options:
```bash
python deploy.py --help
```
This will display:
```
usage: deploy.py [-h] -m MODE [-n] [-f]
Build and deploy script.
options:
  -h, --help            show this help message and exit
  -m MODE, --mode MODE  Deployment mode
  -n, --nobuild        Skip the build step
  -f, --force          Force push to overwrite manifest changes
```

#### 🌍 Multi-Environment Deployment
The script supports deploying to multiple environments simultaneously using environment prefixes:

1. Deploy to all environments with a specific prefix:
   ```bash
   python deploy.py -m dev    # Deploys to all dev-* environments
   ```
   For example, if you have `.clasp-dev-1.json` and `.clasp-dev-2.json`, this will deploy to both.

2. Deploy to a specific environment:
   ```bash
   python deploy.py -m dev-1  # Deploy only to dev-1 environment
   ```

Additional deployment options:
1. Deploy without building:
   ```bash
   python deploy.py -m dev -n
   ```
2. Force deployment (overwrites manifest changes):
   ```bash
   python deploy.py -m dev -f
   ```

The script will:
- Display all detected environments before deployment
- Show progress for each environment
- Use color-coding to distinguish between different environments
- Provide clear success/failure messages for each deployment

### 🔄 After Deployment
Refresh your Google Sheet to see the updated changes. The SCRIPTS menu will reflect any modifications to the codebase.
