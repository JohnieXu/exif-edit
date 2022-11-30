# exif-edit

一款基于 vue 的图片 exif 数据编辑器组件。

An exif data edtior component with javascript(based on vue).

<p align="center">
  <img src="./docs/imgs/7.jpg" alt="7.jpg" width="400" />
</p>

## 安装依赖
```
yarn install
```

### 开发环境启动
```
yarn serve
```

### 构建打包 demo 应用
```
yarn build:app
```

### 构建打包组件
```
yarn build:lib
```

### 构建打包 web-component
```
yarn build:wc
```

### 代码检查
```
yarn lint
```

## 生产环境启动

### 方式一：Node.js 使用静态资源提供 web 服务

```bash
npm run build:app
cd dist/
npx http-server .
```

### 方式二：Docker 镜像

```bash
npm run build:docker # 构建镜像
docker run -itd --name exif-edit --restart always -p 8080:80 exif-edit:latest
```

### 方式三：Docker Compose 一键启动

```bash
docker-compose up -d
```

修改了代码后需要重新构建镜像 `--build`，并且需要先执行完 `npm run build:app`

```bash
docker-compose up -d --build
```

## 打包发布

### 发布 Docker 镜像

```bash
docker tag johniexu/exif-edit:latest johniexu/exif-edit:latest
docker push johniexu/exif-edit:latest
```

## 效果预览

<p align="center">默认状态</p>

![1.jpg](docs/imgs/1.jpg)

<p align="center">显示 Exif 数据</p>

![2.jpg](docs/imgs/2.jpg)

<p align="center">编辑 Exif 数据</p>

![3.jpg](docs/imgs/3.jpg)

<p align="center">校验不支持格式的图片</p>

![4.jpg](docs/imgs/4.jpg)

<p align="center">校验无 Exif 数据</p>

![5.jpg](docs/imgs/5.jpg)

<p align="center">读取的图片无 Exif 数据</p>

![6.jpg](docs/imgs/6.jpg)
