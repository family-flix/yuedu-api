import { assert, expect, test } from "vitest";

import { cleanHTML } from "../utils";

test("cleanHTML", () => {
  const html = `<html><head>
	<title>title</title>
	<style type="text/css">*{margin:0;padding:0;}body{width:100%;background:rgb(240,240,240);}a:link{color:rgb(41,31,193);text-decoration:none;}a:visited{color:rgb(41,31,193);}a:hover{text-decoration:underline;color:rgb(41,31,193);}.navitor{width:100%;background:rgb(100,100,100);}.navitor .navitor-main{margin-left:20px;}/*    .navitor ul li a{display:inline-block;margin:14px 5px;color:rgb(255,255,255);} */.navitor a:hover{color:rgb(240,240,240);}.search{width:100%;text-align:center;padding:20px 0px;margin-top:30px;}/* .search .search-main{} */.search .search-main .keyword{padding:10px;width:360px;outline:none;}.search .search-main button{padding:10px 30px;border:1px solid rgb(200,200,200);background:rgb(100,100,100);color:rgb(255,255,255);}.result-list{padding:80px 0px 0px 120px;}.result-list .result-item{float:left;clear:both;margin:10px 0px;}.result-list .result-item .result-game-item-pic{float:left;margin:0px 10px 0px 0px;}.result-list .result-item .result-game-item-pic img{width:110px;height:150px;}.result-list .result-item .result-game-item-detail{width:100%;font-size:14px;}.result-list .result-item .result-game-item-detail .result-item-title{font-size:18px;}.result-list .result-item .result-game-item-detail .result-item-title a{font-size:18px;text-decoration:none;color:rgb(50,50,50);font-weight:normal;}/* .result-list .result-item .result-game-item-detail .result-item-title a:visited{} *//*  .result-list .result-item .result-game-item-detail .result-item-title a:hover{} */.result-list .result-item .result-game-item-detail .result-game-item-info-tag{line-height:22px;}.search-result-page{width:100%;float:left;clear:both;text-align:center;padding:20px 0px;}/*.search-result-page .search-result-page-main{} */.search-result-page .search-result-page-main a{display:inline-block;padding:6px 10px;border:1px solid rgb(100,100,100);font-size:14px;margin:0px 3px;background:rgb(100,100,100);color:rgb(255,255,255);}/*.search-result-page .search-result-page-main a:visited{} *//* .search-result-page .search-result-page-main a:hover{} */.navitor-main {height: 40px;overflow: hidden; width: 980px;margin: 10px auto auto;}.navitor-main ul  {list-style-type: none;}.navitor-main ul li {float: left;line-height: 44px;}.navitor-main ul li a {color: #FFF;font-size: 15px;font-weight: 700;padding: 0 14px;}</style>
	<script>
	const something = a < 10;
	</script>
	<link rel="icon" type="image/svg+xml" href="/tools/assets/favicon.17e50649.svg">
	<script>
	const something = a > 10 || a < 10 && a >= 10;
	</script>
	<script type="module" crossorigin="" src="/tools/assets/index.1abc6cad.js"></script>
	<script>
	const something = a > 10 || a < 10 && a >= 10;
	</script>
	<link rel="stylesheet" href="/tools/assets/index.10ab2dcd.css">
	<body>
		<div>
		<h2>something</h2>
		<div>something</div>
		<div class="hel" w="" s=""> something </div> <div> h </div>
		</div>
	<!-- something -->
	</body>
	</html>`;

  const result = cleanHTML(html);

  expect(result).toBe(
    `<html><head><title>title</title><body><div><h2>something</h2><div>something</div><div class="hel" w="" s=""> something </div><div> h </div></div></body></html>`
  );
});
