# EpicGames 自动白嫖每周免费游戏
![image](https://user-images.githubusercontent.com/4411977/74479432-6a6d1b00-4eaf-11ea-930f-1b89e7135887.png)

## 使用过程
0. 先给这个仓库来个Star（笑
1. 下载[DeviceAuthGenerator](https://github.com/xMistt/DeviceAuthGenerator/releases/)
2. 运行程序,在出现的页面里登录Epic账户,然后授权。完成后会出现一个 `device_auths.json`文件
3. Fork或者手动导入这个Repo,看你喜好(防止被Github一锅端)
4. 启用Actions,新建一个叫做`AUTH_JSON`的Secret,并将之前的`device_auths.json`文件内容粘贴进去。
5. 修改.github/workflows/claim.yml文件,改改自动领取时间什么的。

# 致谢
感谢Revadike大佬的[epicgames-freebies-claimer](https://github.com/Revadike/epicgames-freebies-claimer),本Repo是在他程序的基础上修改而来的。