/* =====================================================================
   本命武器测试 · 爆炸物 / 投掷物库（手榴弹 / 燃烧瓶 / 烟雾弹 / 震爆弹 / 地雷 / 爆破装置）
   条目格式：{ id, n(中文名), en(原名), sub(子类key), lore(一句小传), phrase(一句性格), stats?(稀疏覆盖) }
   ===================================================================== */
(function () {
  'use strict';
  var W = window.WEAPON_DATA;

  var list = [
    // ---- 手榴弹 ----
    { id: 'x001', n: '米尔斯手榴弹', en: 'Mills Bomb', sub: 'exp_grenade', lore: '英军二战经典，拉开、倒数、投出，一套动作定生死。', phrase: '拉开，倒数，五秒。', stats: { era: 80 } },
    { id: 'x002', n: '木柄手榴弹', en: 'M24 Stick Grenade', sub: 'exp_grenade', lore: '德式长柄手榴弹，可单投可集束，二战两大阵营都用。', phrase: '一磕，一投，一响。', stats: { era: 80 } },
    { id: 'x003', n: '破片手榴弹', en: 'Fragmentation Grenade', sub: 'exp_grenade', lore: '钢珠破片四散，弹片比弹体更会说话。', phrase: '弹片，比弹体更会说话。' },
    { id: 'x004', n: '燃烧手榴弹', en: 'AN-M14 Incendiary', sub: 'exp_grenade', lore: '镁基燃烧，瞬间把一隅烧成火海。', phrase: '烧起来，就别想熄。' },
    { id: 'x005', n: '67 式木柄手榴弹', en: 'Type 67', sub: 'exp_grenade', lore: '中国经典木柄手榴弹，产量以亿计。', phrase: '亿万个答案，一声响。', stats: { era: 82 } },
    { id: 'x006', n: '攻防两用手榴弹', en: 'Offensive-Defensive Grenade', sub: 'exp_grenade', lore: '两种破片厚度，两套使用场景，一弹两用。', phrase: '进攻防守，我都能。' },
    { id: 'x007', n: '白磷手榴弹', en: 'White Phosphorus', sub: 'exp_grenade', lore: '沾上就烧，烟雾与火并存的狠货。', phrase: '碰到它的，都记住了。' },
    { id: 'x008', n: '磁性反坦克手榴弹', en: 'Magnetic AT Grenade', sub: 'exp_grenade', lore: '吸在装甲上炸，专治铁壳子。', phrase: '铁壳子，也挡不住贴脸。' },
    // ---- 燃烧瓶 ----
    { id: 'x009', n: '莫洛托夫鸡尾酒', en: 'Molotov Cocktail', sub: 'exp_molotov', lore: '汽油瓶加布条，巷战里的廉价怒火。', phrase: '廉价，但烧得起来。' },
    { id: 'x010', n: '凝固汽油燃烧瓶', en: 'Napalm Bomb', sub: 'exp_molotov', lore: '粘稠的火焰，甩都甩不掉。', phrase: '粘上，就甩不掉。' },
    { id: 'x011', n: '玻璃燃烧瓶', en: 'Glass Molotov', sub: 'exp_molotov', lore: '砸碎的一瞬间，火就从瓶里醒了。', phrase: '碎的那一刻，火就醒了。' },
    // ---- 烟雾弹 ----
    { id: 'x012', n: '烟雾弹', en: 'Smoke Grenade', sub: 'exp_smoke', lore: '遮蔽视线的灰色魔术，让对面变成瞎子。', phrase: '看不见，就是最大的掩护。' },
    { id: 'x013', n: '彩色烟雾弹', en: 'Colored Smoke', sub: 'exp_smoke', lore: '标记位置用，也常被用来假装一场浪漫。', phrase: '色彩，也是信号。' },
    { id: 'x014', n: '发烟罐', en: 'Smoke Canister', sub: 'exp_smoke', lore: '一罐浓烟，能捂住整条街。', phrase: '一条街，被它捂住。' },
    // ---- 震爆弹 ----
    { id: 'x015', n: '震爆弹', en: 'Flashbang', sub: 'exp_flash', lore: '闪光加巨响，让人瞬间失聪失明。', phrase: '亮和响，都是武器。' },
    { id: 'x016', n: '眩晕弹', en: 'Stun Grenade', sub: 'exp_flash', lore: '不伤人命，只夺五感，破门而入前的问候。', phrase: '破门前的问候。' },
    // ---- 地雷 ----
    { id: 'x017', n: '反步兵跳雷', en: 'Bounding Mine', sub: 'exp_mine', lore: '踩上去弹起半米再炸，专伤站立的目标。', phrase: '土地，也会开口说话。' },
    { id: 'x018', n: '反坦克地雷', en: 'Anti-tank Mine', sub: 'exp_mine', lore: '专炸钢铁，一辆坦克也就一吨多的压强。', phrase: '坦克的天花板。' },
    { id: 'x019', n: '阔剑定向雷', en: 'Claymore', sub: 'exp_mine', lore: '一面钢珠定向泼出，向前的扇形死神。', phrase: '它只朝一个方向说话。' },
    { id: 'x020', n: '诡雷', en: 'Booby Trap', sub: 'exp_mine', lore: '藏在你最想碰的东西下面，等你伸手。', phrase: '贪心，就是引信。' },
    // ---- 炸药包 ----
    { id: 'x021', n: '炸药包', en: 'Satchel Charge', sub: 'exp_charge', lore: '工兵的经典，捆起来就是一座山。', phrase: '一包，顶一阵炮。' },
    { id: 'x022', n: '线形爆破索', en: 'Det Cord & LSC', sub: 'exp_charge', lore: '一条线拉过去，整条障碍一起开花。', phrase: '一条线，一片花。' },
    // ---- 塑胶炸药 ----
    { id: 'x023', n: 'C4 塑胶炸药', en: 'C4', sub: 'exp_c4', lore: '可捏成任意形状，塞进任何缝隙，稳定到敢当坐垫。', phrase: '你想让它在哪炸，它就在哪炸。' },
    { id: 'x024', n: '塞姆汀', en: 'Semtex', sub: 'exp_c4', lore: '捷克的塑胶炸药，一段时期的"机场恐惧"。', phrase: '捏得动，炸得开。' },
    // ---- 定时炸弹 ----
    { id: 'x025', n: '定时炸弹', en: 'Time Bomb', sub: 'exp_timed', lore: '嘀嗒声是最煎熬的预告，倒数的不是时间，是胆量。', phrase: '时间，是最毒的引信。' },
    { id: 'x026', n: '延迟引爆装置', en: 'Delay Charge', sub: 'exp_timed', lore: '几分钟后它才醒，那时候你已经不在现场。', phrase: '它醒的时候，你已远走。' },
    // ---- 爆破筒 ----
    { id: 'x027', n: '爆破筒', en: 'Bangalore Torpedo', sub: 'exp_bang', lore: '直塞碉堡枪眼，一条铁管就是一座炮。', phrase: '塞进去，就是一锤定音。' },
    { id: 'x028', n: '破障爆破筒', en: 'Demolition Tube', sub: 'exp_bang', lore: '对付铁丝网与障碍墙，开路就靠它。', phrase: '路，炸出来的才硬。' },
    // ---- 简易爆炸装置 ----
    { id: 'x029', n: '简易爆炸装置', en: 'IED', sub: 'exp_ied', lore: '路边炸弹，成本低到发指，威慑大到离谱。', phrase: '成本低，但从不廉价。' },
    { id: 'x030', n: '车载简易炸弹', en: 'Car Bomb', sub: 'exp_ied', lore: '整辆车变成一颗弹，撞进去的往往不是车。', phrase: '开进去的，是它。' }
  ];

  W.weapons = W.weapons.concat(list);
})();
