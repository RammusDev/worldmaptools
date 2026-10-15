# 資料授權與修改政策 / Data licensing policy

適用版本：v1.0.1。網站及 GitHub 的存取權限不因這份文件改變。

## 提供給使用者的資料

- 地圖角落顯示 geoBoundaries、Natural Earth 與 © OpenStreetMap contributors／ODbL 連結。
- 左側「資料來源與授權」列出已查詢圖層的提供者、原始授權、boundaryID、資料年份、來源更新日期、建置日期、原始下載與 metadata 連結。待審查而未載入的記錄會標示 blocked。
- `dist/sources.html` 提供雙語署名、授權文件、修改說明及隱私資訊，實際部署目錄也包含 `dist/licenses/`。
- `dist/data-sources.json` 記錄內附世界國界／台灣資料及 SHA-256，`dist/taiwan-source.json` 保留 geoBoundaries 原始 metadata。台灣 GeoJSON 另附 OSM／ODbL 通知。
- 地圖提供目前邊界 GeoJSON 與來源清單下載；不包含填色、圖示或自訂圖例說明。這與個人地圖存檔匯出是不同功能。
- `dist/data-modifications.json` 是機器可讀修改方法；算法實作亦隨前端提供。基於 ODbL 資料而產生、由本專案持有的衍生資料庫權利按 ODbL 1.0 提供；各原始資料仍保有其授權與權利。

## 載入規則與限制

目前辨識的資料授權是 Public Domain、PDDL 1.0、ODbL 1.0、CC0 1.0、CC BY 4.0、Etalab 2.0 與 dl-de/by-2-0。未知、缺漏或未列入支援清單的授權先不載入；這可能限制部分地區的拆分。程式不會把 NC／ND 等限制授權當作 CC BY 接受。

此規則依提供者 metadata 作技術判定，並不獨立證明每個來源的完整權利鏈，也不構成對所有司法管轄區的法律保證。新增授權種類前，需檢查其條件、相容性與署名模板。原始 metadata 的文字、版本、日期和 URI 都會保留，不能把 gbOpen 一律當成同一種原始授權。

德國圖層應提供 BKG／原提供者、dl-de/by-2-0 與資料 URI，並標明資料經修改。法國圖層應提供 IGN-F、來源及 supplied update date。資料可能經 geoBoundaries 簡化、代表點父區推算、裁切及合併，不暗示任何提供者背書。

## 程式與依賴

Leaflet 1.9.4 隨網站附帶，授權為 BSD-2-Clause。幾何程式庫改為固定版本的 Turf 7.2.0 所需子集；`tools/geometry-bundle/` 的 lockfile、entry 和 build script 可重建，並依實際 bundle inputs 產生每個 runtime package 的授權文字、版本及 bundle SHA-256。未使用的完整 Turf 模組不再分發於 v1.0.1。

重新建立：

```sh
npm --prefix tools/geometry-bundle ci --ignore-scripts
npm --prefix tools/geometry-bundle run build
npm test
```

不會因資料的 ODbL 條件而替所有自有程式碼套用同一授權。自有程式碼的授權選擇仍由擁有者決定。第三方程式保留自己的版權、條件與免責聲明。

公開儲存庫從已完成授權整理的 v1.0.1 快照開始。原有 v1.0.0 與舊提交留在擁有者的私人歷史備份，不包含於此公開儲存庫。公開不代表自有程式碼自動採用 MIT；第三方授權與資料庫條件分別適用。

## English summary

The map offers visible provider/OSM attribution, a loaded-layer provenance registry, bundled license texts and source hashes. Unknown or unsupported data licenses are blocked. Boundary exports contain geometry/provenance rather than private map markings. A machine-readable alteration method and current derivative geometry can be downloaded. Applicable derivative database rights based on ODbL inputs are offered under ODbL, while original licenses and unrelated software rights remain intact.

Leaflet is vendored. Geometry code is a reproducible subset of Turf 7.2.0 with a lockfile and notices generated from actual runtime bundle inputs. System fonts replace Google Fonts requests. The metadata gate is not an independent chain-of-title audit or a legal guarantee. The public repository starts from the reviewed v1.0.1 snapshot. Earlier history is retained separately in a private backup.

Official texts: [OSM](https://www.openstreetmap.org/copyright), [ODbL](https://opendatacommons.org/licenses/odbl/1-0/), [geoBoundaries](https://www.geoboundaries.org/api.html), [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/), [Germany](https://www.govdata.de/dl-de/by-2-0), [Etalab](https://github.com/etalab/licence-ouverte/blob/master/open-licence.txt).
