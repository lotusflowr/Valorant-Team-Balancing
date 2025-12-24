# Valorant Team Balancer

Automation scripts for Google Sheets, focused on balancing teams for custom Valorant games.

## Features

- Team balancing logic for custom matches
- Google Apps Script integration
- Automated build and deployment workflow
- Jest-based test coverage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 recommended)
- [Python 3.x](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- Google account
- Sample Google Sheets document (make a copy):  
  https://docs.google.com/spreadsheets/d/1H2QT8lmpOd0E2y_pQzhXBWM0EFAr6FdH3MKlGqagp5k/edit

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lotusflowr/Valorant-Team-Balancing.git
   cd Valorant-Team-Balancing
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your own copy of the Google Sheets template.

4. Enable the Google Apps Script API:
   [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings)

5. Authenticate with clasp:

   ```bash
   npx clasp login
   ```

   The generated `.clasprc` file contains sensitive credentials. Do not commit or share it.

6. Configure deployments:

   * Navigate to the `clasp_configs` directory
   * Create files following the pattern:

     ```
     .clasp-{environment}.json
     ```

   Example:

   ```json
   {
     "scriptId": "script-id-1",
     "rootDir": "dist"
   }
   ```

   The `scriptId` can be found in the Apps Script project settings
   (**Extensions → Apps Script** in the spreadsheet).

## Testing

Run tests with:

```bash
npm run test
```

## Build and Deployment

### Build Only

```bash
npm run build
```

### Deploy

The deployment script detects all `.clasp-*.json` files in `clasp_configs` and treats them as deployment targets.

```bash
python deploy.py --help
```

```
usage: deploy.py [-h] -m MODE [-n] [-f]

options:
  -h, --help            show this help message
  -m MODE, --mode MODE  Deployment mode
  -n, --nobuild         Skip build step
  -f, --force           Force push (overwrite manifest changes)
```

### Multi-Environment Deployment

Deploy to all environments sharing a prefix:

```bash
python deploy.py -m dev
```

Deploy to a single environment:

```bash
python deploy.py -m dev-1
```

Additional options:

```bash
python deploy.py -m dev -n   # skip build
python deploy.py -m dev -f   # force deploy
```

## After Deployment

Refresh the Google Sheet to load the latest changes. Updates will appear in the **Scripts** menu.
