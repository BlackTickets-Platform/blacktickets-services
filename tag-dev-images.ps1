param(
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

$repositories = @(
    "blacktickets-frontend",
    "blacktickets-identity-service",
    "blacktickets-event-service",
    "blacktickets-booking-service",
    "blacktickets-chatbot-service"
)

foreach ($repository in $repositories) {
    Write-Host "Checking $repository..."

    $sourceTag = aws ecr describe-images `
        --repository-name $repository `
        --region $Region `
        --query "sort_by(imageDetails[?imageTags!=null], &imagePushedAt)[-1].imageTags[0]" `
        --output text

    if (-not $sourceTag -or $sourceTag -eq "None") {
        Write-Warning "  No tagged image found. Skipping."
        continue
    }

    Write-Host "  Latest tagged image is $sourceTag"

    $manifest = aws ecr batch-get-image `
        --repository-name $repository `
        --region $Region `
        --image-ids imageTag=$sourceTag `
        --query "images[0].imageManifest" `
        --output text

    if (-not $manifest -or $manifest -eq "None") {
        Write-Warning "  Could not read manifest for $sourceTag. Skipping."
        continue
    }

    aws ecr put-image `
        --repository-name $repository `
        --region $Region `
        --image-tag dev `
        --image-manifest $manifest `
        --output json | Out-Null

    Write-Host "  Tagged $sourceTag as dev."
}
