# ffmpeg 笔记
---

## DTS 编码
ffmpeg 中的DTS使用的DCA 是属于实验性编码，需要指定-strict experimental 或者 -strict 2

---

## FLAC 编码
ffmpeg 默认的flac编码输出比原始的S16的WAV文件还大，需要手动指定压缩档次和编码类型 -sample_fmt s16 -compression_level 12

---

## MP2 编码(MPEG VOB格式)
MP2 允许的码率（ISO/IEC 11172-3）
MPEG-1 MP2（常用，32/44.1/48kHz）：
单声道：32、48、56、64、80、96、112、128、160、192 kbps
立体声：64、96、112、128、160、192、224、256、320、384 kbps

---

## MP3 编码
默认的mp3编码器为 libmp3lame


---

## 硬编码检测
ffmpeg 通过 -encoders -hide_banner 输出的只有当前程序预编译所支持的所有编码器，但是硬编码本身是依赖于硬件设备的，需要指定对应操作去检测设备是否可以支持


N卡检测
-v debug -init_hw_device cuda:hw -f null -

I卡检测
-v debug -init_hw_device qsv:hw -f null -

A卡检测
-v debug -init_hw_device amf:hw -f null -

如果输出的文本中还有failed就表示失败不支持


## libx264 编码
可以在crf 基础上加上 maxrate 和 bufsize 控制实际输出码率毕竟预设值


---

## qsv_h264 编码
通过-global_quality 预设输出qp值
不支持在预设qp值之后使用 maxrate 和 bufsize 控制实际输出码率毕竟预设值，需要配合 -b:v 控制输出码率


---


