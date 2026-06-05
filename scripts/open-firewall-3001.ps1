# Allow inbound TCP 3001 so phones on Wi-Fi can open the Next app (run PowerShell as Administrator).
$ruleName = "NEXA Next.js 3001"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
} else {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001
  Write-Host "Created firewall rule: $ruleName"
}
Write-Host "Phones can use http://YOUR_WIFI_IP:3001/s/your-slug (see ipconfig)"
