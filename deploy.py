import subprocess
import sys
import os
import platform
import shutil
import argparse

def run_command(command):
    try:
        # Determine if shell should be True based on the platform
        shellState = platform.system() == "Windows"

        print(f"Running command: {' '.join(command)}")

        result = subprocess.run(
            command,
            check=True,
            shell=shellState,
            text=True,
            capture_output=True,
            encoding='utf-8'
        )
        print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command '{' '.join(command)}' failed with error code {e.returncode}")
        if e.stdout:
            print(f"Output:\n{e.stdout}")
        if e.stderr:
            print(f"Error Output:\n{e.stderr}")
        sys.exit(e.returncode)

def build_package():
    print("Building deploy package")
    run_command(['npm', 'run', 'build'])

def copy_clasp_file(mode):
    dest_file = ".clasp.json"

    clasp_files = {
        "dev-kili": ".clasp-dev-kili.json",
        "dev-lotus": ".clasp-dev-lotus.json"
    }

    source_file = clasp_files.get(mode)
    if source_file:
        print(f"Preparing to deploy code.js to {mode.replace('-', ' ').title()}'s environment")
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