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
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"

# Region-specific colors
REGION_COLORS = {
    # Production Environments
    'prod-na': "\033[38;5;198m",  # Pink-red
    'prod-eu': "\033[38;5;135m",  # Purple
    'prod-ap': "\033[38;5;81m",   # Light blue
    'prod-latam': "\033[38;5;214m",  # Orange
    # Development Environments
    'dev-na': "\033[38;5;205m",   # Lighter pink-red
    'dev-eu': "\033[38;5;141m",   # Lighter purple
    'dev-ap': "\033[38;5;117m",   # Lighter blue
    'dev-latam': "\033[38;5;208m",  # Lighter orange
}

enableAPI_link = "https://script.google.com/home/usersettings"

def color_text(text, color_code):
    return f"{color_code}{text}{RESET}"

def get_region_color(mode):
    """Get specific color for the environment-region combination."""
    return REGION_COLORS.get(mode, CYAN)

def print_section_header(title, mode=None):
    color = get_region_color(mode) if mode else CYAN
    header = f"\n{BOLD}{color}{'=' * 60}\n  {title}\n{'=' * 60}{RESET}\n"
    print(header)

def make_clickable_link(url, text):
    return f"\033]8;;{url}\033\\{text}\033]8;;\033\\"

def run_command(command, clasp_config=None, interactive=False):
    """
    Core function that executes shell commands with flexible output handling.
    Handles both interactive and non-interactive command execution.
    """
    shell = platform.system() == "Windows"

    try:
        if interactive:
            # For interactive commands, capture stderr to check for API errors
            # while still allowing stdout to show in real-time
            process = subprocess.Popen(
                command,
                shell=shell,
                text=True,
                stdout=None,  # Allow stdout to flow to console
                stderr=subprocess.PIPE  # Capture stderr for error checking
            )
            
            # Read stderr in real-time
            error_output = ""
            while True:
                stderr_line = process.stderr.readline()
                if not stderr_line and process.poll() is not None:
                    break
                error_output += stderr_line
            
            process.wait()
            
            # Check for API error in stderr
            if 'User has not enabled the Apps Script API' in error_output or 'code: 403' in error_output:
                return "", False, "API_ERROR"
                
            return "", process.returncode == 0, error_output if process.returncode != 0 else ""
            
        else:
            # For non-interactive commands, capture both stdout and stderr
            process = subprocess.run(
                command,
                shell=shell,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False
            )
            
            output = process.stdout + process.stderr
            
            # Check for API error
            if 'User has not enabled the Apps Script API' in output or 'code: 403' in output:
                return output, False, "API_ERROR"
            
            return output, process.returncode == 0, output if process.returncode != 0 else ""

    except KeyboardInterrupt:
        return "", False, "INTERRUPTED"
    except Exception as e:
        return "", False, str(e)

def build_package():
    """
    Executes the npm build process for the project.
    Runs 'npm run build' command with real-time output display.
    """
    print_section_header("Building Deploy Package")
    try:
        # Variables
        shell = platform.system() == "Windows"
        cmd_str = ['npm', 'run', 'build']
        
        # Run npm run build with real-time output display
        process = subprocess.run(
            cmd_str,
            check=True,
            text=True,
            shell=shell,
            capture_output=False,
            encoding= "UTF-8",
        )

        if process.returncode != 0:
            print(color_text("\nBuild failed. Please check the error messages above.", BOLD + RED))
            sys.exit(1)
        else:
            print(color_text("\nBuild completed successfully.", GREEN))

    except KeyboardInterrupt:
        print(color_text("\nBuild process interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)
    except Exception as e:
        print(color_text(f"\nBuild failed: {str(e)}", BOLD + RED))
        sys.exit(1)


def copy_clasp_file(mode, clasp_files):
    """
    Copies the appropriate clasp configuration file for the selected deployment mode.
    """
    print_section_header(f"Preparing Deployment for '{mode}' Environment", mode)
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
    """
    Verifies clasp authentication status and handles login if needed.
    Checks for .clasprc.json in user's home directory.

    Features:
    - Automatic credential detection
    - Interactive login process if needed
    - Security warning for credentials
    - API enablement reminder
    - Clear status messages

    Returns: None (exits on failure)
    """
    home_dir = os.path.expanduser('~')
    clasprc_path = os.path.join(home_dir, '.clasprc.json')
    print(color_text(f"Checking for Clasp credentials in '{clasprc_path}'...", BOLD))

    if not os.path.exists(clasprc_path):
        print_section_header("Clasp Login Required")
        print(color_text("It seems you're not logged into clasp.", YELLOW))
        try:
            output, success, error = run_command(['npx', 'clasp', 'login'], interactive=True)
            if error == "INTERRUPTED":
                print(color_text("\nClasp login interrupted by user (CTRL+C).", BOLD + YELLOW))
                sys.exit(1)
            elif error == "API_ERROR" or not success:
                print(color_text("Clasp login failed. Please ensure you're authenticated and try again.\n", BOLD + RED))
                print("Enable the Apps Script API if needed: " + make_clickable_link(enableAPI_link, enableAPI_link))
                sys.exit(1)
        except KeyboardInterrupt:
            print(color_text("\nClasp login interrupted by user (CTRL+C).", BOLD + YELLOW))
            sys.exit(1)
        except Exception:
            print(color_text("Clasp login failed.\n", BOLD + RED))
            sys.exit(1)
    else:
        print(color_text("Verified Clasp is logged in.\n", GREEN))

def get_available_modes():
    """
    Dynamically scans clasp_configs directory for available deployment modes.
    Handles both simple dev/prod files and regional variants.
    """
    config_files = glob.glob('clasp_configs/.clasp-*.json')
    modes = {}
    for filepath in config_files:
        filename = os.path.basename(filepath)
        # Extract mode name (removing .clasp- prefix and .json suffix)
        mode = filename[len('.clasp-'):-len('.json')]
        modes[mode] = filepath
    return modes

def get_modes_by_keyword(clasp_files, keyword):
    """
    Gets modes that match a given keyword (dev or prod).
    Handles both simple mode files and regional variants.
    """
    # First check for exact match (e.g., just 'dev' or 'prod')
    if keyword in clasp_files:
        return [keyword], False
        
    # Then check for regional variants (e.g., dev-na, dev-eu)
    prefix_matches = [mode for mode in clasp_files.keys() if mode.startswith(f"{keyword}-")]
    
    if not prefix_matches:
        print(color_text(f"No {keyword} environments found in clasp_configs directory.", RED))
        print(color_text("Available environments:", BOLD))
        for mode in sorted(clasp_files.keys()):
            print(f"  • {mode}")
        sys.exit(1)
    
    return prefix_matches, len(prefix_matches) > 1

def deploy_code(args, mode):
    """
    Manages the clasp deployment process with manifest handling.
    Handles both forced and interactive deployments.
    """
    print_section_header("Deploying Code with Clasp", mode)
    try:
        base_command = ['npx', 'clasp', 'push']
        
        # First run: Interactive mode for manifest prompt if not force
        if not args.force:
            print(color_text("Checking for manifest changes...", BOLD))
            _, success, error = run_command(base_command, interactive=True)
            
            if error == "INTERRUPTED":
                raise KeyboardInterrupt()
            elif error == "API_ERROR":
                handle_api_error()
                return  # Exit after handling API error
            elif not success:
                print(color_text("\nDeployment failed during manifest check.", BOLD + RED))
                if error:  # Show error message if available
                    print(color_text(f"Error: {error}", RED))
                sys.exit(1)
        
        # Second run: Force push and error checking
        command = base_command + (['--force'] if args.force else [])
        output, success, error = run_command(command, interactive=False)
        
        if error == "API_ERROR":
            handle_api_error()
            return  # Exit after handling API error
        elif not success:
            print(color_text("\nDeployment failed. Please try again.", BOLD + RED))
            if error:  # Show error message if available
                print(color_text(f"Error: {error}", RED))
            sys.exit(1)
        
        # Only show success message if we actually succeeded
        if success:
            color = get_region_color(mode)
            print(f"{BOLD}{color}\nCode deployed successfully to {mode}!{RESET}")

    except KeyboardInterrupt:
        print(color_text("\nDeployment interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)
    except Exception as e:
        print(color_text(f"\nDeployment failed: {e}", BOLD + RED))
        sys.exit(1)
        
def deploy_multiple_modes(modes, clasp_files, args):
    """
    Handles deployment to multiple environments with clear regional separation.
    """
    total_modes = len(modes)
    print(color_text(f"\nFound {total_modes} environments:", BOLD))
    
    # Print each environment with its region-specific color
    for mode in modes:
        color = get_region_color(mode)
        print(f"{color}{BOLD}  • {mode}{RESET}")
    
    print(color_text("\nProceeding with deployment to all environments...\n", BOLD))
    
    for index, mode in enumerate(modes, 1):
        color = get_region_color(mode)
        print(f"{BOLD}{color}Deployment {index}/{total_modes}: {mode}{RESET}")
        temp_args = argparse.Namespace(**vars(args))
        temp_args.mode = mode
        deploy_to_mode(mode, clasp_files, temp_args)
        
        if index < total_modes:
            print("")
        
def deploy_to_mode(mode, clasp_files, args):
    """
    Handles the deployment process for a single mode.
    """
    color = get_region_color(mode)
    print(f"\n{BOLD}{color}Starting deployment to {mode}...{RESET}\n")

    copy_clasp_file(mode, clasp_files)
    check_clasp_login()
    deploy_code(args, mode)

    print(f"{BOLD}{color}Deployment to {mode} completed successfully!\n{RESET}")

def handle_api_error():
    """
    Displays user-friendly message when Apps Script API is not enabled.
    Provides step-by-step instructions for enabling the API.

    Features:
    - Formatted error message with color
    - Clickable link to settings page
    - Clear instructions
    - Clean exit with status code 1

    Returns: None (always exits)
    """
    print("\n" + color_text("Error: The Apps Script API is not enabled. Nothing has been pushed.", BOLD + RED))
    print(color_text("Please follow these steps:", BOLD))
    print("1. Visit: " + make_clickable_link(enableAPI_link, enableAPI_link))
    print("2. Enable the Apps Script API")
    print("3. Run this deployment script again\n")
    sys.exit(1)

def main():
    """
    Main entry point for the deployment script.
    """
    try:
        print(color_text("Starting deployment...", BOLD + MAGENTA))

        clasp_files = get_available_modes()
        if not clasp_files:
            print(color_text("No modes found. Please ensure configuration files exist in the 'clasp_configs' directory.", BOLD + RED))
            sys.exit(1)

        # Build valid modes list
        valid_modes = list(clasp_files.keys())
        for keyword in ['dev', 'prod']:
            if any(mode.startswith(f"{keyword}-") for mode in valid_modes):
                valid_modes.append(keyword)

        parser = argparse.ArgumentParser(description="Build and deploy script.")
        parser.add_argument('-m', '--mode', choices=valid_modes, required=True, help='Deployment mode')
        parser.add_argument('-n', '--nobuild', action='store_true', help='Skip the build step')
        parser.add_argument('-f', '--force', action='store_true', help='Force push to overwrite manifest changes')

        args = parser.parse_args()

        # Single build step at the start
        if not args.nobuild:
            build_package()
        
        # Determine deployment modes and execute
        deployment_modes, is_multiple = get_modes_by_keyword(clasp_files, args.mode)
        if is_multiple:
            deploy_multiple_modes(deployment_modes, clasp_files, args)
        else:
            deploy_to_mode(deployment_modes[0], clasp_files, args)

        print(color_text("\nDeployment completed successfully!", BOLD + GREEN))
    except KeyboardInterrupt:
        print(color_text("\nScript execution interrupted by user (CTRL+C).", BOLD + YELLOW))
        sys.exit(1)
    except Exception as e:
        print(color_text(f"Script execution failed: {e}\n", BOLD + RED))
        sys.exit(1)

if __name__ == "__main__":
    main()