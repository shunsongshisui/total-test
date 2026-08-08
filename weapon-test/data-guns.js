/* =====================================================================
   本命武器测试 · 热武器库（手枪 / 冲锋枪 / 步枪 / 霰弹枪 / 狙击枪 / 机枪 / 特种火器）
   条目格式：{ id, n(中文名), en(原名), sub(子类key), lore(一句小传), phrase(一句性格), stats?(稀疏覆盖) }
   名枪对个别维度做稀疏覆盖，避免同子类退化为同一条距离。
   ===================================================================== */
(function () {
  'use strict';
  var W = window.WEAPON_DATA;

  /* ==================== 半自动手枪 ==================== */
  var pistolSemi = [
    { id: 'g001', n: '格洛克 17', en: 'Glock 17', sub: 'pistol_semi', lore: '1982 年奥地利人加斯通·格洛克设计，聚合物枪身比钢枪轻一截，弹匣 17 发，全球销量数千万支，军队警察都在用。', phrase: '简单、可靠，近乎无聊，但赢了。', stats: { speed: 64, mobility: 66 } },
    { id: 'g002', n: 'M1911', en: 'M1911', sub: 'pistol_semi', lore: '约翰·勃朗宁设计，.45 口径百年经典，二战美军的灵魂。', phrase: '岁月磨不掉的枪。', stats: { power: 56, era: 82 } },
    { id: 'g003', n: '伯莱塔 92F', en: 'Beretta 92F', sub: 'pistol_semi', lore: '意大利制式，美军选作 M9 用了三十年，开闭锁卡铁简单，沙漠里打进砂子还能退弹。', phrase: '意大利式的可靠。' },
    { id: 'g004', n: 'HK USP', en: 'HK USP', sub: 'pistol_semi', lore: '1993 年的模块化手枪，保险、扳机、握把都能换，德国警察与各国特工长期在册。', phrase: '无懈可击的德式严谨。', stats: { precision: 76 } },
    { id: 'g005', n: 'SIG P226', en: 'SIG P226', sub: 'pistol_semi', lore: '1980 年美军"手枪竞标"输给伯莱塔，被特警与特工收走，25 米内散布常在一掌之内。', phrase: '准，是它的修养。', stats: { precision: 78 } },
    { id: 'g006', n: 'CZ 75', en: 'CZ 75', sub: 'pistol_semi', lore: '1975 年捷克斯洛伐克造的，握把角度跟手型贴合，双动首枪加单动连发，被当手枪里的经典，各国仿过不少。', phrase: '一握，就是为你的手而生。' },
    { id: 'g007', n: '沙漠之鹰', en: 'Desert Eagle', sub: 'pistol_semi', lore: '.50 口径猛兽，后坐力与名气一样大，开一枪全世界都看过来。', phrase: '我的存在本身，就是威慑。', stats: { power: 88, speed: 40, precision: 76, mobility: 48 } },
    { id: 'g008', n: 'FN 五七', en: 'FN Five-seveN', sub: 'pistol_semi', lore: '和 P90 共用 5.7×28mm 弹，弹头重 2 克出头，初速却接近步枪，能打穿软质防弹衣。', phrase: '小口径，大野心。' },
    { id: 'g009', n: 'HK VP70', en: 'HK VP70', sub: 'pistol_semi', lore: '聚合物枪身的先驱，三连发点射的七十年代设想。', phrase: '七十年代，就敢想未来。' },
    { id: 'g010', n: '瓦尔特 PPK', en: 'Walther PPK', sub: 'pistol_semi', lore: '1931 年的紧凑型，全枪不到 600 克，007 在小说里选了它，西装口袋里放得下。', phrase: '优雅的威胁。', stats: { mobility: 70 } },
    { id: 'g011', n: 'SIG P320', en: 'SIG P320', sub: 'pistol_semi', lore: '模块化套件，美军新一代制式 M17 的原型。', phrase: '时代的答案，由它来写。' },
    { id: 'g012', n: '92 式手枪', en: 'QSZ-92', sub: 'pistol_semi', lore: '中国现役制式手枪，5.8mm 口径，轻便利落。', phrase: '轻装上阵，足够快。' },
    { id: 'g013', n: '勃朗宁大威力', en: 'Browning Hi-Power', sub: 'pistol_semi', lore: '13 发大弹匣的半自动，从二战一直打到现代。', phrase: '装得多，赢得稳。' },
    { id: 'g014', n: 'S&W M&P', en: 'S&W M&P', sub: 'pistol_semi', lore: '美国主流警用手枪，握把可换，适配每只手。', phrase: '给每个手掌的答案。' },
    { id: 'g015', n: '托卡列夫 TT-33', en: 'TT-33', sub: 'pistol_semi', lore: '苏军老枪，结构简单，穿透力强。', phrase: '钢铁时代的简洁。', stats: { era: 82 } },
    { id: 'g016', n: '马卡洛夫 PM', en: 'Makarirov PM', sub: 'pistol_semi', lore: '苏军小巧制式手枪，贴身防护的一把好手。', phrase: '小，但从不失手。' },
    { id: 'g017', n: 'HK P7', en: 'HK P7', sub: 'pistol_semi', lore: '挤压握把才击发的独特手枪，安全与速度兼得。', phrase: '握紧它，它才醒。' },
    { id: 'g018', n: '格洛克 19', en: 'Glock 19', sub: 'pistol_semi', lore: 'G17 的紧凑版，握把短一截、弹容量少两发，却成了全球警用与隐蔽携枪的主流。', phrase: '藏在身上，随时在场。' }
  ];

  /* ==================== 左轮手枪 ==================== */
  var pistolRev = [
    { id: 'g019', n: '柯尔特蟒蛇', en: 'Colt Python', sub: 'pistol_revolve', lore: '1955 年上市的 .357 左轮，手工装配合膛，20 世纪后半被当收藏品，估价翻了几十倍。', phrase: '优雅与杀意并存。', stats: { precision: 76 } },
    { id: 'g020', n: 'S&W M29', en: 'S&W Model 29', sub: 'pistol_revolve', lore: '.44 马格南，克林特·伊斯特伍德"脏哈利"的招牌。', phrase: '感觉幸运吗？，这是它的台词。', stats: { power: 68 } },
    { id: 'g021', n: 'S&W M500', en: 'S&W Model 500', sub: 'pistol_revolve', lore: '2003 年上市的 .500 口径左轮，一发弹的动能比 .44 马格南翻倍，后坐力能把枪口往上抛，多数人打两发就收手。', phrase: '后坐力，是它的签名。', stats: { power: 92, speed: 36 } },
    { id: 'g022', n: '柯尔特和平缔造者', en: 'Colt Peacemaker', sub: 'pistol_revolve', lore: '1873 年柯尔特出厂的单动左轮，美军骑兵订购，西部的牛仔、警长人手一把，掏枪快慢就是生死的差距。', phrase: '西部只有一个规矩。', stats: { era: 74 } },
    { id: 'g023', n: '纳甘 M1895', en: 'Nagant M1895', sub: 'pistol_revolve', lore: '俄式转轮，气密封口，声音小得不像话。', phrase: '老，但有自己的脾气。' },
    { id: 'g024', n: '韦伯利 Mk VI', en: 'Webley Mk VI', sub: 'pistol_revolve', lore: '英军左轮，两次世界大战的老兵，折装得像刀一样利落。', phrase: '帝国的规矩，由它执行。' },
    { id: 'g025', n: '鲁格 GP100', en: 'Ruger GP100', sub: 'pistol_revolve', lore: '1985 年美国鲁格出的不锈钢左轮，整体铸件耐折腾，靶场打了几万发还在服役，老枪民里口碑稳。', phrase: '皮实到能传三代。' },
    { id: 'g026', n: '犀牛左轮', en: 'Chiappa Rhino', sub: 'pistol_revolve', lore: '枪管对准六点方向，把后坐力的上跳掰下来。', phrase: '连后坐力都替你着想。' },
    { id: 'g027', n: 'S&W M686', en: 'S&W Model 686', sub: 'pistol_revolve', lore: '1981 年史密斯韦森出的 .357 左轮，L 型框架比老款抗造，靶场精确、警用实用，两样都占。', phrase: '靶场与街头都认它。' },
    { id: 'g028', n: '柯尔特侦探特供', en: 'Colt Detective Special', sub: 'pistol_revolve', lore: '便衣警察的袖中枪，短到能塞进口袋。', phrase: '别小看口袋里的它。', stats: { mobility: 68 } }
  ];

  /* ==================== 冲锋枪 ==================== */
  var smg = [
    { id: 'g029', n: 'HK MP5', en: 'MP5', sub: 'smg_smg', lore: '德国 HK 造的，滚柱延迟闭锁、闭膛待击，连发时枪身不乱跳，1970 年代反恐部队和特警都用它破门。', phrase: '安静地，把事办完。', stats: { precision: 72 } },
    { id: 'g030', n: '乌兹', en: 'Uzi', sub: 'smg_smg', lore: '1950 年代以色列人手忙脚乱造的，机匣直接冲压成型，零件少，进沙进泥照样能搂火。', phrase: '简单，即真理。' },
    { id: 'g031', n: '汤普森冲锋枪', en: 'Thompson M1928', sub: 'smg_smg', lore: '芝加哥打字机，.45 口径的咆哮，禁酒令时代的声音。', phrase: '大萧条时代的声音。', stats: { power: 62, era: 82 } },
    { id: 'g032', n: 'MP40', en: 'MP40', sub: 'smg_smg', lore: '二战德军冲锋枪，机匣冲压焊接，省钢省工时，到 1945 年造了一百多万支。', phrase: '打得很省，死得很准。', stats: { era: 82 } },
    { id: 'g033', n: '波波沙 PPSh-41', en: 'PPSh-41', sub: 'smg_smg', lore: '苏联 71 发弹鼓，冬季战线上的火力之海。', phrase: '一片弹雨，就是一段历史。', stats: { speed: 90 } },
    { id: 'g034', n: 'MAC-10', en: 'MAC-10', sub: 'smg_smg', lore: '1970 年代美国造的袖珍全自动，射速一分钟一千二百发，一梭 30 发两秒多就打完，适合抵近招呼。', phrase: '小个子，大脾气。' },
    { id: 'g035', n: 'KRISS Vector', en: 'KRISS Vector', sub: 'smg_smg', lore: '独特后坐力缓冲系统，让连发听话得像点射。', phrase: '把后坐力驯服给你看。' },
    { id: 'g036', n: '蝎式', en: 'Skorpion', sub: 'smg_smg', lore: '捷克斯洛伐克微型冲锋枪，小得能藏进公文包。', phrase: '藏在公文包里的獠牙。' },
    { id: 'g037', n: '斯登', en: 'Sten', sub: 'smg_smg', lore: '英国二战简易冲锋枪，便宜到能当消耗品。', phrase: '便宜，但不代表好欺负。', stats: { era: 82 } },
    { id: 'g038', n: '百式冲锋枪', en: 'Type 100', sub: 'smg_smg', lore: '1940 年日军列装，是帝国唯一量产冲锋枪，造到战争结束才两万多支，弹药还是手枪弹。', phrase: '迟到的答案。' },
    { id: 'g039', n: '伯莱塔 M12', en: 'Beretta M12', sub: 'smg_smg', lore: '1959 年意大利伯莱塔出品，枪身短、后坐柔和，意大利军警用了好几十年。', phrase: '地中海的果断。' },
    { id: 'g040', n: 'HK UMP45', en: 'HK UMP45', sub: 'smg_smg', lore: '.45 口径冲锋枪，重型弹头，声音低沉。', phrase: '重型弹头，轻轻落地。' }
  ];

  /* ==================== 个人防卫武器 ==================== */
  var pdw = [
    { id: 'g041', n: 'FN P90', en: 'FN P90', sub: 'smg_pdw', lore: '1990 年比利时 FN 造的，弹匣横放在枪管上方装 50 发，5.7mm 弹能穿软质防弹衣，无托设计短小。', phrase: '未来，已经开火。', stats: { mobility: 74 } },
    { id: 'g042', n: 'HK MP7', en: 'HK MP7', sub: 'smg_pdw', lore: '4.6mm 穿甲弹，比手枪大不了多少。', phrase: '口袋里的穿透力。' },
    { id: 'g043', n: 'QCW-05', en: 'QCW-05', sub: 'smg_pdw', lore: '中国 05 式微声冲锋枪，微声微光，一击即离。', phrase: '无声无息，一击即离。', stats: { precision: 66 } },
    { id: 'g044', n: '蜜獾 PDW', en: 'Honey Badger PDW', sub: 'smg_pdw', lore: '2011 年美国 AAC 出的短管卡宾，.300 BLK 弹加消音器，特种部队摸夜路用，短管吵得厉害是它出名的地方。', phrase: '谁也挡不住的坏脾气。' },
    { id: 'g045', n: '蝎式 EVO 3', en: 'Scorpion EVO 3', sub: 'smg_pdw', lore: '现代版蝎式，紧凑全自动，兼顾近战。', phrase: '小，快，狠。' }
  ];

  /* ==================== 突击步枪 ==================== */
  var assault = [
    { id: 'g046', n: 'AK-47', en: 'AK-47', sub: 'ar_assault', lore: '卡拉什尼科夫，全球产量最大的步枪，泥沙俱下仍能开火。', phrase: '泥沙俱下，仍能开火。', stats: { power: 74, toughness: 52 } },
    { id: 'g047', n: 'AKM', en: 'AKM', sub: 'ar_assault', lore: '1959 年卡拉什尼科夫出的 AK 改进型，机匣改冲压、重量轻了两斤多，AK 家族最普及的就是它。', phrase: '传奇的进化。' },
    { id: 'g048', n: 'AK-74', en: 'AK-74', sub: 'ar_assault', lore: '苏联 5.45mm 版，后坐更小，精度更好。', phrase: '老树发新枝。' },
    { id: 'g049', n: 'M16A4', en: 'M16A4', sub: 'ar_assault', lore: '1960 年代入役，A4 型换上皮卡汀尼导轨，用到现在超六十年，仍是北约标准口径。', phrase: '越战雨林里长出来的 A4。', stats: { precision: 68 } },
    { id: 'g050', n: 'M4A1', en: 'M4A1', sub: 'ar_assault', lore: '1994 年定型的美军卡宾，枪管短、带伸缩托，乘车、进楼都方便，从伊拉克到阿富汗打了三十年。', phrase: '现代步兵的万能钥匙。' },
    { id: 'g051', n: 'HK416', en: 'HK416', sub: 'ar_assault', lore: '把 M16 的气吹式换成短行程活塞，积炭少了，2011 年击毙本·拉登的行动里它就在场。', phrase: '把 AR 的缺点，都修好了。', stats: { precision: 70 } },
    { id: 'g052', n: 'SCAR-L', en: 'SCAR-L', sub: 'ar_assault', lore: '2004 年比利时 FN 给美军特种作战司令部造的，机匣分上下两截，枪管能现场换，特种部队拿去顶替 M4。', phrase: '特种部队的答案。' },
    { id: 'g053', n: 'SCAR-H', en: 'SCAR-H', sub: 'ar_assault', lore: '7.62 版 SCAR，威力大一号，猛一截。', phrase: '大了，就狠了。', stats: { power: 80 } },
    { id: 'g054', n: 'G36', en: 'G36', sub: 'ar_assault', lore: '1997 年德国 HK 出品，聚合物枪身、提把集成瞄具，德军现役用到今天，故障率数据一直压得很低。', phrase: '德国人的理性。' },
    { id: 'g055', n: 'AUG', en: 'Steyr AUG', sub: 'ar_assault', lore: '1978 年奥地利斯太尔出品，无托结构把全长缩进一截，提把里集成倍率镜，是无托步枪的先驱。', phrase: '一枪，集成一切。' },
    { id: 'g056', n: 'FAMAS', en: 'FAMAS', sub: 'ar_assault', lore: '法军 1979 年列装的无托步枪，枪身紧凑，换弹夹要按杠杆，法国人自己用惯了不嫌。', phrase: '法兰西的浪漫，在枪上。' },
    { id: 'g057', n: '95 式步枪', en: 'QBZ-95', sub: 'ar_assault', lore: '1997 年香港回归时亮相的中国制式步枪，5.8mm 小口径，无托结构，解放军和武警用到现在。', phrase: '站如松，稳如钟。' },
    { id: 'g058', n: '81 式步枪', en: 'QBZ-81', sub: 'ar_assault', lore: '中国长枪木托，步枪时代的老兵，可靠的名声传遍雨林。', phrase: '老兵不死。', stats: { toughness: 48 } },
    { id: 'g059', n: '56 式冲锋枪', en: 'Type 56', sub: 'ar_assault', lore: 'AK 的中国兄弟，以"冲锋枪"之名行步枪之实。', phrase: '中国制造的 AK 答案。', stats: { era: 86 } },
    { id: 'g060', n: 'SIG SG 550', en: 'SIG SG 550', sub: 'ar_assault', lore: '1986 年瑞士 SIG 出品，机匣冲压但加工精细，精度在军用步枪里出了名的好，价钱也顶别人几支。', phrase: '瑞士人的手表精神。', stats: { precision: 72 } },
    { id: 'g061', n: 'Tavor X95', en: 'Tavor X95', sub: 'ar_assault', lore: '2009 年以色列 IWI 出品，无托短管，全长不到七十厘米，进楼转弯不吃枪管，是以色列国防军的制式。', phrase: '城市巷战，它说了算。' },
    { id: 'g062', n: '加利尔', en: 'Galil', sub: 'ar_assault', lore: '1972 年以色列列装的 AK 血统步枪，专门针对沙漠改，枪机做了防沙设计，中东战场的常客。', phrase: '沙漠里也从不卡壳。' },
    { id: 'g063', n: 'AN-94', en: 'AN-94', sub: 'ar_assault', lore: '俄罗斯双发点射黑科技，一扣扳机两发同弹道。', phrase: '一扣扳机，两发同弹道。', stats: { precision: 70 } },
    { id: 'g064', n: 'FN F2000', en: 'FN F2000', sub: 'ar_assault', lore: '比利时无托枪，前抛壳设计，全封闭机匣。', phrase: '设计的执念，都是武器。' },
    { id: 'g065', n: '03 式步枪', en: 'QBZ-03', sub: 'ar_assault', lore: '中国折叠托步枪，便于携行，转场快。', phrase: '折叠起来，也是突击。', stats: { mobility: 58 } },
    { id: 'g066', n: 'VHS-2', en: 'VHS-2', sub: 'ar_assault', lore: '2007 年克罗地亚国产的无托步枪，膛线冷锻、抛壳方向可左右调，克罗地亚军拿去换了老枪。', phrase: '东欧的新脾气。' },
    { id: 'g067', n: '泽拉瓦 M70', en: 'Zastava M70', sub: 'ar_assault', lore: '1970 年塞尔维亚泽拉瓦厂造的 AK 血统步枪，南斯拉夫内战里各方都在用，一直造到 1990 年代。', phrase: '巴尔干的坚韧。' }
  ];

  /* ==================== 战斗步枪 ==================== */
  var battle = [
    { id: 'g068', n: 'FN FAL', en: 'FN FAL', sub: 'rifle_battle', lore: '1950 年代比利时 FN 出品，7.62mm 战斗步枪，几十国部队列装，自由世界的右臂是它的外号。', phrase: '自由世界的右臂。' },
    { id: 'g069', n: 'G3', en: 'G3', sub: 'rifle_battle', lore: '德国滚柱闭锁战斗步枪，冷硬、耐磨。', phrase: '冷硬，德国造。' },
    { id: 'g070', n: 'M14', en: 'M14', sub: 'rifle_battle', lore: '1959 年美军列装，木托加 7.62mm 全威力弹，后坐大，越战里被 M16 替掉，但射手到现在还在拿它改狙。', phrase: '老兵披挂，依然能战。' },
    { id: 'g071', n: 'HK417', en: 'HK417', sub: 'rifle_battle', lore: 'HK416 的 7.62 版本，远距离的德式精确。', phrase: '远距离的德式精确。' },
    { id: 'g072', n: 'AR-10', en: 'AR-10', sub: 'rifle_battle', lore: '1956 年尤金·斯通纳在阿玛莱特设计的，铝合金机匣、直枪托，是 M16 一大家子的开山之作，只量产了几千支。', phrase: '一切的开始。' },
    { id: 'g073', n: 'BM59', en: 'BM59', sub: 'rifle_battle', lore: '意大利加兰德改型，把美国老枪变成意大利枪。', phrase: '加兰德的地中海续章。' },
    { id: 'g074', n: 'CETME', en: 'CETME', sub: 'rifle_battle', lore: '西班牙滚柱步枪，G3 的祖先。', phrase: '祖先的名字，也是荣耀。' }
  ];

  /* ==================== 栓动步枪 ==================== */
  var boltRifle = [
    { id: 'g075', n: 'Kar98k', en: 'Kar98k', sub: 'rifle_bolt', lore: '二战德军制式栓动步枪，毛瑟家族的一代传奇。', phrase: '毛瑟的凝视。', stats: { era: 78 } },
    { id: 'g076', n: '莫辛纳甘', en: 'Mosin-Nagant', sub: 'rifle_bolt', lore: '俄军三线步枪，冰原上熬出来的老枪。', phrase: '苏联的骨头。', stats: { era: 78 } },
    { id: 'g077', n: 'M1903 春田', en: 'M1903 Springfield', sub: 'rifle_bolt', lore: '1903 年春田兵工厂定型，一战美军步兵的制式，二战珍珠港后美军还靠它顶了一阵，弹仓五发。', phrase: '春田的枪，从不失准。' },
    { id: 'g078', n: '李-恩菲尔德', en: 'Lee-Enfield', sub: 'rifle_bolt', lore: '英军十发栓动，射速快到能骗过机关枪。', phrase: '快到你数不过来。' },
    { id: 'g079', n: '三八式步枪', en: 'Type 38', sub: 'rifle_bolt', lore: '三八大盖，日军制式，一枪一式皆按规矩。', phrase: '一枪一式，皆按规矩。', stats: { era: 76 } },
    { id: 'g080', n: '卡尔卡诺', en: 'Carcano', sub: 'rifle_bolt', lore: '1891 年意大利制式，6.5mm 小口径，本国部队用了大半个世纪，1963 年因刺杀肯尼迪那支枪被全世界记住。', phrase: '历史替它背了名。' },
    { id: 'g081', n: '九九式步枪', en: 'Type 99', sub: 'rifle_bolt', lore: '1939 年日军列装，7.7mm 弹、带防尘盖，本意替换三八式，产量始终没追上，一直打到 1945 年。', phrase: '改到最后，还是枪。' }
  ];

  /* ==================== 半自动步枪 ==================== */
  var semiRifle = [
    { id: 'g082', n: 'M1 加兰德', en: 'M1 Garand', sub: 'rifle_semi', lore: '二战美军半自动，弹夹弹出那声"叮"，响遍了战场。', phrase: '八发弹夹的叮当声。', stats: { era: 80 } },
    { id: 'g083', n: 'SKS', en: 'SKS', sub: 'rifle_semi', lore: '1945 年苏联西蒙诺夫设计，弹匣十发、活塞短行程，比栓动快、比突击步枪便宜，中国、东欧都仿过。', phrase: '简洁的社会主义枪械。' },
    { id: 'g084', n: '56 式半自动', en: 'Type 56 Semi', sub: 'rifle_semi', lore: '中国 SKS 仿制，仪仗队的正步之枪。', phrase: '正步，也要打得准。' },
    { id: 'g085', n: 'SVT-40', en: 'SVT-40', sub: 'rifle_semi', lore: '1940 年托卡列夫设计，苏军老兵缴到或分到一支就藏着不舍得上缴，战前造了上百万支。', phrase: '托卡列夫的火力。' },
    { id: 'g086', n: 'Gewehr 43', en: 'Gewehr 43', sub: 'rifle_semi', lore: '德国二战半自动，德国人也学会了连射。', phrase: '德国人也学会连射。' },
    { id: 'g087', n: 'FN49', en: 'FN-49', sub: 'rifle_semi', lore: '1949 年比利时 FN 出品，半自动、弹匣十发，各国战后换装期买它当过渡，后来被 FAL 全面取代。', phrase: '战后的礼貌。' },
    { id: 'g088', n: '约翰逊 M1941', en: 'Johnson M1941', sub: 'rifle_semi', lore: '美国半自动，特立独行的旋转闭锁设计。', phrase: '不走寻常路的枪。' }
  ];

  /* ==================== 卡宾枪 ==================== */
  var carbine = [
    { id: 'g089', n: 'M1 卡宾枪', en: 'M1 Carbine', sub: 'rifle_carbine', lore: '二战美军的轻型卡宾，轻，是它存在的理由。', phrase: '轻，是它的理由。' },
    { id: 'g090', n: '鲁格 Mini-14', en: 'Ruger Mini-14', sub: 'rifle_carbine', lore: '民用卡宾，农场与警车的常客。', phrase: '美国乡下的实在。' },
    { id: 'g091', n: '伯莱塔 Cx4', en: 'Beretta Cx4', sub: 'rifle_carbine', lore: '2003 年意大利伯莱塔出品，手枪弹、半自动，民用市场主打防卫，枪身轻、后坐小，新手也能上手。', phrase: '城市的灵活枪械。' },
    { id: 'g092', n: 'XM177', en: 'XM177', sub: 'rifle_carbine', lore: '越战短 AR，卡宾步枪的原型。', phrase: '短，是为了快。' },
    { id: 'g093', n: 'AKS-74U', en: 'AKS-74U', sub: 'rifle_carbine', lore: '1979 年苏联空降兵和坦克兵配的短管 AK，枪管短到枪口焰明显，车里、装甲车里进出方便。', phrase: '越小，越凶狠。' },
    { id: 'g094', n: 'AK-100 短管卡宾', en: 'AK-100 Carbine', sub: 'rifle_carbine', lore: '1990 年代俄罗斯 AK-100 系列里的短管版，给执法和近距离单位用，保留了 AK 的可靠，枪短好收。', phrase: '短管出奇迹。' }
  ];

  /* ==================== 泵动霰弹枪 ==================== */
  var shotPump = [
    { id: 'g095', n: '雷明顿 870', en: 'Remington 870', sub: 'shot_pump', lore: '泵动霰弹枪的代名词，一拉一推，就是宣判。', phrase: '一拉一推，就是宣判。' },
    { id: 'g096', n: '莫斯伯格 500', en: 'Mossberg 500', sub: 'shot_pump', lore: '美国警用泵动主力，家家户户的守夜人。', phrase: '美国家庭的守夜人。' },
    { id: 'g097', n: '温彻斯特 M1897', en: 'Winchester M1897', sub: 'shot_pump', lore: '战壕霰弹枪，一战里美国大兵的咆哮。', phrase: '战壕里的风暴。', stats: { era: 76 } },
    { id: 'g098', n: '伊萨卡 37', en: 'Ithaca 37', sub: 'shot_pump', lore: '独特的下抛壳设计，低调却有历史。', phrase: '低调，但有历史。' },
    { id: 'g099', n: '伯奈利 Nova', en: 'Benelli Nova', sub: 'shot_pump', lore: '1999 年意大利伯奈利出品，泵动霰弹枪，聚合物一体枪身，上膛顺手，猎人户外用得多。', phrase: '新的泵动哲学。' },
    { id: 'g100', n: '97 式泵动', en: 'HP9-1', sub: 'shot_pump', lore: '中国警用泵动霰弹枪，12 号口径，巡警车上常配，一拉一推上膛，威慑摆在明处。', phrase: '秩序，一拉一推。' }
  ];

  /* ==================== 半自动霰弹枪 ==================== */
  var shotSemi = [
    { id: 'g101', n: '伯奈利 M4', en: 'Benelli M4', sub: 'shot_semi', lore: '美军"三军战斗霰弹枪"，半自动与泵动双模式，装了换管装置连榴弹都能打。', phrase: '半自动的优雅暴力。', stats: { power: 88 } },
    { id: 'g102', n: 'SPAS-12', en: 'SPAS-12', sub: 'shot_semi', lore: '1979 年意大利弗兰基出品，半自动和泵动可切换，外形凶，1980 年代动作片和游戏里出镜率极高。', phrase: '电影里的主角枪。' },
    { id: 'g103', n: 'Saiga-12', en: 'Saiga-12', sub: 'shot_semi', lore: 'AK 血统的半自动霰弹枪，机枪式供弹。', phrase: '卡拉什尼科夫的霰弹答案。' },
    { id: 'g104', n: 'AA-12', en: 'AA-12', sub: 'shot_semi', lore: '1987 年美国人设计的全自动霰弹枪，一扣扳机连发，配 20 发弹鼓，一直没大规模列装，评测视频里出名。', phrase: '自动霰弹，火力如墙。' },
    { id: 'g105', n: '雷明顿 1100', en: 'Remington 1100', sub: 'shot_semi', lore: '1963 年上市，半自动后坐减半，飞碟射击和猎鸟的老手用到今天还舍不得换。', phrase: '猎人手中的优雅。' }
  ];

  /* ==================== 双管霰弹枪 ==================== */
  var shotDouble = [
    { id: 'g106', n: '立式双管猎枪', en: 'Over-under Shotgun', sub: 'shot_double', lore: '上下双管，一枪双响，两发解决多数问题。', phrase: '两发，解决多数问题。' },
    { id: 'g107', n: '平双管猎枪', en: 'Side-by-side Shotgun', sub: 'shot_double', lore: '老式平排双管，乡间的老派问候。', phrase: '老派的双重问候。' },
    { id: 'g108', n: '锯短双管', en: 'Sawed-off Shotgun', sub: 'shot_double', lore: '街头版双管，短到藏得住，狠到跑不掉。', phrase: '短到藏得住，狠到跑不掉。' },
    { id: 'g109', n: '意大利双管猎枪', en: 'Italian Side-by-side', sub: 'shot_double', lore: '工艺精美的双管，枪管上刻着手艺。', phrase: '意大利的手艺，在管上。' }
  ];

  /* ==================== 栓动狙击枪 ==================== */
  var sniperBolt = [
    { id: 'g110', n: 'AWM', en: 'AWM', sub: 'sniper_bolt', lore: '英国 .338 狙击步枪，远程之王，一公里外仍是它的射程。', phrase: '一公里外，也是它的射程。', stats: { power: 90, precision: 94 } },
    { id: 'g111', n: 'AWP', en: 'AWP', sub: 'sniper_bolt', lore: '英国精密国际造的 AWM 警方版，.308 弹、枪管略短，绿黑色涂装，反恐部队和影视片里的常客。', phrase: '瞄准镜里的冷静。' },
    { id: 'g112', n: 'M24', en: 'M24 SWS', sub: 'sniper_bolt', lore: '美军栓动狙击，雷明顿 700 的军用血统。', phrase: '稳稳的一击。' },
    { id: 'g113', n: 'M40A5', en: 'M40A5', sub: 'sniper_bolt', lore: '海军陆战队的狙击步枪，耐心等在一发上。', phrase: '陆战队的耐心。' },
    { id: 'g114', n: '98k 狙击型', en: 'Kar98k Sniper', sub: 'sniper_bolt', lore: 'Kar98k 加装四倍瞄具的狙击型，二战德军挑精度最好的那批枪管改，配给老兵，800 米内点名。', phrase: '老枪，准得可怕。' },
    { id: 'g115', n: '莫辛纳甘 PU', en: 'Mosin PU', sub: 'sniper_bolt', lore: '苏军狙击，斯大林格勒的枪声。', phrase: '冰原上的枪声。' },
    { id: 'g116', n: 'SSG 08', en: 'Steyr SSG 08', sub: 'sniper_bolt', lore: '2008 年奥地利斯太尔出品，栓动狙击，机匣顶装皮卡汀尼导轨、折叠枪托，现代狙击赛的主流选择之一。', phrase: '阿尔卑斯的冷静。' },
    { id: 'g117', n: 'CheyTac M200', en: 'CheyTac M200', sub: 'sniper_bolt', lore: '.408 口径超远程，两公里只是热身。', phrase: '两公里，只是热身。', stats: { range: 97 } }
  ];

  /* ==================== 半自动狙击枪 ==================== */
  var sniperSemi = [
    { id: 'g118', n: 'SVD', en: 'SVD Dragunov', sub: 'sniper_semi', lore: '1963 年德拉贡诺夫设计，苏联半自动狙击，7.62mm 步枪弹、侧装瞄准镜，华约国家列装几十年。', phrase: '一枪一命，苏联作风。' },
    { id: 'g119', n: 'M110', en: 'M110', sub: 'sniper_semi', lore: '2008 年美军列装，半自动、7.62mm 弹，在 M14 基础上改进，一枪接一枪比栓动快，班组精确射手在用。', phrase: '现代战争的精确连发。' },
    { id: 'g120', n: 'MK14 EBR', en: 'MK14 EBR', sub: 'sniper_semi', lore: '战斗步枪改装的狙击平台，老树配新镜。', phrase: '老树，新瞄准镜。' },
    { id: 'g121', n: 'PSG-1', en: 'PSG-1', sub: 'sniper_semi', lore: '1970 年代德国 HK 出品，半自动精确步枪，造一支价钱顶好几支突击步枪，德国警察反恐用，产量不大。', phrase: '德国式的一锤定音。' },
    { id: 'g122', n: 'MK11', en: 'MK11', sub: 'sniper_semi', lore: '美国海军的半自动精确步枪，7.62 口径配十发弹匣，甲板海风里照样打得出密集散布。', phrase: '海上的沉稳。' },
    { id: 'g123', n: 'VSS 微声狙击', en: 'VSS Vintorez', sub: 'sniper_semi', lore: '1987 年苏联列装，9×39mm 亚音速弹，枪和消音器一体，四百米内打出去几乎没枪声，特种部队摸哨用。', phrase: '无声的收割。' },
    { id: 'g124', n: 'SVU', en: 'SVU', sub: 'sniper_semi', lore: '1990 年代俄罗斯把 SVD 改成无托，全长短了一大截，枪管没动、精度保住，车臣作战时俄军用过。', phrase: '缩短，不妥协。' }
  ];

  /* ==================== 反器材狙击枪 ==================== */
  var sniperAnti = [
    { id: 'g125', n: '巴雷特 M82', en: 'Barrett M82', sub: 'sniper_anti', lore: '.50 反器材，最出名的重狙，它的子弹是一道命令。', phrase: '它的子弹，是一道命令。', stats: { power: 97 } },
    { id: 'g126', n: '巴雷特 M99', en: 'Barrett M99', sub: 'sniper_anti', lore: '单发反器材，一发，就够。', phrase: '一发，就够。' },
    { id: 'g127', n: 'TAC-50', en: 'McMillan TAC-50', sub: 'sniper_anti', lore: '加拿大超远程，世界纪录之枪。', phrase: '纪录，是它刷新的。', stats: { range: 97 } },
    { id: 'g128', n: '巴雷特 M95', en: 'Barrett M95', sub: 'sniper_anti', lore: '1995 年巴雷特出的无托 .50，全长比 M82 短一截，照样打 .50 BMG 弹，反器材组的紧凑选项。', phrase: '紧凑的毁灭。' },
    { id: 'g129', n: 'NTW-20', en: 'NTW-20', sub: 'sniper_anti', lore: '南非 20mm 反器材，装甲车也会给它让路。', phrase: '装甲车也会让路。' },
    { id: 'g130', n: 'RT-20', en: 'RT-20', sub: 'sniper_anti', lore: '克罗地亚 20mm，介于枪和炮之间的答案。', phrase: '介于枪与炮之间。' }
  ];

  /* ==================== 轻机枪 ==================== */
  var mgLight = [
    { id: 'g131', n: 'M249', en: 'M249 SAW', sub: 'mg_light', lore: '1980 年代美军列装，比利时 FN 米尼米的美军版，5.56mm 弹，弹鼓弹链都能上，步兵班压火力的那挺。', phrase: '班组的火力地基。' },
    { id: 'g132', n: 'RPK', en: 'RPK', sub: 'mg_light', lore: '苏联轻机枪，AK 血统的机枪兄弟。', phrase: 'AK 的机枪兄弟。' },
    { id: 'g133', n: '捷克式 ZB-26', en: 'ZB-26', sub: 'mg_light', lore: '中国抗战主力轻机枪，鬼子最怕的枪声之一。', phrase: '鬼子最怕的枪声。', stats: { era: 80 } },
    { id: 'g134', n: '歪把子', en: 'Type 11', sub: 'mg_light', lore: '大正十一式，日军轻机枪，歪着脖子也要打。', phrase: '歪着脖子也要打。' },
    { id: 'g135', n: 'BAR M1918', en: 'BAR M1918', sub: 'mg_light', lore: '美军自动步枪，从一战打到二战，跑着也能开火。', phrase: '老 BAR，跑着也开火。', stats: { era: 82 } },
    { id: 'g136', n: '95 式班用机枪', en: 'QBB-95', sub: 'mg_light', lore: '1995 年起列装中国部队，5.8mm 轻机枪、弹鼓 75 发，和 95 式步枪同族，班里的火力顶梁。', phrase: '中国班的火力核心。' },
    { id: 'g137', n: 'Ultimax 100', en: 'Ultimax 100', sub: 'mg_light', lore: '1982 年新加坡设计，5.56mm 轻机枪，独特的后坐缓冲让连发几乎不跳，射击测试里散布小得有名。', phrase: '稳，是它的卖点。' },
    { id: 'g138', n: 'RPK-74', en: 'RPK-74', sub: 'mg_light', lore: '1974 年苏联随 AK-74 一起出的轻机枪版，5.45mm 弹、加长加厚枪管，弹匣弹鼓两用。', phrase: '新一代的班用火力。' }
  ];

  /* ==================== 通用 / 重机枪 ==================== */
  var mgHeavy = [
    { id: 'g139', n: 'MG42', en: 'MG42', sub: 'mg_heavy', lore: '二战德军通用机枪，射速每分钟一千五百发，两秒打完一条弹链，枪声连成一片，盟军叫它希特勒的电锯。', phrase: '电锯锯开战场。', stats: { speed: 90, era: 82 } },
    { id: 'g140', n: 'M60', en: 'M60', sub: 'mg_heavy', lore: '越战美军通用机枪，兰博手里的开路者。', phrase: '越南丛林的开路者。' },
    { id: 'g141', n: 'PKM', en: 'PKM', sub: 'mg_heavy', lore: '1969 年苏联列装，卡拉什尼科夫设计的通用机枪，7.62×54R 弹，轻、耐造，全世界打了半个世纪还在用。', phrase: '社会主义的实用主义。' },
    { id: 'g142', n: 'M2HB', en: 'M2HB Browning', sub: 'mg_heavy', lore: '勃朗宁 .50 重机枪，从一战打到未来，百年老将。', phrase: '从一战打到未来。', stats: { power: 94, era: 80 } },
    { id: 'g143', n: 'MG3', en: 'MG3', sub: 'mg_heavy', lore: 'MG42 的现代重生，还是那台电锯。', phrase: '希特勒电锯的重生。' },
    { id: 'g144', n: '24 式重机枪', en: 'Type 24', sub: 'mg_heavy', lore: '民国的马克沁后代，抗日战场上的怒吼。', phrase: '民国的怒吼。', stats: { era: 78 } },
    { id: 'g145', n: 'M240', en: 'M240', sub: 'mg_heavy', lore: '1977 年美军列装，比利时 FN MAG 的美军版，7.62mm 弹，步兵、装甲、直升机上都在用，是美军制式机枪里最普遍的一挺。', phrase: '美国的工整答案。' },
    { id: 'g146', n: '53 式重机枪', en: 'Type 53', sub: 'mg_heavy', lore: '1953 年定型，仿苏联 SG-43 重机枪，7.62×54R 弹，中国步兵连的重火力，用到 1980 年代换装。', phrase: '中国的钢铁防线。' }
  ];

  /* ==================== 加特林机枪 ==================== */
  var gatling = [
    { id: 'g147', n: 'M134 迷你炮', en: 'M134 Minigun', sub: 'mg_gatling', lore: '1960 年代美军用的供电转管机枪，7.62mm 弹，一分钟最多打四千发，直升机舱门、装甲车顶装它压火力。', phrase: '风暴，由它定义。', stats: { speed: 96 } },
    { id: 'g148', n: 'GAU-8 复仇者', en: 'GAU-8 Avenger', sub: 'mg_gatling', lore: '战斗机上的 30mm 机关炮，飞机是围着它造的。', phrase: '飞机为它而造。' },
    { id: 'g149', n: 'GAU-19', en: 'GAU-19', sub: 'mg_gatling', lore: '三管 .50 转管机枪，三个管，一条命。', phrase: '三个管，一条命。' },
    { id: 'g150', n: '手摇加特林', en: 'Hand-crank Gatling', sub: 'mg_gatling', lore: '1861 年加特林医生发明，6 根枪管手摇轮转，一分钟打二百发，内战里首秀就收割一片。', phrase: '手摇，也一样致命。', stats: { era: 76 } }
  ];

  /* ==================== 榴弹发射器 ==================== */
  var grenadeLauncher = [
    { id: 'g151', n: 'M203', en: 'M203', sub: 'special_gl', lore: '步枪下挂榴弹发射器，一枪两用。', phrase: '一枪两用，面面俱到。' },
    { id: 'g152', n: 'M79', en: 'M79', sub: 'special_gl', lore: '越战美军的单发榴弹枪，40mm 一发能清一个街角，枪托里还藏一颗子弹应急。', phrase: '一炮，一个街角。' },
    { id: 'g153', n: 'GP-25', en: 'GP-25', sub: 'special_gl', lore: '1978 年苏联列装，40mm 榴弹挂到 AK 枪管下，一发炸一片，俄军步兵班标配的小炮。', phrase: '俄式的补上一击。' },
    { id: 'g154', n: 'QLG91', en: 'QLG91', sub: 'special_gl', lore: '1991 年定型，中国 35mm 下挂榴弹发射器，装在步枪枪管下，一发榴弹补在枪弹打不透的地方。', phrase: '东方的一击。' },
    { id: 'g155', n: 'HK AG36', en: 'HK AG36', sub: 'special_gl', lore: '2002 年德国 HK 出品，40mm 下挂榴弹发射器，装 G36 枪管下，管能侧翻装弹，射击位置不挡手。', phrase: '德式的面面俱到。' }
  ];

  /* ==================== 火箭筒 ==================== */
  var rocket = [
    { id: 'g156', n: 'RPG-7', en: 'RPG-7', sub: 'special_rpg', lore: '火箭筒之王，游击队的图腾，一支火箭改变一场仗。', phrase: '一支火箭，改变一场仗。' },
    { id: 'g157', n: '巴祖卡', en: 'Bazooka M1A1', sub: 'special_rpg', lore: '二战美军火箭筒，二战的声音。', phrase: '二战的声音。', stats: { era: 80 } },
    { id: 'g158', n: '铁拳', en: 'Panzerfaust', sub: 'special_rpg', lore: '德国一次性火箭筒，便宜到可以扔。', phrase: '便宜到可以扔。' },
    { id: 'g159', n: '89 式火箭筒', en: 'PF-89', sub: 'special_rpg', lore: '中国单兵火箭，单兵也敢撼坦克。', phrase: '单兵，也敢撼坦克。' },
    { id: 'g160', n: '坦克杀手', en: 'Panzerschreck', sub: 'special_rpg', lore: '德国大型火箭筒，名字就是意图。', phrase: '名字，就是意图。' }
  ];

  /* ==================== 火焰喷射器 ==================== */
  var flamethrower = [
    { id: 'g161', n: 'M2 火焰喷射器', en: 'M2 Flamethrower', sub: 'special_flame', lore: '美制火焰喷射器，火烧过的地方，安静了。', phrase: '火烧过的地方，安静了。' },
    { id: 'g162', n: '德国 35 型喷火器', en: 'Flammenwerfer 35', sub: 'special_flame', lore: '德军火焰喷射器，火是最好的开路者。', phrase: '火，是最好的开路者。' },
    { id: 'g163', n: 'LPO-50', en: 'LPO-50', sub: 'special_flame', lore: '1950 年代苏联列装，三根喷管连发三次，一次喷出一层油火，碉堡战壕里最怕碰上它。', phrase: '三管火焰，横扫阵地。' },
    { id: 'g164', n: '74 式喷火器', en: 'Type 74 Flamethrower', sub: 'special_flame', lore: '中国国产喷火器，火墙也是一种墙。', phrase: '火墙，也是一种墙。' }
  ];

  /* ==================== 无后坐力炮 / 肩扛导弹 ==================== */
  var recoil = [
    { id: 'g165', n: 'M40 无后坐力炮', en: 'M40 Recoilless Rifle', sub: 'special_recoil', lore: '106mm 美国无后坐力炮，扛得起就是炮。', phrase: '扛得起，就是炮。' },
    { id: 'g166', n: '卡尔·古斯塔夫 M3', en: 'Carl Gustav M3', sub: 'special_recoil', lore: '1948 年瑞典服役的无后坐力炮，M3 是轻量版，84mm 弹能打坦克也能打碉堡，现代步兵班还能肩扛着上。', phrase: '单兵，扛着一门炮。' },
    { id: 'g167', n: 'SPG-9', en: 'SPG-9', sub: 'special_recoil', lore: '1960 年代苏联列装，73mm 无后坐力炮，比火箭筒打得远、弹药便宜，第三世界国家用得广。', phrase: '苏联的直射铁拳。' },
    { id: 'g168', n: '75 式无后坐力炮', en: 'Type 75 Recoilless', sub: 'special_recoil', lore: '1975 年定型，中国 105mm 无后坐力炮，步兵连的反坦克火力，一门炮配三个炮手。', phrase: '国产的直射火力。' },
    { id: 'g169', n: '标枪反坦克导弹', en: 'FGM-148 Javelin', sub: 'special_recoil', lore: '美制红外制导导弹，射出去，自己追。', phrase: '射出去，自己追。', stats: { precision: 85 } },
    { id: 'g170', n: '毒刺防空导弹', en: 'FIM-92 Stinger', sub: 'special_recoil', lore: '1981 年美军列装的肩扛导弹，红外导引，扛上肩几秒就能射，阿富汗战争里打下来不少苏联直升机。', phrase: '天上的它，也躲不开。', stats: { range: 62 } },
    { id: 'g171', n: 'RPO-A 大黄蜂', en: 'RPO-A Shmel', sub: 'special_recoil', lore: '俄罗斯温压火箭筒，一炮就是一座火炉。', phrase: '一炮，就是一座火炉。' }
  ];

  W.weapons = W.weapons.concat(pistolSemi, pistolRev, smg, pdw, assault, battle, boltRifle, semiRifle, carbine, shotPump, shotSemi, shotDouble, sniperBolt, sniperSemi, sniperAnti, mgLight, mgHeavy, gatling, grenadeLauncher, rocket, flamethrower, recoil);
})();
