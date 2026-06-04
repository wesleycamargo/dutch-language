#----------------------------------------------------------------------
# Post-create user configuration. All system dependencies are installed
# in the Dockerfile; this script handles user-level terminal setup only.
#----------------------------------------------------------------------

try {
  iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/wesleycamargo/terminal-bootstrap/refs/heads/master/terminal-setup.ps1'))
} catch {
  Write-Warning "terminal-bootstrap failed: $_"
  
}
