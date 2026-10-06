$sp = "C:\Users\abras\AppData\Local\Temp\claude\C--Users-abras-AppData-Roaming-Claude-scratch-workspaces-1814b548-7722-4d3f-bac2-b2df584ec987-bc68f2fc-5cb1-4ff7-910f-dbbda9fe2e70-scratch-2026-09-30-1d9358\31a4538d-8483-4a17-98f6-f44ac24a37ad\scratchpad"
$utf8 = New-Object Text.UTF8Encoding $false
$t = [IO.File]::ReadAllText("$sp\template.html", $utf8)
$logo = "data:image/png;base64," + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot "site\logo.png")))
# Só carros: mantém os registros ["c",...] e a tabela de baterias inteira
$raw = [IO.File]::ReadAllText("$sp\data.json", $utf8)
$cars = [regex]::Matches($raw, '\["c",[^\[\]]*\]') | ForEach-Object { $_.Value }
$bats = [regex]::Match($raw, '"b":(\{.*\})\}$').Groups[1].Value
$data = '{"v":[' + ($cars -join ',') + '],"b":' + $bats + '}'
"carros: $($cars.Count)"
$page = $t.Replace("__LOGO__", $logo).Replace("__DATA__", $data)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot "brasil-baterias.html"), $page, $utf8)
$full = "<!doctype html>`n<html lang=`"pt-BR`">`n<head>`n<meta charset=`"utf-8`">`n<meta name=`"viewport`" content=`"width=device-width, initial-scale=1, viewport-fit=cover`">`n<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>`n" + $page.Replace("<header class=`"top`">", "</head>`n<body>`n<header class=`"top`">") + "`n</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $PSScriptRoot "site\index.html"), $full, $utf8)
"ok"
