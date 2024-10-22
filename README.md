# Introduction

This repo contains scripts for the Galorants discord server. Currently houses the functionality for balancing teams for custom server games.

## Installation

The following dependencies will be required to install & test scripts in this repo:

- NodeJS (version 20 recommended)
- Google account
- Sample Google Sheets document with form responses (provided separately)

To begin installation, clone this repo and run `npm i` to install all node dependencies. See the `package.json` file for a complete list of the current dependencies.

Make a copy of the provided Google Sheets document so you have your own development environment. The document should include a SCRIPTS dropdown menu created by the `onOpen` command in `src/Galorants_In-Houses_script.js` and you can find the deployed code by going to Extensions -> Apps Script (this is also how you will find your script ID later). When you want to update the code, you can replace what's in code.gs with what you copy/paste from the built document (see below), or automatically deploy via Clasp (see below). Whenever the code is updated (including through automated deployments), refresh the Google Sheet to see the changes.

## Testing

This project uses [Jest](https://jestjs.io/) for automated testing.

Run `npm run test` to run the automated test suite.

## Building

When you make a change and want to copy it to your Google Apps Script version, you'll need to build the code to create a single file for use with Google Apps Scripts. This project uses [Rollup](https://rollupjs.org) for that.

Run `npm run build` to create the updated `dist/code.js` file.

## Deploy

To automatically deploy with Clasp:

1. Ensure you have enabled the Google Apps Script API in the Google account with which you will be using to deploy: https://script.google.com/home/usersettings and grant it at least the "Create and update Google Apps Script deployments" and "Create and update Google Apps Script projects" permissions.
2. Run `npx clasp login` and follow the prompts to log in via Google. This will create a `.clasprc` file in your home directory. DO NOT SHARE OR COMMIT THIS FILE. It contains an access token for your Google account, so you'll want to keep it safe.
3. Run the appropriate npm deploy script. This will, by default, automatically build & deploy the `dist/code.js` file to the Apps Script specified by the corresponding .clasp.json file. Once the deploy is done, refresh your Google Sheet instance to see the changes.

Example: `npm run deploy_dev_kili` will build the code from `/src` and deploy to the Apps Script ID specified in .clasp-dev-kili.json.

To deploy without building, call the npm deploy script with the `-n` flag to specify "nobuild"

Example: `npm run deploy_dev_kili -- -n`

Note the `--` before the `-n` flag; this is required to pass the parameter to the deploy script.

### Create a deploy script

To create a new deploy script, create a .clasp-somename.json file with the following attributes:

``` JSON
{
  "scriptId":"<yourTargetScriptID>",
  "rootDir":"dist"
}
```

You can locate your script ID by viewing the Google Apps Script project in your browser and choosing "Project Settings."

From there, update the `deploy.sh` file to include an "elif" block with your deploy mode, and have it copy your .clasp-somename.json file to .clasp.json. This will allow clasp to locate it & run it. Also, update the usage block to include the name for your mode.

Finally, add a line in the `scripts` section of `package.json` with your new deploy script.
