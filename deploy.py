import subprocess
import sys
import os
import platform
import shutil
import argparse

def run_command(command):
    try:
        system = platform.system()
        # Determine if shell should be True based on the platform
        shell = system == "Windows"

        # Prepare the command
        if shell:
            # On Windows, commands are passed as strings with shell=True
            if isinstance(command, list):
                cmd = ' '.join(command)
            else:
                cmd = command
            print(f"Running command: {cmd}")
            result = subprocess.run(
                cmd,
                check=True,
                shell=True,
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
        else:
            # On Unix-like systems, commands are passed as lists with shell=False
            if isinstance(command, str):
                # Split the string into a list of arguments
                command = command.split()
            print(f"Running command: {' '.join(command)}")
            result = subprocess.run(
                command,
                check=True,
                shell=False,
                capture_output=True,
                text=True,
                encoding='utf-8'
            )
        print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command failed with error code {e.returncode}")
        print(f"Error Output (stderr):\n{e.stderr}")
        sys.exit(e.returncode)

def build_package():
    print("Building deploy package")
    system = platform.system()

    if system == "Windows":
        # On Windows, use npm run directly
        run_command("npm run build")
    else:
        # On Linux/Mac, try the local rollup binary
        if os.path.exists("node_modules/.bin/rollup"):
            run_command(['node_modules/.bin/rollup', '--config'])
        else:
            # Fallback to globally installed rollup
            run_command(['rollup', '--config'])

def copy_clasp_file(mode):
    source_file = None
    dest_file = ".clasp.json"

    if mode == "dev-kili":
        source_file = ".clasp-dev-kili.json"
        print("Preparing to deploy code.js to Kili's dev environment")
    elif mode == "dev-lotus":
        source_file = ".clasp-dev-lotus.json"
        print("Preparing to deploy code.js to Lotus's dev environment")
    else:
        print("Invalid mode specified.")
        sys.exit(1)

    if not os.path.exists(source_file):
        print(f"Error: Source file {source_file} does not exist.")
        sys.exit(1)

    try:
        shutil.copyfile(source_file, dest_file)
        print(f"Copied {source_file} to {dest_file}")
    except Exception as e:
        print(f"Error copying file: {e}")
        sys.exit(1)

def deploy_code():
    print("Deploying code with clasp")
    system = platform.system()

    if system == "Windows":
        run_command("npx clasp push")
    else:
        run_command(['npx', 'clasp', 'push'])

def main():
    parser = argparse.ArgumentParser(description="Build and deploy script.")
    parser.add_argument('-m', '--mode', choices=['dev-kili', 'dev-lotus'], required=True, help='Deployment mode')
    parser.add_argument('-n', '--nobuild', action='store_true', help='Skip the build step')

    args = parser.parse_args()

    if not args.nobuild:
        build_package()

    copy_clasp_file(args.mode)
    deploy_code()

if __name__ == "__main__":
    main()
