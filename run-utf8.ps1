# UTF-8 인코딩 설정 후 Spring Boot 실행
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"
chcp 65001 | Out-Null
mvn spring-boot:run @args
