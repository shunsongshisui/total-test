/* =====================================================================
   本命武器测试 · 冷兵器库（剑 / 刀 / 枪矛 / 锏鞭 / 棍锤 / 斧钺 / 弓弩 / 暗器 / 奇门软兵 / 拳爪）
   条目格式：{ id, n(中文名), en(原名), sub(子类key), lore(一句小传), phrase(一句性格), stats?(稀疏覆盖) }
   sub 必须存在于 data.js 的 subs 中；缺省则继承子类基础七维。
   ===================================================================== */
(function () {
  'use strict';
  var W = window.WEAPON_DATA;

  /* ==================== 剑类 ==================== */
  var swords = [
    // ---- 单手剑 ----
    { id: 'c001', n: '汉剑', en: 'Han Jian', sub: 'sword_single', lore: '汉代武官佩剑，八面剑身，刚直而含蓄，是礼与武的双重符号。', phrase: '威仪，藏于鞘中。' },
    { id: 'c002', n: '秦剑', en: 'Qin Sword', sub: 'sword_single', lore: '秦军制式青铜剑，刃长而锋，韧性让它敢在战场上直刺。', phrase: '大秦的锋芒，从不空回。' },
    { id: 'c003', n: '罗马斯帕塔', en: 'Roman Spatha', sub: 'sword_single', lore: '罗马骑兵长刃，可劈可刺，横跨帝国四百年。', phrase: '帝国的脊梁。' },
    { id: 'c004', n: '维京剑', en: 'Viking Sword', sub: 'sword_single', lore: '维京人的单手剑，剑柄华丽如船首，跟着他们航向未知的海。', phrase: '握它的人，从不回头。' },
    { id: 'c005', n: '骑士随身剑', en: 'Arming Sword', sub: 'sword_single', lore: '中世纪骑士的随身佩剑，单手灵活，配合盾牌攻守兼备。', phrase: '忠诚，即剑刃。' },
    { id: 'c006', n: '明制佩剑', en: 'Ming Pei Jian', sub: 'sword_single', lore: '明代官员与武人的佩剑，剑装金银错彩，是身份更是态度。', phrase: '刀光里，见风骨。' },
    { id: 'c007', n: '欧洲笼手剑', en: 'Basket-hilted Sword', sub: 'sword_single', lore: '护手如笼，护住执剑的手，从此剑术敢更放肆。', phrase: '放手去劈，手有人护。' },
    // ---- 双手剑 / 重剑 ----
    { id: 'c008', n: '德意志双手剑', en: 'Zweihänder', sub: 'sword_two', lore: '文艺复兴雇佣兵的招牌，剑长过人，横扫如墙，一人可挡一面。', phrase: '一人，即一墙。' },
    { id: 'c009', n: '高地阔剑', en: 'Claymore', sub: 'sword_two', lore: '苏格兰高地的大剑，挥起来如风车，让英格兰长弓也退避三舍。', phrase: '群山替我咆哮。' },
    { id: 'c010', n: '中国双手剑', en: 'Chinese Two-hand Sword', sub: 'sword_two', lore: '双手运剑，势大力沉，剑走刚猛，一力降十会。', phrase: '力气，就是剑术。' },
    { id: 'c011', n: '欧洲长剑', en: 'Longsword', sub: 'sword_two', lore: '中世纪长剑，半剑技法可反握破甲，攻防一体。', phrase: '剑，即是半个盾。' },
    { id: 'c012', n: '楚式重剑', en: 'Chu Heavy Sword', sub: 'sword_two', lore: '楚国重剑，剑身厚实，劈砍无双——楚国曾以剑立国。', phrase: '楚国用剑，说了算。' },
    // ---- 软剑 ----
    { id: 'c013', n: '龙泉软剑', en: 'Longquan Soft Sword', sub: 'sword_soft', lore: '剑身可弯成环，缠丝绕腕，讲究以柔克刚，四两拨千斤。', phrase: '绕指柔，夺命刚。' },
    { id: 'c014', n: '蛇形软剑', en: 'Snake Soft Sword', sub: 'sword_soft', lore: '剑走如蛇，忽软忽硬，让对手无从拆解你的下一招。', phrase: '你的力，我全还给你。' },
    // ---- 双剑 ----
    { id: 'c015', n: '雌雄双股剑', en: 'Double Jian', sub: 'sword_double', lore: '双手各持一剑，一长一短，攻守相济，密不透风。', phrase: '左手为盾，右手为矛。' },
    { id: 'c016', n: '鸳鸯剑', en: 'Yuanyang Swords', sub: 'sword_double', lore: '双剑并出如鸳鸯，剑光交错，成双才叫无懈可击。', phrase: '成双，才无破绽。' },
    // ---- 短剑 ----
    { id: 'c017', n: '罗马短剑', en: 'Gladius', sub: 'sword_short', lore: '罗马军团的短剑，近身刺击，是步兵方阵的牙齿。', phrase: '一寸短，一寸险。' },
    { id: 'c018', n: '巴斯特小剑', en: 'Parrying Dagger', sub: 'sword_short', lore: '决斗者的左手剑，格挡、缴械、贴身反击，步步杀机。', phrase: '主剑是名，它是命。' },
    { id: 'c019', n: '青铜短剑', en: 'Bronze Dagger', sub: 'sword_short', lore: '最早的金属短兵之一，贴身缠斗时，它是最终的一句话。', phrase: '短，够用就好。' },
    // ---- 细剑 / 刺剑 ----
    { id: 'c020', n: '西洋细剑', en: 'Rapier', sub: 'sword_thrust', lore: '文艺复兴的决斗剑，只刺不砍，优雅而致命，谈笑间分出胜负。', phrase: '一点寒芒，先到。' },
    { id: 'c021', n: '宫廷刺剑', en: 'Smallsword', sub: 'sword_thrust', lore: '宫廷里的细剑，剑身如针，是绅士最后的礼貌。', phrase: '礼貌，也是一种威胁。' },
    { id: 'c022', n: '花剑', en: 'Fleuret', sub: 'sword_thrust', lore: '现代击剑的花剑原型，灵敏如舌，点到为止却分毫不差。', phrase: '点到，即胜。' },
    // ---- 大剑 / 巨剑 ----
    { id: 'c023', n: '斩马剑', en: 'Zhan Ma Jian', sub: 'sword_great', lore: '巨剑及马，可斩马腿，是战阵之上的重器。', phrase: '马过之处，我即关隘。' },
    { id: 'c024', n: '火焰阔剑', en: 'Flamberge', sub: 'sword_great', lore: '波浪剑刃的巨剑，劈开时阻力奇特，伤口难以缝合。', phrase: '剑刃如火，烧开铠甲。' }
  ];

  /* ==================== 刀类 ==================== */
  var daos = [
    // ---- 唐横刀 ----
    { id: 'c025', n: '环首唐横刀', en: 'Tang Heng Dao', sub: 'dao_heng', lore: '盛唐环首直刀，刀身刚直，马上步兵皆宜。', phrase: '盛唐气象，一刀出鞘。' },
    { id: 'c026', n: '唐仪刀', en: 'Tang Yi Dao', sub: 'dao_heng', lore: '唐代仪仗用刀，刀鞘鎏金，礼与武并立于一处。', phrase: '礼在鞘，武在刃。' },
    { id: 'c027', n: '汉环首刀', en: 'Han Ring-pommel Dao', sub: 'dao_heng', lore: '汉军环首刀，让刀取代剑成为战场主力。', phrase: '从剑到刀，是进化。' },
    // ---- 苗刀 ----
    { id: 'c028', n: '苗刀', en: 'Miao Dao', sub: 'dao_miao', lore: '刀身狭长如苗，兼刀剑之长，明清武举常考之器。', phrase: '长一寸，强一分。' },
    { id: 'c029', n: '辛酉刀法苗刀', en: 'Xinyou Miao Dao', sub: 'dao_miao', lore: '明末抗倭苗刀，辛酉刀法传世，专克倭刀之利。', phrase: '破倭，就在这一刀。' },
    // ---- 弯刀 ----
    { id: 'c030', n: '阿拉伯弯刀', en: 'Scimitar', sub: 'dao_wand', lore: '弧形刀身，马背上挥出，切割如新月掠过。', phrase: '新月之下，皆是我道。' },
    { id: 'c031', n: '波斯舍施尔', en: 'Shamshir', sub: 'dao_wand', lore: '波斯弯刀，弧如弯月，刀术舞起来像一支曲子。', phrase: '优雅，即杀机。' },
    { id: 'c032', n: '土耳其基利', en: 'Kilij', sub: 'dao_wand', lore: '奥斯曼骑兵弯刀，刃背加厚，劈砍力冠绝所有弯刀。', phrase: '铁骑之刃，从不回头。' },
    // ---- 武士刀 / 太刀 ----
    { id: 'c033', n: '太刀', en: 'Tachi', sub: 'dao_samurai', lore: '日本古刀，刃长且弯，悬于腰侧，劈削如风。', phrase: '古都的月色，也斩得断。' },
    { id: 'c034', n: '大太刀', en: 'Ōdachi', sub: 'dao_samurai', lore: '比太刀更长，马战与野战的大杀器，尺寸就是王道。', phrase: '尺寸，就是王道。' },
    { id: 'c035', n: '小太刀', en: 'Kodachi', sub: 'dao_samurai', lore: '短而迅捷，近身缠斗时的意外杀招。', phrase: '快，快过你的眼睛。' },
    // ---- 雁翎刀 ----
    { id: 'c036', n: '雁翎刀', en: 'Yanling Dao', sub: 'dao_yanling', lore: '刀背微弯如雁翎，明军制式，劈砍灵便。', phrase: '雁过留声，刀过留痕。' },
    // ---- 朴刀 ----
    { id: 'c037', n: '朴刀', en: 'Pu Dao', sub: 'dao_pu', lore: '长柄厚背大刀，由农具演变而来，是民间的暴力美学。', phrase: '锄头举起，就是刀。' },
    { id: 'c038', n: '宋代大朴刀', en: 'Song Pu Dao', sub: 'dao_pu', lore: '宋代朴刀，刀长过身，好汉们的招牌家伙。', phrase: '用刀说话，最省事。' },
    // ---- 大刀 / 斩马刀 ----
    { id: 'c039', n: '斩马刀', en: 'Zhan Ma Dao', sub: 'dao_dadao', lore: '长杆大刀，刀头厚重，专斩马腿，重剑无锋大巧不工。', phrase: '重，本身就是道理。' },
    { id: 'c040', n: '陌刀', en: 'Mo Dao', sub: 'dao_dadao', lore: '唐军陌刀，长柄宽刃，结阵如墙，破骑兵如割草。', phrase: '大唐的钢铁城墙。' },
    { id: 'c041', n: '眉尖刀', en: 'Meijian Dao', sub: 'dao_dadao', lore: '宋明长柄刀，刃如眉尖，攻守有度。', phrase: '刀尖所指，即是答案。' },
    // ---- 砍刀 ----
    { id: 'c042', n: '开山刀', en: 'Machete', sub: 'dao_can', lore: '热带的开山刀，斩藤开路，也能让一条街安静下来。', phrase: '路，是我砍出来的。' },
    { id: 'c043', n: '廓尔喀弯刀', en: 'Kukri', sub: 'dao_can', lore: '尼泊尔廓尔喀军的招牌，内弯刀身，一刀可分颅。', phrase: '廓尔喀从不空手回营。' },
    { id: 'c044', n: '柴刀', en: 'Chai Dao', sub: 'dao_can', lore: '农人劈柴的刀，朴素到极致，狠起来也到极致。', phrase: '柴刀无名，杀性十足。' },
    // ---- 蝴蝶刀 ----
    { id: 'c045', n: '蝴蝶刀', en: 'Balisong', sub: 'dao_butterfly', lore: '双柄翻转如蝶，出刀即收刀，快得像一场杂技。', phrase: '蝴蝶开合，刀光已至。' },
    // ---- 短刀 ----
    { id: 'c046', n: '胁差', en: 'Wakizashi', sub: 'dao_short', lore: '武士刀之伴，屋内与近身的第二把刃。', phrase: '退一步，还有它。' },
    { id: 'c047', n: '卡巴战斗刀', en: 'Ka-Bar', sub: 'dao_short', lore: '海军陆战队的战斗短刀，每一刀都很务实。', phrase: '务实到不给第二刀。' },
    { id: 'c048', n: '马来克力士', en: 'Keris', sub: 'dao_short', lore: '波形刃短刀，南洋的护身与凶器，波纹里藏着杀意。', phrase: '波纹之下，皆是锋芒。' }
  ];

  /* ==================== 枪矛类 ==================== */
  var spears = [
    // ---- 长枪 ----
    { id: 'c049', n: '白蜡杆长枪', en: 'Bailagan Spear', sub: 'spear_long', lore: '枪杆柔韧，枪尖一点寒星，百兵之王。', phrase: '一寸长，一寸强。' },
    { id: 'c050', n: '杨家枪', en: 'Yang Family Spear', sub: 'spear_long', lore: '杨家枪传世，枪法如龙，马战称雄。', phrase: '忠烈，都在枪法里。' },
    // ---- 红缨枪 ----
    { id: 'c051', n: '红缨枪', en: 'Red-tassel Spear', sub: 'spear_red', lore: '枪头系红缨，抖枪时掩血防滑，也壮三分声势。', phrase: '缨红，是因为饮过血。' },
    // ---- 花枪 ----
    { id: 'c052', n: '花枪', en: 'Hua Qiang', sub: 'spear_hua', lore: '枪身细，枪法花，出手如百花乱坠，看着是花，沾着是刃。', phrase: '看着是花，沾着是刃。' },
    // ---- 大枪 ----
    { id: 'c053', n: '大枪', en: 'Da Qiang', sub: 'spear_da', lore: '枪杆粗长，非力大者不能运，一枪刺出如山岳。', phrase: '一枪，便是一堵墙。' },
    // ---- 槊 ----
    { id: 'c054', n: '马槊', en: 'Ma Shuo', sub: 'spear_shuo', lore: '南北朝重骑兵的长槊，杆长丈余，能贯穿铁甲。', phrase: '重装铁骑的矛尖。' },
    { id: 'c055', n: '唐槊', en: 'Tang Shuo', sub: 'spear_shuo', lore: '唐代骑兵长槊，扎阵如凿，一寸长一寸强。', phrase: '凿开你的甲，像凿城墙。' },
    // ---- 矛 ----
    { id: 'c056', n: '青铜矛', en: 'Bronze Spearhead', sub: 'spear_mao', lore: '商周主力兵器，青铜矛头，列阵如林。', phrase: '三千矛，三千道命令。' },
    { id: 'c057', n: '罗马标枪', en: 'Pilum', sub: 'spear_mao', lore: '罗马军团投掷矛，掷出后弯折难拔，废敌之盾。', phrase: '扔出去，就是命令。' },
    // ---- 戈 ----
    { id: 'c058', n: '青铜戈', en: 'Ge Halberd', sub: 'spear_ge', lore: '商周"钩兵"，横啄侧勾，战车时代的主力。', phrase: '戈的每一下勾，都是宣判。' },
    // ---- 戟 ----
    { id: 'c059', n: '青铜戟', en: 'Bronze Ji', sub: 'spear_ji', lore: '戈矛合体，可钩可刺，战车与步阵的复合之器。', phrase: '钩与刺，我都占。' },
    { id: 'c060', n: '双刃戟', en: 'Double-edged Ji', sub: 'spear_ji', lore: '枝刃与枪尖双锋并立，攻守间变化无穷。', phrase: '一招之后，还有一招。' },
    { id: 'c061', n: '月牙戟', en: 'Crescent Ji', sub: 'spear_ji', lore: '侧枝弯如月牙，能锁能割，让对手措手不及。', phrase: '月牙所指，皆有锋芒。' },
    // ---- 方天画戟 ----
    { id: 'c062', n: '画戟', en: 'Huaji', sub: 'spear_fangtian', lore: '宋代画戟，列于仪仗，装饰多于杀伐，但也是一种威慑。', phrase: '不出鞘时，也是威慑。' },
    // ---- 钩镰枪 ----
    { id: 'c063', n: '钩镰枪', en: 'Hook Sickle Spear', sub: 'spear_hook', lore: '枪头带钩镰，专钩马腿破铁骑，是骑兵的噩梦。', phrase: '骑兵的噩梦，是它的日常。' }
  ];

  /* ==================== 锏鞭类 ==================== */
  var whips = [
    // ---- 锏 ----
    { id: 'c064', n: '锏', en: 'Jian (Mace)', sub: 'whip_jian', lore: '四棱无锋，专破重甲，打人不流血，内伤先到。', phrase: '不流血，也要你记住。' },
    { id: 'c065', n: '金锏', en: 'Gold Jian', sub: 'whip_jian', lore: '瓦岗秦琼持金锏，忠义与刚硬融于一身。', phrase: '刚硬到不讲情面。' },
    // ---- 双锏 ----
    { id: 'c066', n: '双锏', en: 'Double Jian', sub: 'whip_double', lore: '双锏在手，攻守兼备，近身格挡的利器。', phrase: '左手挡，右手打。' },
    // ---- 铁鞭 ----
    { id: 'c067', n: '铁鞭', en: 'Iron Bian', sub: 'whip_iron', lore: '竹节状铁鞭，鞭打百炼，宋代武人的标配。', phrase: '打的是骨头，记的是教训。' },
    { id: 'c068', n: '竹节钢鞭', en: 'Bamboo-joint Steel Whip', sub: 'whip_iron', lore: '鞭身如竹节，力道灌入，隔甲透力。', phrase: '力透三层甲。' },
    // ---- 九节鞭 ----
    { id: 'c069', n: '九节鞭', en: 'Nine-section Whip', sub: 'whip_nine', lore: '九节相连，舞动如蛇，缠、扫、抽、勒皆可。', phrase: '缠住你，就别想走。' },
    // ---- 皮鞭 ----
    { id: 'c070', n: '马鞭', en: 'Riding Crop', sub: 'whip_leather', lore: '牧马人的工具，响鞭如雷，驭马亦驭人。', phrase: '一声响，万马齐喑。' }
  ];

  /* ==================== 棍锤类 ==================== */
  var hammers = [
    // ---- 铁棍 ----
    { id: 'c071', n: '齐眉棍', en: 'Qi Mei Gun', sub: 'stick_iron', lore: '棍与眉齐，可攻可守，是最诚实的兵器。', phrase: '没有花招，只有棍。' },
    { id: 'c072', n: '少林棍', en: 'Shaolin Staff', sub: 'stick_iron', lore: '少林寺的看家本领，一棍扫出千层浪。', phrase: '棍僧的禅，也是棍。' },
    // ---- 熟铜棍 ----
    { id: 'c073', n: '熟铜棍', en: 'Copper Staff', sub: 'stick_copper', lore: '铜棍沉重，砸山开石，是力量型武者的最爱。', phrase: '重，就是道理。' },
    // ---- 狼牙棒 ----
    { id: 'c074', n: '狼牙棒', en: 'Wolf-tooth Club', sub: 'stick_langya', lore: '棒身钉满铁齿，被它擦着一下，皮开肉绽。', phrase: '狼牙过处，片甲不留。' },
    // ---- 战锤 ----
    { id: 'c075', n: '破甲战锤', en: 'War Hammer', sub: 'hammer_war', lore: '中世纪破甲利器，尖锤一凿，能穿板甲。', phrase: '甲再厚，也挡不住一锤。' },
    { id: 'c076', n: '短把战锤', en: 'Horseman Hammer', sub: 'hammer_war', lore: '马上的短锤，近战一锤定音，不拖泥带水。', phrase: '一锤，就够。' },
    // ---- 双锤 ----
    { id: 'c077', n: '双锤', en: 'Double Hammer', sub: 'hammer_double', lore: '双手持锤，抡起来密不透风，力与威的展示。', phrase: '双锤出，山让路。' },
    // ---- 流星锤 ----
    { id: 'c078', n: '流星锤', en: 'Meteor Hammer', sub: 'hammer_meteor', lore: '长绳系锤，掷出如流星，收放之间藏着杀机。', phrase: '流星划破的，是防线。' },
    // ---- 钉头锤 ----
    { id: 'c079', n: '晨星锤', en: 'Morning Star', sub: 'hammer_spike', lore: '球头带刺，锤与链的合体，破甲又破盾。', phrase: '它的问候，没人想接。' },
    // ---- 禅杖 ----
    { id: 'c080', n: '月牙禅杖', en: 'Monk Spade', sub: 'staff_chan', lore: '僧人的防身法器，月牙铲头，挑、铲、劈皆可。', phrase: '慈悲为怀，禅杖开路。' }
  ];

  /* ==================== 斧钺类 ==================== */
  var axes = [
    // ---- 战斧 ----
    { id: 'c081', n: '维京战斧', en: 'Viking Axe', sub: 'axe_war', lore: '维京人的斧，劈船板也劈人，双手持握势不可挡。', phrase: '他们不是海盗，是斧头。' },
    { id: 'c082', n: '法兰克投掷斧', en: 'Francisca', sub: 'axe_war', lore: '掷出回旋的短斧，中者必倒，是冲锋前的一句话。', phrase: '飞出去的是问候。' },
    // ---- 双斧 ----
    { id: 'c083', n: '双板斧', en: 'Double Axe', sub: 'axe_double', lore: '双斧并举，如风车旋转，三板斧的名头传了几百年。', phrase: '三板斧，够了。' },
    // ---- 手斧 ----
    { id: 'c084', n: '战斧', en: 'Tomahawk', sub: 'axe_hand', lore: '轻巧的投掷斧，近战与远掷两用，越轻越近越危险。', phrase: '越轻，越近，越危险。' },
    // ---- 钺 ----
    { id: 'c085', n: '青铜钺', en: 'Bronze Yue', sub: 'axe_yue', lore: '王权的象征，行刑的凶器，斧头中的贵族。', phrase: '王者的威严，也是一道刃。' }
  ];

  /* ==================== 弓弩类 ==================== */
  var bows = [
    // ---- 长弓 ----
    { id: 'c086', n: '英格兰长弓', en: 'English Longbow', sub: 'bow_long', lore: '英法百年战争的功臣，箭如雨下，破甲如纸。', phrase: '拉开弦，就是战鼓。' },
    { id: 'c087', n: '和弓', en: 'Japanese Yumi', sub: 'bow_long', lore: '日本长弓，弓身超长，弓道里藏着禅意。', phrase: '射，即是禅。' },
    // ---- 反曲弓 ----
    { id: 'c088', n: '蒙古复合反曲弓', en: 'Mongol Recurve', sub: 'bow_recurve', lore: '成吉思汗铁骑之弓，马蹄上的雷霆，驰射如风。', phrase: '骑射，是草原的哲学。' },
    { id: 'c089', n: '土耳其飞弓', en: 'Turkish Flight Bow', sub: 'bow_recurve', lore: '短小精悍的反曲弓，马上连射，又快又准。', phrase: '马不停，箭不停。' },
    // ---- 复合弓 ----
    { id: 'c090', n: '现代复合弓', en: 'Compound Bow', sub: 'bow_compound', lore: '滑轮省力，箭速惊人，精准与威力的现代平衡。', phrase: '科学，是最好的弓弦。' },
    // ---- 弩 ----
    { id: 'c091', n: '秦弩', en: 'Qin Crossbow', sub: 'crossbow_nu', lore: '秦军列阵而射，弩箭破甲，是天下一统的铁证。', phrase: '秦弩所向，皆为秦土。' },
    { id: 'c092', n: '欧洲十字弩', en: 'European Crossbow', sub: 'crossbow_nu', lore: '重弩蓄力，穿甲如穿纸，让农夫也能弑骑士。', phrase: '平等，由弩箭射出来。' },
    // ---- 诸葛连弩 ----
    { id: 'c093', n: '诸葛连弩', en: 'Zhuge Repeating Crossbow', sub: 'crossbow_zhuge', lore: '相传诸葛亮所造，十矢并发，守城利器。', phrase: '一弩既出，十矢齐鸣。' },
    // ---- 十字弩 ----
    { id: 'c094', n: '手弩', en: 'Hand Crossbow', sub: 'crossbow_xi', lore: '单手可持的弩，近程快射，刺客与猎人的偏爱。', phrase: '悄无声息，正中要害。' }
  ];

  /* ==================== 暗器类 ==================== */
  var hidden = [
    // ---- 飞刀 ----
    { id: 'c095', n: '柳叶飞刀', en: 'Willow-leaf Knife', sub: 'hidden_knife', lore: '柳叶形的飞刀，掷出旋转如叶落，直取要害。', phrase: '叶落，人知凉。' },
    { id: 'c096', n: '无影飞刀', en: 'Shadowless Knife', sub: 'hidden_knife', lore: '出手无影，刀刀奔着咽喉去，风到之前刀已到。', phrase: '刀先到，风才到。' },
    // ---- 飞镖 ----
    { id: 'c097', n: '金钱镖', en: 'Coin Dart', sub: 'hidden_dart', lore: '铜钱打磨的镖，随手一枚，防不胜防。', phrase: '铜臭里，也是杀机。' },
    { id: 'c098', n: '袖镖', en: 'Sleeve Dart', sub: 'hidden_dart', lore: '藏于袖中的镖，挥手即出，招呼都不打一个。', phrase: '挥手之间，胜负已分。' },
    // ---- 飞针 ----
    { id: 'c099', n: '梅花针', en: 'Plum Needle', sub: 'hidden_needle', lore: '纤细如针，可藏于发间指缝，中人难察。', phrase: '细如牛毛，毒如蛇蝎。' },
    // ---- 袖箭 ----
    { id: 'c100', n: '袖箭', en: 'Sleeve Arrow', sub: 'hidden_sleeve', lore: '机关藏于袖中，一按而出，近身杀手锏。', phrase: '它的箭，从不打招呼。' },
    // ---- 峨眉刺 ----
    { id: 'c101', n: '峨眉刺', en: 'Emei Ci', sub: 'hidden_eimei', lore: '峨眉派的短刺，中空套指，旋转如钻。', phrase: '指尖上的钻头。' },
    // ---- 判官笔 ----
    { id: 'c102', n: '判官笔', en: 'Judge Pen', sub: 'hidden_pen', lore: '形如毛笔的短兵器，点穴戳要害，是文人式的暗器。', phrase: '生死簿上，我写最后一笔。' }
  ];

  /* ==================== 奇门软兵 ==================== */
  var odd = [
    // ---- 三节棍 ----
    { id: 'c103', n: '三节棍', en: 'Three-section Staff', sub: 'odd_3sec', lore: '三节铁链相连，展开如鞭，收拢如棍。', phrase: '收放之间，皆是杀招。' },
    // ---- 双截棍 ----
    { id: 'c104', n: '双截棍', en: 'Nunchaku', sub: 'odd_nunchaku', lore: '李小龙的招牌，快如闪电，攻守转换只在瞬息。', phrase: '快到你只看见影子。' },
    // ---- 绳镖 ----
    { id: 'c105', n: '绳镖', en: 'Rope Dart', sub: 'odd_rope', lore: '绳索系镖，掷出收回，是暗器中的柔道。', phrase: '放出去的，还能收回来。' },
    // ---- 铁扇 ----
    { id: 'c106', n: '铁扇', en: 'Iron Fan', sub: 'odd_fan', lore: '折扇铁骨，合拢是短棍，张开是盾，扇风也扇血。', phrase: '摇扇的手，也是握刃的手。' },
    // ---- 铁链 ----
    { id: 'c107', n: '铁链', en: 'Iron Chain', sub: 'odd_chain', lore: '粗铁链一条，缠、扫、勒、砸，市井的凶狠。', phrase: '街头的规矩，链子说了算。' }
  ];

  /* ==================== 拳爪类 ==================== */
  var fists = [
    // ---- 拳套 ----
    { id: 'c108', n: '格斗拳套', en: 'Fighting Knuckles', sub: 'fist_knuckle', lore: '钢制护拳，拳拳到肉，一寸短一寸险。', phrase: '我的拳头，就是兵器。' },
    // ---- 指虎 ----
    { id: 'c109', n: '指虎', en: 'Brass Knuckles', sub: 'fist_brass', lore: '套于指间，一拳下去，骨头先碎。', phrase: '一握，就是一块铁。' },
    // ---- 铁爪 ----
    { id: 'c110', n: '铁爪', en: 'Iron Claw', sub: 'fist_claw', lore: '指尖铁爪，抓、撕、扣，近身即撕。', phrase: '被它抓住，就别想全身而退。' }
  ];

  W.weapons = W.weapons.concat(swords, daos, spears, whips, hammers, axes, bows, hidden, odd, fists);
})();
