
Write-Host "Warming up Phi3 model..."
"Hello" | ollama run phi3:latest
Write-Host "Phi3 warmed up."

Write-Host "Warming up Mistral model..."
"Hello" | ollama run mistral:latest
Write-Host "Mistral warmed up."

Write-Host "Models are ready."
