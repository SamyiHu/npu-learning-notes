param([string]$ProjectDir)
$ffprobe = Join-Path $env:TEMP 'hf-tools\node_modules\@ffprobe-installer\win32-x64\ffprobe.exe'
$files = Get-ChildItem "$ProjectDir\audio\n*.mp3" -ErrorAction SilentlyContinue
if(-not $files){ $files = Get-ChildItem "$ProjectDir\audio\n*.wav" -ErrorAction SilentlyContinue }
$rows = @()
$t = 0.0
$files | Sort-Object Name | ForEach-Object {
    $id = [int]([IO.Path]::GetFileNameWithoutExtension($_.Name).Substring(1))
    $d = [double](& $ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 $_.FullName)
    $rows += [PSCustomObject]@{ id = $id; file = "audio/$([IO.Path]::GetFileName($_.Name))"; start = [math]::Round($t,2); dur = [math]::Round($d,2) }
    $t += $d + 0.40
}
$rows | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath "$ProjectDir\audio\timeline.json" -Encoding utf8
$json = $rows | ConvertTo-Json -Depth 4 -Compress
"total duration = $([math]::Round($t - 0.40, 2))s for $($rows.Count) clips"
