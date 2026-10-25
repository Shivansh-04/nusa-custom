param([string]$CmdFile)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($op, $type) {
  $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
  [void]$t.Wait(-1)
  $t.Result
}

[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
[void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType = WindowsRuntime]
$mgr = Await ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])

function Emit {
  try {
    $s = $mgr.GetCurrentSession()
    if (-not $s) { '{"none":true}'; return }
    $p = Await ($s.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
    $tl = $s.GetTimelineProperties()
    @{
      none   = $false
      title  = $p.Title
      artist = $p.Artist
      app    = $s.SourceAppUserModelId
      status = $s.GetPlaybackInfo().PlaybackStatus.ToString()
      pos    = [math]::Round($tl.Position.TotalSeconds)
      dur    = [math]::Round($tl.EndTime.TotalSeconds)
    } | ConvertTo-Json -Compress
  } catch { '{"none":true}' }
}

$i = 0
while ($true) {
  $force = $false
  if ($CmdFile -and (Test-Path $CmdFile)) {
    $c = (Get-Content $CmdFile -Raw).Trim()
    Remove-Item $CmdFile -Force
    $s = $mgr.GetCurrentSession()
    if ($s) {
      try {
        switch ($c) {
          'toggle' { [void](Await ($s.TryTogglePlayPauseAsync()) ([bool])) }
          'next'   { [void](Await ($s.TrySkipNextAsync()) ([bool])) }
          'prev'   { [void](Await ($s.TrySkipPreviousAsync()) ([bool])) }
        }
      } catch {}
    }
    Start-Sleep -Milliseconds 150
    $force = $true
  }
  if ($force -or ($i % 4 -eq 0)) { Emit }
  $i++
  Start-Sleep -Milliseconds 250
}