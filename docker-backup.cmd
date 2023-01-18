@echo off
SETLOCAL ENABLEEXTENSIONS
SETLOCAL ENABLEDELAYEDEXPANSION

SET BASE_DIR=%CD%
for /F %%i in ("%BASE_DIR%") do @set BASE_NAME=%%~ni
call set PREFIX=%%BASE_NAME:_=%%

rem echo %BASE_DIR% %BASE_NAME% %PREFIX% %~1 %~2

if "%~1"=="backup" (
  if "%~2"=="" (
    call :backup
  ) else (
    call :backup_one %~2%
  )
)
if "%~1"=="restore" (
  if "%~2"=="" (
    call :restore
  ) else (
    call :restore_one %~2%
  )
)

exit /B 0

:restore
for %%f in (%BASE_DIR%/_backup/*.tar.gz) do (
  for /F %%i in ("%%~nf") do @set NAME=%%~ni
  echo restoring !NAME!
  call :restore_one !NAME!
)
exit /B 0

:restore_one
docker run -v %PREFIX%_%1%:/data -v %BASE_DIR%\_backup:/backup --rm  busybox /bin/sh -c "cd /data rm -rf * && tar xfz /backup/%1%.tar.gz"
exit /B 0

:backup
for /F %%v in ('docker volume ls -q --filter "name=%PREFIX%_"') do (
  set VOLUME=%%v
  call set NAME=%%VOLUME:!PREFIX!_db_=%%
  echo backing up !NAME!
  call :backup_one !NAME!
)
exit /B 0

:backup_one
docker run -v %PREFIX%_%1%:/data:ro -v %BASE_DIR%/_backup:/backup --rm busybox /bin/sh -c "cd /data && tar -czf /backup/%1%.tar.gz *"
exit /B 0
