# ApowerSoft 运行环境

# 显卡驱动
360驱动大师/驱动精灵
https://dm.weishi.360.cn/home.html
https://www.drivergenius.com/

# .Net 运行时

4/.5/4.6.4.7

https://dotnet.microsoft.com/en-us/download/dotnet-framework/thank-you/net46-chs



# (C++ 运行时)

Visual C++ Redistributable Packages
https://aka.ms/vs/17/release/vc_redist.x86.exe
https://aka.ms/vs/17/release/vc_redist.x64.exe


# DirectX Runtime（DX运行时）

https://download.microsoft.com/download/8/4/A/84A35BF1-DAFE-4AE8-82AF-AD2AE20B6B14/directx_Jun2010_redist.exe

# 运行时错误

WPF程序无法启动，或者出现图标后一闪而过
Windows系统日志提示 Automation.Peer 时检查是是否存在更新 kb:5011048， 卸载重启就可以了

# FIPS 错误

C#日志提示

    2025-12-30 09:29:02,741 ERROR [27] [0] - LoadFile:System.TypeInitializationException: “Apowersoft.VideoEditor.Infrastructure.Extension.FileExt”的类型初始值设定项引发异常。 ---> System.InvalidOperationException: 此实现不是 Windows 平台 FIPS 验证的加密算法的一部分。

该错误核心原因是：Windows 启用了 FIPS（联邦信息处理标准）模式，而程序中使用了MD5CryptoServiceProvider（MD5 算法）—— 该算法未通过 FIPS 认证，在 FIPS 模式下会被系统禁止调用，进而导致FileExt类的静态构造函数（.cctor()）执行失败，触发TypeInitializationException类型初始化异常。
解决方案（按优先级 / 可行性排序）
方案 1：修改程序代码（根本解决，需源码）
替换非 FIPS 合规的 MD5 算法为合规算法（如 SHA-1、SHA-256），或使用兼容 FIPS 的实现方式：
csharp
运行
// 原错误代码（使用MD5CryptoServiceProvider）
using (var md5 = new MD5CryptoServiceProvider()) { /* ... */ }

// 替换方案1：使用FIPS合规的SHA256
using (var sha256 = new SHA256CryptoServiceProvider()) { /* ... */ }

// 替换方案2：若必须用MD5（仅哈希，非加密），使用兼容实现
// .NET 4.7+ 推荐方式（自动适配FIPS）
using (var md5 = MD5.Create()) { /* ... */ }
注意：若无法修改源码（如使用第三方程序），需用方案 2/3。
方案 2：禁用 Windows FIPS 模式（系统级，快速生效）
通过系统设置关闭 FIPS 验证，允许非合规算法运行：
组策略编辑器（推荐）
按下Win+R，输入gpedit.msc打开组策略；
导航到：计算机配置 > Windows 设置 > 安全设置 > 本地策略 > 安全选项；
找到并双击：系统加密：使用FIPS兼容的算法进行加密、哈希和签名；
选择已禁用，点击确定，重启电脑生效。
注册表修改（备用）
按下Win+R，输入regedit打开注册表编辑器；
定位到：HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\FipsAlgorithmPolicy；
修改Enabled键值：1（启用 FIPS）→ 0（禁用 FIPS）；
重启电脑生效。
方案 3：程序兼容性配置（仅.NET 框架程序）
若程序基于.NET Framework，可在app.config/web.config中添加 FIPS 兼容配置：
xml
<configuration>
  <runtime>
    <!-- 禁用FIPS运行时检查（.NET Framework 2.0+） -->
    <enforceFIPSPolicy enabled="false"/>
  </runtime>
</configuration>
补充说明
FIPS 模式的影响：FIPS 模式是 Windows 的安全策略，强制使用 NIST 认证的加密算法，MD5、RC4 等弱算法会被禁用；
风险提示：禁用 FIPS 模式可能降低系统加密安全性（仅影响非合规算法），若为企业环境，需确认安全策略允许；
第三方程序场景：若无法修改程序 / 系统设置，可联系软件厂商获取 FIPS 兼容版本。
验证方法
修改后重新运行程序，若不再抛出TypeInitializationException且FileExt类能正常加载，说明问题解决。

组策略修改
 1.按WIN+R（或点击开始-运行），并输入gpedit.msc后确定，启动组策略编辑器。
2.左侧列表中找到 计算机配置 - Windows设置 - 安全设置 - 本地策略 - 安全选项，并在右侧找到“系统加密：将FIPS兼容算法用于加密、哈希和签名”
3.双击上述策略，在弹出的选项中，将状态改为已禁用。
https://blog.csdn.net/song_jiang_long/article/details/54172711


