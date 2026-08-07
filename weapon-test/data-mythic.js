/* =====================================================================
   本命武器测试 · 传说名器库（干将莫邪 / 鱼肠 / 倚天 / 方天画戟 / 青龙偃月刀 …）
   条目格式：{ id, n(中文名), en(原名), sub(子类key), lore(一句小传), phrase(一句性格), stats?(稀疏覆盖) }
   名器 stats 全部做突出覆盖，保证每把都能从库中"站出来"。
   ===================================================================== */
(function () {
  'use strict';
  var W = window.WEAPON_DATA;

  var list = [
    // ---- 神剑 ----
    { id: 'm001', n: '干将莫邪', en: 'Ganjiang & Moye', sub: 'mythic_sword', lore: '铸剑师夫妇以身投炉，雌雄双剑从此有魂，是铸剑史上的血与火。', phrase: '铸剑者跳进炉火，剑才有了魂。', stats: { power: 90, speed: 86, precision: 90 } },
    { id: 'm002', n: '湛卢', en: 'Zhanlu', sub: 'mythic_sword', lore: '欧冶子所铸，仁者之剑，锋芒内敛而天下归心。', phrase: '无锋，却有德。', stats: { precision: 92, toughness: 70 } },
    { id: 'm003', n: '泰阿', en: "Tai'a", sub: 'mythic_sword', lore: '威道之剑，楚王持之守城，剑气纵横千载。', phrase: '威，是天给的。', stats: { power: 92 } },
    { id: 'm004', n: '越王勾践剑', en: 'King Goujian Sword', sub: 'mythic_sword', lore: '深埋地下两千余年出土依然锋利，卧薪尝胆的见证。', phrase: '卧薪尝胆，剑锋犹新。', stats: { precision: 88, toughness: 66 } },
    { id: 'm005', n: '倚天剑', en: 'Yitian Sword', sub: 'mythic_sword', lore: '"倚天不出，谁与争锋"，传说中的武林至尊之剑。', phrase: '倚天不出，谁与争锋。', stats: { power: 88, precision: 88 } },
    { id: 'm006', n: '龙泉剑', en: 'Longquan Sword', sub: 'mythic_sword', lore: '龙泉铸剑术流传千年，是把"剑"变成一门名号的开始。', phrase: '龙泉的名号，由火与铁铸成。', stats: { precision: 84 } },
    // ---- 神刀 ----
    { id: 'm007', n: '青龙偃月刀', en: 'Green Dragon Crescent', sub: 'mythic_blade', lore: '关云长的八十二斤长刀，过五关斩六将，义字当头。', phrase: '忠义的重量。', stats: { power: 94, range: 44, toughness: 76 } },
    { id: 'm008', n: '屠龙刀', en: 'Tulong Dao', sub: 'mythic_blade', lore: '"宝刀屠龙，号令天下"，与倚天剑并称的武林至宝。', phrase: '宝刀屠龙，号令天下。', stats: { power: 93, toughness: 74 } },
    { id: 'm009', n: '三尖两刃刀', en: 'Three-point Two-edge Blade', sub: 'mythic_blade', lore: '二郎神杨戬的兵器，一杆三尖两刃，梅山七圣都听他调度，斩妖时排兵列阵在前。', phrase: '神鬼，见了也让路。', stats: { precision: 82, range: 40 } },
    // ---- 神戟 ----
    { id: 'm010', n: '方天画戟', en: 'Fangtian Huaji', sub: 'mythic_pole', lore: '吕布手中的画戟，人中吕布、马中赤兔，无人能挡。', phrase: '人中吕布，马中赤兔。', stats: { power: 92, speed: 70, range: 48 } },
    { id: 'm011', n: '霸王戟', en: 'Overlord Ji', sub: 'mythic_pole', lore: '西楚霸王的戟，破釜沉舟时它也在阵前。', phrase: '霸王举鼎，戟挑山河。', stats: { power: 95, toughness: 78 } },
    // ---- 神枪 ----
    { id: 'm012', n: '丈八蛇矛', en: 'Zhangba Serpent Spear', sub: 'mythic_spear', lore: '燕人张翼德的长矛，长坂坡上一声吼，吓退百万军。', phrase: '燕人的吼声，矛的锋芒。', stats: { power: 90, range: 46, speed: 74 } },
    { id: 'm013', n: '沥泉神枪', en: "Yue Fei's Spear", sub: 'mythic_spear', lore: '相传岳飞取沥泉山泉所淬，枪挑金兵，精忠报国。', phrase: '精忠报国，一枪到底。', stats: { precision: 78, speed: 76 } },
    { id: 'm014', n: '霸王枪', en: 'Conqueror Spear', sub: 'mythic_spear', lore: '力能扛鼎者的枪，一寸长一寸霸。', phrase: '枪挑山河，谁人敢接。', stats: { power: 93, toughness: 70 } },
    // ---- 神弓 ----
    { id: 'm015', n: '后羿弓', en: 'Houyi Bow', sub: 'mythic_bow', lore: '射落九日的传说之弓，距离在它面前只是数字。', phrase: '它射下来过太阳。', stats: { range: 98, precision: 96 } },
    { id: 'm016', n: '养由基穿杨弓', en: "Yang Youji's Bow", sub: 'mythic_bow', lore: '百步穿杨的养由基，一箭封神。', phrase: '百步之外，穿杨而中。', stats: { precision: 95, range: 90 } },
    // ---- 神锤 ----
    { id: 'm017', n: '擂鼓瓮金锤', en: 'Ligu Wengjin Hammer', sub: 'mythic_hammer', lore: '李元霸的双锤，八百斤神力，擂鼓响处天下皆惊。', phrase: '双锤擂鼓，天下皆惊。', stats: { power: 98, speed: 60 } },
    { id: 'm018', n: '雷神之锤', en: 'Mjolnir', sub: 'mythic_hammer', lore: '北欧雷神的锤，值得的人，才举得起来。', phrase: '值得的人，才举得起来。', stats: { power: 97, speed: 70 } },
    { id: 'm019', n: '金瓜锤', en: 'Golden Melon Hammer', sub: 'mythic_hammer', lore: '仪仗与战阵两用的重锤，威仪也是一种武力。', phrase: '威仪，也是武力。', stats: { power: 90, toughness: 82 } },
    // ---- 神斧 ----
    { id: 'm020', n: '开天斧', en: "Pangu's Axe", sub: 'mythic_axe', lore: '盘古劈开混沌的那一斧，是万物之始。', phrase: '劈开天地的那一斧。', stats: { power: 99, range: 30 } },
    { id: 'm021', n: '刑天战斧', en: "Xingtian's Axe", sub: 'mythic_axe', lore: '头颅被斩仍舞干戚，刑天是战意本身的化身。', phrase: '头颅不在，战意未息。', stats: { power: 96, toughness: 84 } },
    // ---- 神匕 ----
    { id: 'm022', n: '鱼肠剑', en: 'Yuchang Dagger', sub: 'mythic_dagger', lore: '藏于鱼腹的短剑，专诸一击，改变一个时代。', phrase: '藏在鱼腹，一剑成名。', stats: { speed: 94, precision: 90 } },
    { id: 'm023', n: '徐夫人匕首', en: 'Xu Furen Dagger', sub: 'mythic_dagger', lore: '荆轲刺秦所用，淬以剧毒，图穷匕见。', phrase: '图穷匕见，一刺不中。', stats: { precision: 92, speed: 90 } },
    { id: 'm024', n: '寒光匕', en: 'Cold Light Dagger', sub: 'mythic_dagger', lore: '古书里记载的短匕，通体泛寒光，多记于刺客与侠客案底，出鞘从来只为一个结果。', phrase: '出鞘，即是决定。', stats: { speed: 92, mobility: 88 } },
    // ---- 神鞭 ----
    { id: 'm025', n: '打神鞭', en: 'Dashen Bian', sub: 'mythic_whip', lore: '封神之战的至宝，专打神仙，打人更是手到擒来。', phrase: '专打神，不打人。', stats: { precision: 90, range: 44 } },
    { id: 'm026', n: '九节钢鞭', en: 'Nine-section Steel Whip', sub: 'mythic_whip', lore: '名将手中的九节钢鞭，鞭出如龙，专破重甲。', phrase: '鞭出如龙，破甲有声。', stats: { power: 76, speed: 84 } },
    // ---- 神兵（棍 / 杵） ----
    { id: 'm027', n: '如意金箍棒', en: 'Ruyi Jingu Bang', sub: 'mythic_staff', lore: '定海神针铁，一万三千五百斤，轻重随心，斗战胜佛的兵器。', phrase: '一万三千五百斤，轻重随心。', stats: { power: 94, speed: 88, mobility: 78 } },
    { id: 'm028', n: '降魔杵', en: 'Vajra Pestle', sub: 'mythic_staff', lore: '韦驮的降魔杵，佛前的雷霆，专镇邪祟。', phrase: '佛前的雷霆。', stats: { power: 90, toughness: 82 } },
    { id: 'm029', n: '金刚杵', en: 'Vajra', sub: 'mythic_staff', lore: '密宗法器，降伏的不是敌人，是妄念。', phrase: '降伏的，是妄念。', stats: { precision: 82, toughness: 76 } },
    { id: 'm030', n: '混铁棍', en: 'Iron Staff', sub: 'mythic_staff', lore: '一根浑铁棍，两头无刃、通体包铁，市井好汉抡起来，一条街的人先让三分。', phrase: '野性，也自有章法。', stats: { power: 88, speed: 78 } }
  ];

  W.weapons = W.weapons.concat(list);
})();
