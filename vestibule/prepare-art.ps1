Add-Type -AssemblyName System.Drawing
$assetDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets'))
$artFiles = @(
    @('<dossier utilisateur>\.codex\generated_images\01a0d396-ee3a-7aa2-a790-42f3bee49b5f\exec-993a8203-ca28-451c-ae73-b90a6bdb0176.png', 'hall-accueil-v1.jpg'),
    @('<dossier utilisateur>\.codex\generated_images\01a0d396-ee3a-7aa2-a790-42f3bee49b5f\exec-2cb94474-2add-4422-a158-ceef5ad797bb.png', 'hall-portes-v1.jpg')
)
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
foreach ($art in $artFiles) {
    $picture = [Drawing.Image]::FromFile($art[0])
    $parameters = [Drawing.Imaging.EncoderParameters]::new(1)
    $parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]85)
    try { $picture.Save((Join-Path $assetDir $art[1]), $encoder, $parameters) }
    finally { $picture.Dispose(); $parameters.Dispose() }
}
Get-Item (Join-Path $assetDir 'hall-accueil-v1.jpg'), (Join-Path $assetDir 'hall-portes-v1.jpg') | Select-Object Name,Length
