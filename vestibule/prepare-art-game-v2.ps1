# Lossy delivery copies only; keep the generated PNGs as versioned sources.
Add-Type -AssemblyName System.Drawing
$assetDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets/game-v2'))
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($name in @('hall-game-v2', 'door-rouages-v2', 'door-cybertrax-v2', 'room-rouages-v2', 'room-cybertrax-v2')) {
    $source = Join-Path $assetDir ($name + '.png')
    $destination = Join-Path $assetDir ($name + '.jpg')
    $picture = [Drawing.Image]::FromFile($source)
    $parameters = [Drawing.Imaging.EncoderParameters]::new(1)
    $parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]84)
    try { $picture.Save($destination, $encoder, $parameters) }
    finally { $picture.Dispose(); $parameters.Dispose() }
}
Get-ChildItem -LiteralPath $assetDir -Filter '*-v2.jpg' | Select-Object Name,Length
