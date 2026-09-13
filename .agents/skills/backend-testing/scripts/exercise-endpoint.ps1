# Exercise Backend API Endpoint

param (
    [Parameter(Mandatory=$true)]
    [string]$Path,
    [string]$Method = "GET",
    [string]$Token = $null,
    [hashtable]$Body = $null,
    [int]$ExpectedStatus = 200,
    [string]$BaseUrl = "http://localhost:3000"
)

$uri = "$BaseUrl$Path"
Write-Host "Exercising API: $Method $uri" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

$params = @{
    Uri = $uri
    Method = $Method
    Headers = $headers
    UseBasicParsing = $true
}

if ($Body) {
    $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
}

try {
    $response = $null
    try {
        $response = Invoke-WebRequest @params
    } catch {
        if ($_.Exception.Response) {
            $response = $_.Exception.Response
        } else {
            throw $_
        }
    }

    $statusCode = 0
    $content = ""

    if ($response -is [System.Net.HttpWebResponse]) {
        $statusCode = [int]$response.StatusCode
        $streamReader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $streamReader.ReadToEnd()
        $streamReader.Close()
    } else {
        $statusCode = [int]$response.StatusCode
        $content = $response.Content
    }

    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "Status Code: $statusCode (Expected: $ExpectedStatus)" -ForegroundColor Green
    } else {
        Write-Host "Status Code: $statusCode (Expected: $ExpectedStatus)" -ForegroundColor Red
    }
    
    Write-Host "Response Content:" -ForegroundColor Gray
    try {
        $json = $content | ConvertFrom-Json
        $json | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        Write-Host $content
    }

    if ($statusCode -eq $ExpectedStatus) {
        Write-Host "`n[OK] Assertion PASSED: Status code matches $ExpectedStatus" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n[FAIL] Assertion FAILED: Expected $ExpectedStatus but got $statusCode" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Request failed with exception: $_" -ForegroundColor Red
    exit 1
}
