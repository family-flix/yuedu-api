import { expect, test } from "vitest";

import s from "../sources/sbooktxt";
import { BookSource } from "../../src/index";

// test("sbooktxt search", async () => {
//   const source = new BookSource(s, null);
//   const result = await source.search("生活系游戏");
//   source.destroy();

//   expect(result.Err()).toBe(null);
//   const value = result.Ok();
//   expect(value[1]).toStrictEqual({
//     id: "17_17180",
//     title: "生活系游戏",
//     url: "https://www.sbooktxt.com/17_17180/",
//     author: "吨吨吨吨吨",
//     cover: "https://www.sbooktxt.com/files/article/image/17/17180/17180s.jpg",
//     intro:
//       "【一份卖相不好的宫保鸡丁】从江枫无意中发现自己居然可以看到自家老爹炒出来的菜的备注开始，他的人生就已经发生了翻天覆地的变化……1.本游戏自由度极高，请玩家自行探索.2.本游戏不会干预玩家的任何选择，请玩家努力解锁成就.3.一切解释归游戏所有.群：781556003",
//   });
// }, 10000);

// test("sbooktxt fetch chapters", async () => {
//   const source = new BookSource(s, null);
//   const result = await source.chapters("17_17180");
//   source.destroy();

//   expect(result.Err()).toBe(null);
//   const value = result.Ok();
//   expect(value.length).toBe(946);
//   expect(value.slice(0, 2)).toStrictEqual([
//     {
//       id: "66095",
//       title: "第一章 游戏载入中",
//       url: "https://www.sbooktxt.com/17_17180/66095.html",
//     },
//     {
//       id: "66096",
//       title: "第二章 支线任务",
//       url: "https://www.sbooktxt.com/17_17180/66096.html",
//     },
//   ]);
// }, 10000);

test("sbooktxt fetch chapter", async () => {
  const source = new BookSource(s, null);
  const result = await source.chapter({
    book_id: "17_17180",
    chapter_id: "66095",
  });
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value.title).toBe("第一章 游戏载入中");
  expect(value.content).toBe(`【一张制作精良的假币】

江枫没有接钱，对着面前这位身材魁梧，顶着个光头满脸不耐烦的大汉略有歉意地笑了笑：“这位客人不好意思，现在没有零钱了，一百找不开。”

“找不开？”客人把钱抽回来，不情不愿地递给江枫一张二十元纸币，在接到找钱后还止不住骂骂咧咧了几句才离开小店。

“小枫，盒子里不是有零钱吗？”听到店里有动静，江枫的妈妈王秀莲同志从后厨探出头来询问。

“他给的是假钱。”江枫熟练地把桌子收拾干净，椅子摆放好，准备打烊。

“假钱？”王秀莲同志瞬间收起了脸上的笑容，就连原本的三下巴都因为脸部紧绷变成了双下巴，“哪儿来的小瘪三敢糊弄我儿子，他下次再敢来妈替你教训他！”

也是，以王秀莲同志的身形刚刚那种程度壮汉想必也不是她的对手。

“我们儿子可是大学生，怎么可能会被这种人糊弄到。”江枫的亲爹江建康同志顶着个增光的头顶，一只手一盘菜笑眯眯地从后厨走出来，“来来来，儿子，你最喜欢的宫保鸡丁。”

【一盘汗油混合的宫保鸡丁】

“我减肥。”江枫面无表情地拒绝，开始思考该怎么劝说自家亲爹在厨房里装个空调这个重要任务。

以江建康同志240斤的吨位，在这个季节天天呆在不足十平米的小厨房里也是苦了他了。

“好端端的学别人家小姑娘减什么肥，我儿子再长一百斤都不胖！”江建康这辈子最自豪的就是自己生了个又高又瘦改良他们江家基因的儿子，他爹生了五个儿子，有4个孙子2个孙女，除了小弟家那个只有9岁的女儿，就他儿子在二百斤以下。

江枫突然想到每年去爷爷家过年的时候一张大圆桌都坐不下七个人，女眷孙子辈的单独开一桌都坐不下的场景，决定保持沉默。

“来来来，吃肉！”江建康往江枫碗里夹了一大块肉。

“对，听你爸的，我儿子还需要减肥？”王秀莲同志应和道。

算了，为了父爱。

江枫认命地拿起了筷子。

“爸。”

“哎！”

“这天太热了，你在厨房里装个空调吧。”

……

吃完饭，江家一家三口接着收拾店铺，清理后厨，王秀莲同志和江建康留在店里清点食材，把江枫赶回家休息。

临走前，江枫还不忘看了眼自家的招牌。

【一块年久失修的招牌】

在一转身，江枫就看不到任何像备注一样的提示字了。

果然，得在自家店里才能看到是吗？

经过了两天的测试，江枫终于确定了这些奇怪的备注出现的范围。

“叮，恭喜玩家江枫激活游戏，游戏载入中，请稍等。”

一声清脆的女声，把江枫吓得一个激灵。

大约过了两分钟，清脆的女声再度响起：“载入成功，请玩家查询面板，自主探索，努力完成任务。”

江枫注意到右上角出现了一个小小的感叹号，鬼使神差地伸手一点，居然真的出现了一个属性面板。

玩家姓名：江枫

等级：0（0/100）

剩余经验值:0

技能：鉴定（初级）：你只能获得一些基础信息

主线任务：？？？（请玩家自行探索）

支线任务：无（在选择主线任务后激活）

成就：无

称号：无

道具：无

评价：一个初出茅庐的新手

游戏说明：

1.本游戏自由度极高，请玩家自行探索。

2.本游戏不会干预玩家的任何选择，请玩家努力解锁成就。

3.一切解释归游戏所有。

游戏？

这个属性面板看着，还真的挺像一个游戏的。

江枫伸手再点一下右上角的感叹号，面板就消失了。

看起来，还挺有趣的。

自行探索的话……

江枫就这么站在自家门口原地思考了起来。

还没理出个头绪，江枫就被王秀莲同志的大嗓门拉回了现实。

“小枫，你在门口傻站这干嘛？”王秀莲站在楼梯口问道，她和江建康同志两人一前一后站在这小小的楼梯的拐角，给人营造出一种把这个楼道堵的水泄不通之感。

“忘了带钥匙。”胡话随口就来。

“你这孩子，也不晓得打电话，等了多久了？”王秀莲同志上前开门，江枫连忙让开。

“对了，爸，我刚刚和你说在厨房装空调的事你是怎么想的。”江枫让江建康老同志先进，一边关门一边问道。

“没必要，这么多年都这样要啥空调。你二伯诊所那片地拆迁，他借了我们家七十万，我在你们学校边上买了个店铺，等你开学了我和你妈也一起过去了。”江建康不在意地说道，开始畅想未来生活，“你看看，我和你妈把店开过去多好，你还不用吃食堂了。我听你大堂哥说现在大学食堂可难吃了，什么西红柿炒月饼，那是人吃的吗？我和你妈……”

江枫甚至来不及思考江建康老同志才借二伯七十万就能买下学校边上寸土寸金的店铺，自家到底是多有钱这个决定自己能不能大学毕业闲在家里当肥宅这个关乎未来命运的事情，就听见熟悉的女声。

“叮，发现一条可选主线任务：【进击的小店】让健康炒菜馆在A大的知名度达到100。”

自己家现在小店的名字叫健康小吃。

“爸，你新店的名字准备叫什么？”江枫问道。

“名字？”江建康愣了愣，笑呵呵地说道：“健康炒菜馆，怎么样，不错吧！你妈还嫌弃这个名字土，咱们这种炒菜店就是要取这种通俗易懂的名字，取那些文绉绉的名客人都不愿意来。”

“这个店铺还是你大伯帮我们物色的，上下两层足足180平，本来钱不够我和你妈又不愿意贷款还想再看看，谁知你二伯诊所的拆迁款正好到了，借我们家七十万，正正好，你说巧不巧？”

巧，简直是太巧了。

江枫甚至都要怀疑是这个游戏计划好了的。

“你二伯也在我们家饭馆旁买了个店铺，这下好了，我们兄弟五个又在同一个城市了。新店的事情你不用担心，装修什么的你大伯都帮我们看着呢！”

江枫的几个叔伯原本都是在这个小城工作的，包括江枫在内江家的四个孙子辈的都是同一所小学，初中，高中毕业的。小时候除了江枫是正常人的体型，他的三个堂兄都是又高又壮，四兄弟在一起周边的小混混从来不敢招惹。

往上追溯，江枫的爷爷江卫国在退休之前是国营饭店的厨子，哪怕是在那个物资紧缺的年代也是一众瘦子中最显眼的那个胖子，连带着把江枫的奶奶和他爹还有四个叔伯也喂成了远近闻名的胖子，就连江枫小叔的两个女儿也隐隐能看出江家人的风范。

江家五兄弟，除了排行老三的江建康同志接了江卫国的班，后来因为国营饭店倒闭自己开了个小饭馆。老大江建国是个裁缝，因为在这个小城生意不景气，前几年借了一笔钱把裁缝铺开去了A市，现在也算是风生水起。老二江建党开了家小诊所，老四江建业和老五江建设在A市合伙开了家宠物店。

江枫想想以后几个叔伯婶婶还有三位堂兄和两个堂妹会经常来自家饭馆聚聚，就体会到了江建康同志要买一间面积大的铺子的良苦用心。

在客厅听江建康同志已经畅想到了未来孙子接手健康炒菜馆把饭馆发扬光大，王秀莲同志已经洗漱完毕来到客厅一脸嫌弃地打断他：“还不快去洗澡睡觉，都欠了二哥一屁股债了还在这和儿子吹牛！”

瞧瞧，王秀莲同志多么有上进心。

回到房间，江枫点开属性面板，面板已经变成了——

玩家姓名：江枫

等级：0（0/100）

剩余经验值:0

技能：鉴定（初级）：你只能获得一些基础信息

主线任务：1.（可选）【进击的小店】让健康炒菜馆在A大的知名度达到100【选择：是/否】

2.？？？（请玩家自行探索）

支线任务：无（在选择主线任务后激活）

成就：无

称号：无

道具：无

评价：一个初出茅庐的新手

江枫点击了是，主线任务就变成了：

1.【进击的小店】让健康炒菜馆在A大的知名度达到100，任务进度（0/100）。

任务提示：口碑是发展一家新店的关键，知名度的获得仅限于A大在校师生。

任务奖励：未知

在校师生啊……

对江建康同志的手艺江枫还是深有体会的，毕竟是干过国营饭店大厨的人，还有一个月A大就会开学，这条主线任务在江枫看来还是很好完成的。

至于请玩家自行探索，他还有一个月的时间好好探索。`);
}, 10000);

test("sbooktxt fetch chapter with incorrect tag match", async () => {
  const source = new BookSource(s, null);
  const result = await source.chapter({
    book_id: "84_84160",
    chapter_id: "226463",
  });
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value.title).toBe("第136章 秦墨做的，我楚墨就做不得？？");
  expect(value.content)
    .toBe(`“诸位有救驾之功，寡人不是一个吝啬之徒，许些财物，便赏赐诸君！”

“不过，你们不必拜谢，这些财物，算不得什么，将来寡人前往唐国，誓必生擒冒顿，全灭匈奴！到那个时候，在座的诸位，都可以封土称君也！”

所谓的这个封土，当然不是封诸侯，而是封侯，大汉除了诸侯国，还有很多的侯国，侯国类似于从前的封君，就是武安君，马服君这类的，有自己的食邑，但是没有自己的军队。

刘长小手一挥，栾布等人就开始为亲兵们分发赏赐，主要负责这件事的还是张不疑，张不疑这个人其他的事情不太靠谱，但是分发赏赐还是非常缜密的，按着不同的级别，有序的分发，保证没有人落下，让大家都心满意足。

这也是个本事，连召公都在这方面对张不疑颇为服气，也难怪张良称他为郡守之才，有这般本事，也确实能治好一郡。

校场内的亲兵们乐呵呵的领取了赏赐，看着上头那个小小的身影，纷纷拜谢，这大王实在是太合他们的口味了，原先他们在南军都不敢那么嚣张，可他们现在却能跟着刘长闯到曹参府邸里大闹，这是什么体验啊？？

原先被分为唐王亲兵的时候，不少人还对前程有些担忧，如今看来，只要跟随唐王，这什么都不缺啊！有的是建功立业的机会！

刘不害得到的赏赐最多，他有些惭愧的说道：“吾等寸功未立，却得大王如此厚爱。”

“谁说没有立功啊...诸君能跟随寡人闯曹府，这就是功啊！”

“不过，你们在这里，可不能荒废了武艺，我唐国三面是敌，百姓疾苦，未来少不了大仗！”

刘不害眼前一亮，拍着胸口，“大王放心吧，我会每日操练，将来，陪同大王出征匈奴！只要大王一声令下，您让我们往那里冲，我们都绝不退缩！”

“好，刘不害啊...你跟寡人来。”

甲士们开心的聊着天，刘长却带着刘不害走在校场内，三大舍人紧跟其后，生怕一不小心大王就没了。

刘长认真的说道：“你不要把他们当作甲士来操练...要把他们当作将领。”

“我知道你原先的官职很高，在南军任校尉....这件事，只能是交给你来办。”

“唐国百姓疾苦，寡人不能每次打仗都动用唐国百姓，不然，唐国就更加贫穷了，你有所不知啊，我大唐百姓到现在也是食不果腹，衣不蔽体啊...因此，寡人需要一支常备军，就像南北军那样。”

“大王说的对！就该如此！！”

张不疑急忙说道。

刘长却没有理会他，只是看着刘不害，问道：“你觉得呢？”

刘不害认真的说道：“大王所想的是对的，匈奴战马士卒甚多，想要击败他们，要避开人数上的劣势，操练一支精锐的士卒，以一当十，方有胜算。”

“臣曾跟随高祖讨伐匈奴，匈奴之战法，与大汉截然不同...”

听到刘不害的话，召平都没有再反对，毕竟唐国是要守国门的，而匈奴之强大，众人也早就体会过了，没有常备军，只能被动挨打，很难主动讨伐，而且每次交战，都会影响到国力，征战几年，可能唐国就要废了。

“很好，到时候，这五百人，就要分发到那新军之中，成为顶梁柱！”

刘长激动的说着，又问道：“你们说，这常备军该叫什么名字啊？”

虽然觉得现在谈论这个有点太早，但是看到大王这么有兴趣，刘不害还是很配合的询问道：“大王觉得呢？”

“无敌军？神军？霸王军？你们觉得如何？”

“额...唐国在西，不如唤作西军。”

“西军？不成，不成，不知道的还以为寡人不会取名，需要去抄南北军呢！”

随后，刘长又展现了一番自己那奇特的与众不同的取名方式，众人终于意识到：将来无论弄出什么东西，都不能让大王来取名。

在赏赐了亲兵们之后，刘长决定去看看那些墨者有没有把东西捣鼓出来。

他执意要领着亲兵们前往，栾布无奈的说道：“大王啊...您这几天，实在太招摇，这样容易被群臣记恨...还是收敛些吧，若是要带，就带二十人...”

“怕什么，陛下不还赏赐了寡人吗？都带出去！”

刘长可不管这个，愣是带着大部队就赶往了尚方的那座府邸。

当刘长进去的时候，墨者正在捣鼓着一台全新的水车，这水车运用了多动力，除却水力之外，还可以通过拉动的方式来使其转动，同时，他们把竖轮改进成了卧轮，减少了几组齿轮，并且重新设计了一套全新的运水装置。

刘长很是激动，来回的查看着。

陈陶别过头去，不看这个狡诈残暴之人。

唯独那位老秦墨，是非常服从的。

“老丈如何称呼？”

“老夫赵朔，拜见大王。”

“哎，你不要总是拜啊，你这个年纪，是不必参拜的...反而是寡人该拜你。”

“赵老丈是秦墨？”

那老人眼里满是惊恐，他急忙哀求道：“大王饶命啊...我刚从牢狱内出来，我已经与暴秦没有任何关系了...我...”，老人害怕的颤抖了起来，几乎落泪：“老夫与他们也不相识，只是因为同为墨者，故而收留....我已几次入狱，都说我与暴秦有勾结，我实在是没有啊...我从不曾作恶...”

刘长笑着握住他的手，“老丈勿要害怕，寡人稍后便下令，赦免您过往的罪行，既往不咎！从今日起，您便没有任何罪行了！可以放心了！”

“栾布！拿笔来！”

刘长当着赵朔的面前，亲自写下对他的赦免令，然后交给了他。

“拿着吧，有这东西，以后别说地方官吏，便是曹丞相，也得敬你三分！”

赵朔颤抖着拿着手里拿赦令，一句话都说不出来，只是默默的流着泪。

“好了，老丈，莫要悲伤了，我看啊，这楚墨是完蛋了，这振兴墨家的事情啊，就靠你们秦墨啦！”

“你还有认识的秦墨吗？都可以带过来！”

“有...有...可，都在服刑...”

“不就是捞人嘛...栾布！这件事你最熟，你来办！将他们都解救出来，修养一段时间...这些人寡人将来都是要接到唐国去的，你要好好照顾！”

“唯！”

栾布带着赵朔离开了，赵朔几次想要跪拜，刘长只是挥着手，“拜什么拜，我就是把你们弄出来为我所用而已，若是无用，我也不会救，去吧，去吧！”

送走了这老头，刘长傲然的看着面前的楚墨。

陈陶盯着他，叫道：“东西已做好！你要杀便杀！修想羞辱我们！”

刘长叫道：“栾...刘不害，给我将这些人揍一顿！”

刘不害直接就上了，楚墨哪里是这些精锐的对手，几下就被打翻，亲兵们下手也是厉害，这些人被打的灰尘乱飞，时不时惨嚎着。

“好了！带上来吧！”

士卒们押解着他们来到了刘长的面前，刘长傲然的看着他们，说道：“这一顿打，不是我打的，是我代替墨子打的！都是墨家，你们这几十个还不如人家一个呢！斗强好胜，为虎作伥，做事不用脑，想着要天下没有战乱的墨家，居然会为一个蛊惑诸侯谋反的野心家做事，这是多大的讽刺？若是墨子再生，看到你们这样的墨，非一个个宰了你们！”

“好了，都滚吧！滚！”

刘长骂着，甲士们也放开了他们。

陈陶脸色通红，有些不敢相信刘长就这么放了他们，他有些憋屈的问道：“大王用秦墨，为何却要逐楚墨？”

“废话，你们几十个都不如人家一个，留下来有什么用？养着还废我钱财，你们简直不配为墨！”

“秦墨做的，我楚墨就做不得？若是吾等没有相助，秦墨那老匹夫能独自做成嘛？？大王欺人太甚！”

陈陶愤怒的叫着。

`);
}, 10000);
