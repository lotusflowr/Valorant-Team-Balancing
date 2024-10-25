import subprocess
import sys
import os
import platform
import shutil
import argparse
import glob

# ANSI color codes
RESET = "\033[0m"
BOLD = "\033[1m"

# Text colors
BLACK = "\033[30m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"

# Background colors
BG_RED = "\033[41m"

def color_text(text, color_code):
    return f"{color_code}{text}{RESET}"

def print_section_header(title):
    header = f"\n{BOLD}{CYAN}{'=' * 60}\n  {title}\n{'=' * 60}{RESET}\n"
    print(header)

def make_clickable_link(url, text):
    return f"\033]8;;{url}\033\\{text}\033]8;;\033\\"

def run_command(command):
    # Determine if shell should be True based on the platform
    shell = platform.system() == "Windows"

    print(color_text(f"Running command: {' '.join(command)}\n", BOLD + BLUE))

    try:
        # Run the command and capture the output
        result = subprocess.run(
            command,
            check=False,  # Do not raise exception on non-zero exit code
            shell=shell,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Merge stderr into stdout
            encoding='utf-8'
        )

        output = result.stdout

        error_detected = False

        # Process output line by line
        output_lines = output.splitlines()
        for line in output_lines:
            if 'User has not enabled the Apps Script API' in line:
                error_detected = True
                # Suppress the previous error message from clasp
                continue  # Skip this line
            elif error_detected:
                # Skip further output after error detected
                continue
            else:
                # Print the output line
                print(line)

        if error_detected:
            # Build the clickable link
            url = "https://script.google.com/home/usersettings"
            clickable_link = make_clickable_link(url, url)

            # Print the custom error message with colors
            print("\n" + color_text("Error: You have not enabled the Apps Script API.", BOLD + RED))
            print("Please enable it by visiting:")
            print(clickable_link)
            print("After enabling the API, please rerun the script.\n")
            sys.exit(1)
        elif result.returncode != 0:
            print(color_text(f"\nCommand '{' '.join(command)}' failed with error code {result.returncode}", BOLD + RED))
            sys.exit(result.returncode)
        else:
            return result

    except KeyboardInterrupt:
        print(color_text("\nCommand execution interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)
    except Exception as e:
        print(color_text(f"\nAn unexpected error occurred: {e}", BOLD + RED))
        sys.exit(1)

def build_package():
    print_section_header("Building Deploy Package")
    try:
        run_command(['npm', 'run', 'build'])
        print(color_text("Build completed successfully.\n", GREEN))
    except KeyboardInterrupt:
        print(color_text("\nBuild process interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)

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
        print(color_text(f"Invalid mode specified: {mode}", BOLD + RED))
        sys.exit(1)

    if not os.path.exists(source_file):
        print(color_text(f"Error: Source file '{source_file}' does not exist.", BOLD + RED))
        sys.exit(1)

    print(f"Copying configuration file for '{mode}' environment...")
    try:
        shutil.copyfile(source_file, dest_file)
        print(color_text(f"Copied '{source_file}' to '{dest_file}'\n", GREEN))
    except Exception as e:
        print(color_text(f"Error copying file: {e}", BOLD + RED))
        sys.exit(1)

def check_clasp_login():
    # Check for .clasprc.json in the user's home directory
    home_dir = os.path.expanduser('~')
    clasprc_path = os.path.join(home_dir, '.clasprc.json')
    print(color_text(f"Checking for Clasp credentials in '{clasprc_path}'...", BOLD))

    if not os.path.exists(clasprc_path):
        print_section_header("Clasp Login Required")
        print(color_text("It seems you're not logged into clasp.", YELLOW))
        try:
            run_command(['npx', 'clasp', 'login'])
            print(color_text("!!! DO NOT SHARE THESE CREDENTIALS !!!", BOLD + RED))
            print("Enable the Apps Script API if you haven't at " + make_clickable_link("https://script.google.com/home/usersettings", "https://script.google.com/home/usersettings"))
        except KeyboardInterrupt:
            print(color_text("\nClasp login interrupted by user (CTRL+C).", BOLD + YELLOW))
            sys.exit(1)
    else:
        print(color_text("Verified Clasp is logged in.\n", GREEN))

def deploy_code():
    print_section_header("Deploying Code with Clasp")
    try:
        run_command(['npx', 'clasp', 'push'])
        print(color_text("Code deployed successfully.\n", GREEN))
    except KeyboardInterrupt:
        print(color_text("\nDeployment interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)

def main():
    try:
        print(color_text("Starting deployment script...\n", BOLD + MAGENTA))

        clasp_files = get_available_modes()
        if not clasp_files:
            print(color_text("No modes found. Please ensure configuration files exist in the 'clasp_configs' directory.", BOLD + RED))
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

        print(color_text(f"Selected mode: {args.mode}", BOLD))
        if args.nobuild:
            print(color_text("Skipping build step as per argument.\n", YELLOW))

        if not args.nobuild:
            build_package()

        copy_clasp_file(args.mode, clasp_files)
        check_clasp_login()
        deploy_code()

        print(color_text("Deployment completed successfully!\n", BOLD + GREEN))
    except KeyboardInterrupt:
        print(color_text("\nScript execution interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)

if __name__ == "__main__":
    main()