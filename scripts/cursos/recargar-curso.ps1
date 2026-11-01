# Recarga un curso pedagogico en el servidor, como lo haria el docente desde la aplicacion.
#
# Uso (desde cualquier carpeta, en PowerShell):
#   .\scripts\cursos\recargar-curso.ps1
#   .\scripts\cursos\recargar-curso.ps1 -Curso pensamiento
#
# Pide el correo y la contrasena del docente: la contrasena se escribe oculta, no queda en el historial ni en
# ningun archivo, y solo vive en esta ventana mientras corre el comando. Nada de esto se sube al repositorio.
# Al terminar, lo util para compartir son las ultimas lineas (ejercicios nuevos y actualizados): nunca la contrasena.
#
# Que hace: crea lo que falte y, con -Actualizar (por defecto), actualiza el texto de las lecciones, los enunciados y el
# codigo de partida y los casos de los ejercicios que todavia no tienen entregas de estudiantes (el servidor no deja
# cambiar los que ya tienen entregas, y el programa los cuenta aparte). Ver scripts/cursos/crear-cursos.ts.
param(
  [string]$Api = 'https://stire-unicor.duckdns.org',
  [ValidateSet('fundamentos', 'pensamiento')][string]$Curso = 'fundamentos',
  [switch]$SinActualizar
)

$ErrorActionPreference = 'Stop'
# La raiz del proyecto es dos carpetas arriba de este archivo (scripts/cursos).
Set-Location (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))

$correo = Read-Host 'Correo del docente'
$clave = Read-Host 'Contrasena del docente (no se ve al escribir)' -AsSecureString
$puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clave)
try {
  $env:STIRE_API = $Api
  $env:DOCENTE_EMAIL = $correo
  $env:DOCENTE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero)
  $argumentos = @('-r', 'tsconfig-paths/register', 'scripts/cursos/crear-cursos.ts', $Curso)
  if (-not $SinActualizar) { $argumentos += '--actualizar' }
  npx ts-node @argumentos
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero)
  Remove-Item Env:DOCENTE_PASSWORD, Env:DOCENTE_EMAIL, Env:STIRE_API -ErrorAction SilentlyContinue
}
