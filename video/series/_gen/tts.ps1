param([string]$ProjectDir)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voice = 'Microsoft Huihui Desktop'
$lines = Get-Content -LiteralPath "$ProjectDir\narration.txt" -Encoding UTF8 | Where-Object { $_.Trim() -ne '' }
New-Item -ItemType Directory -Force -Path "$ProjectDir\audio" | Out-Null
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice($voice)
$synth.Rate = -1
$synth.Volume = 100
for ($i = 0; $i -lt $lines.Count; $i++) {
    $n = "{0:D2}" -f ($i + 1)
    $out = "$ProjectDir\audio\n$n.wav"
    $synth.SetOutputToWaveFile($out)
    $synth.Speak($lines[$i])
    $synth.SetOutputToNull()
}
$synth.Dispose()
"generated $($lines.Count) clips in $ProjectDir"
