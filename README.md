## 本地
> 注意要清理

```PowerShell
Remove-Item .\.next\ -Recurse
Remove-Item .\node_modules\ -Recurse
docker rmi 9cats/caviar #删除镜像
docker build -t 9cats/caviar .
docker push 9cats/caviar
```

## 远程
> 注意切换到对应文件夹

```bash
docker stop caviar
docker rm caviar
docker rmi 9cats/caviar
docker-compose up -d
```