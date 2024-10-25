import subprocess
import sys
import os
import platform
import shutil
import argparse
import glob

def print_section_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60 + "\n")

def run_command(command):
    try:
        # Determine if shell should be True based on the platform
        shell = platform.system() == "Windows"

        print(f"Running command: {' '.join(command)}\n")

        result = subprocess.run(
            command,
            check=True,
            shell=shell,
            text=True,
            capture_output=False,
            encoding='utf-8'
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"\nCommand '{' '.join(command)}' failed with error code {e.returncode}")
        sys.exit(e.returncode)

def build_package():
    print_section_header("Building Deploy Package")
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
    print_section_header(f"Preparing Deployment for '{mode}' Environment")
    dest_file = ".clasp.json"

    source_file = clasp_files.get(mode)
    if source_file is None:
        print(f"Invalid mode specified: {mode}")
        sys.exit(1)

    if not os.path.exists(source_file):
        print(f"Error: Source file '{source_file}' does not exist.")
        sys.exit(1)

    print(f"Copying configuration file for '{mode}' environment...")
    try:
        shutil.copyfile(source_file, dest_file)
        print(f"Copied '{source_file}' to '{dest_file}'\n")
    except Exception as e:
        print(f"Error copying file: {e}")
        sys.exit(1)

def deploy_code():
    print_section_header("Deploying Code with Clasp")
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
