import subprocess
import sys
import os
import platform
import shutil
import argparse
import glob

def run_command(command):
    try:
        # Determine if shell should be True based on the platform
        shell = platform.system() == "Windows"

        print(f"Running command: {' '.join(command)}")

        result = subprocess.run(
            command,
            check=True,
            shell=shell,
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

def get_available_modes():
    config_files = glob.glob('clasp_configs/.clasp-*.json')
    modes = {}
    for filepath in config_files:
        filename = os.path.basename(filepath)
        # Extract mode name from filename
        mode = filename[len('.clasp-'):-len('.json')]
        modes[mode] = filepath
    return modes

def copy_clasp_file(mode, clasp_files):
    dest_file = ".clasp.json"

    source_file = clasp_files.get(mode)
    if source_file:
        print(f"Preparing to deploy code.js to '{mode}' environment")
    else:
        print(f"Invalid mode specified: {mode}")
        sys.exit(1)

    if not os.path.exists(source_file):
        print(f"Error: Source file '{source_file}' does not exist.")
        sys.exit(1)

    try:
        shutil.copyfile(source_file, dest_file)
        print(f"Copied '{source_file}' to '{dest_file}'")
    except Exception as e:
        print(f"Error copying file: {e}")
        sys.exit(1)

def deploy_code():
    print("Deploying code with clasp")
    run_command(['npx', 'clasp', 'push'])

def main():
    clasp_files = get_available_modes()
    if not clasp_files:
        print("No modes found. Please ensure configuration files exist in the 'clasp_configs' directory.")
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Build and deploy script.")
    parser.add_argument(
        '-m', '--mode',
        choices=clasp_files.keys(),
        required=True,
        help='Deployment mode'
    )
    parser.add_argument(
        '-n', '--nobuild',
        action='store_true',
        help='Skip the build step'
    )

    args = parser.parse_args()

    if not args.nobuild:
        build_package()

    copy_clasp_file(args.mode, clasp_files)
    deploy_code()

if __name__ == "__main__":
    main()
