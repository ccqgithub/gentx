# GentX: [RxJS](https://github.com/ReactiveX/RxJS)辅助数据流管理工具。

> 使用[RxJS](https://github.com/ReactiveX/RxJS)更好地管理数据流。

> 使用此工具时请确保你已经会使用[RxJS](https://github.com/ReactiveX/RxJS)。

## 安装使用

安装：

```sh
npm i rxjs gentx -S
```

使用：

```js
import {
  catchError,
  logGuard,
  makeObservable,
  groupFlows,
  flowSource,
  flowSources
} from 'gentx';
```

## 概念

> 这里的概念指`gentx`新加入的概念，其他rxjs的概念请看[RxJS文档](http://reactivex.io/rxjs/manual/overview.html), 或[RxJS文档2](https://robin-front.gitbooks.io/rxjs-doc-chinese/content/why_rxjs.html), 或[RxJS中文文档](https://cn.rx.js.org/manual/index.html)。

### 0：GentX的数据理念

GentX想应用中数据管理的所有部分分为三个部分：

- 数据存储：自定义数据Store，LocalStore，SessionStore，Cookie等…
- 数据流动变换：将一定事件循环内的所有数据变换抽象为数据的流动，比如点击添加用户按钮的过程，会产生这样一个数据流： `点击按钮` => `参数封装器` => `接口请求器` => `结果处理器` => `数据Store` => `UI`。
- 数据反应：数据改变是产生一些副作用。

### 1：动态数据源：Source

> `动态数据源`

### 2：数据流：Flow

> `动态数据源`

### 3：数据流组：Flow Group

> `动态数据源`

### 4：数据流守卫：Flow Guard

> `动态数据源`

## API

### `makeObservable`

### `groupFlows`

### `flowSource`

### `flowSources`

### `logGuard`

## 推荐目录结构

```
----data           ## 所有数据相关存在data目录
  |---- apis       ## api请求
  |---- sources    ## 动态数据源
  |---- flows      ## 数据流
  |---- flowGroups ## 数据流组
  |---- stores     ## 数据存储
```

## 推荐和其他工具配合使用

