$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"

if (-not (Test-Path -LiteralPath $envPath)) {
    throw ".env dosyasi bulunamadi. Once '.env.example' dosyasini '.env' olarak kopyalayip degerleri duzenleyin."
}

$settings = @{}
foreach ($line in Get-Content -LiteralPath $envPath) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
        continue
    }

    $parts = $trimmed -split "=", 2
    if ($parts.Count -eq 2) {
        $settings[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$requiredKeys = @("POSTGRES_PASSWORD", "ADMIN_PASSWORD", "JWT_KEY")
foreach ($key in $requiredKeys) {
    if (-not $settings.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($settings[$key])) {
        throw "$key .env dosyasinda tanimlanmalidir."
    }
}

if ($settings["JWT_KEY"].Length -lt 32) {
    throw "JWT_KEY en az 32 karakter olmalidir."
}

Push-Location $repoRoot
try {
    docker build --tag secure-mail-analyzer-backend:latest backend/RubyApi
    docker build --tag secure-mail-analyzer-frontend:latest frontend

    kubectl apply -f k8s/namespace.yaml

    $connectionString = "Host=postgres;Port=5432;Database=ruby;Username=ruby;Password=$($settings['POSTGRES_PASSWORD'])"
    kubectl create secret generic ruby-secrets `
        --namespace ruby-app `
        --from-literal="postgres-password=$($settings['POSTGRES_PASSWORD'])" `
        --from-literal="admin-password=$($settings['ADMIN_PASSWORD'])" `
        --from-literal="jwt-key=$($settings['JWT_KEY'])" `
        --from-literal="connection-string=$connectionString" `
        --dry-run=client `
        --output yaml | kubectl apply -f -

    kubectl apply -k k8s
    kubectl rollout restart deployment/backend deployment/frontend --namespace ruby-app
    kubectl rollout status deployment/postgres --namespace ruby-app --timeout=180s
    kubectl rollout status deployment/backend --namespace ruby-app --timeout=180s
    kubectl rollout status deployment/frontend --namespace ruby-app --timeout=180s
    kubectl get pods,services,persistentvolumeclaims --namespace ruby-app
}
finally {
    Pop-Location
}
