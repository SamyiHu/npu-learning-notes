$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\hu\Desktop\WorkSpace\npu\video\npu-intro'
$lines = Get-Content -LiteralPath "$dir\narration.txt" -Encoding UTF8 | Where-Object { $_.Trim() -ne '' }
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft Huihui Desktop')
$synth.Rate = 0
$synth.Volume = 100
New-Item -ItemType Directory -Force -Path "$dir\audio" | Out-Null
$meta = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    $n = "{0:D2}" -f ($i + 1)
    $out = "$dir\audio\n$n.wav"
    $synth.SetOutputToWaveFile($out)
    $synth.Speak($lines[$i])
    $synth.SetOutputToNull()
    $meta += [PSCustomObject]@{ id = $n; text = $lines[$i]; file = "audio/n$n.wav" }
}
$synth.Dispose()
$meta | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath "$dir\audio\script.json" -Encoding utf8
"generated $($lines.Count) clips"

