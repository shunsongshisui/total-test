/* =====================================================================
   本命武器测试 · 核心数据层
   模型：7 维战斗气质（刚猛/迅捷/精准/射程/灵动/坚韧/时代），各 0–100。
     28 题（7 维 × 4 题，每维含 1 道反向题），答案映射为"理想武器画像"，
     再与全武器库逐把加权欧氏距离，最近者为本命武器。
   武器库：4 大类（冷兵器/热武器/爆炸物/名器）→ 组 → 子类（subs 定义
   基础七维）→ 具体条目（继承子类，名器/名枪可稀疏覆盖 stats）。
   数据文件按类拆分：data-cold.js / data-guns.js / data-exp.js / data-mythic.js。
   本测试为趣味自评，供自省与娱乐，非军事建议、非心理诊断。
   ===================================================================== */
window.WEAPON_DATA = {

  /* ---------- 7 维定义 ---------- */
  dims: [
    { key: 'power',      name: '刚猛', short: '刚', desc: '爆发力 · 破坏力' },
    { key: 'speed',      name: '迅捷', short: '迅', desc: '出招 · 攻速' },
    { key: 'precision',  name: '精准', short: '准', desc: '技巧 · 命中' },
    { key: 'range',      name: '射程', short: '射', desc: '有效距离' },
    { key: 'mobility',   name: '灵动', short: '灵', desc: '轻便 · 灵活' },
    { key: 'toughness',  name: '坚韧', short: '韧', desc: '耐打 · 硬扛' },
    { key: 'era',        name: '时代', short: '代', desc: '古典 ↔ 现代' }
  ],

  /* ---------- 计分参数 ---------- */
  scoring: {
    likertMin: 1,
    likertMax: 5,
    neutral: 3,            // 跳过题按中立计（→ 50 分）
    eraWeight: 1.5,        // 时代维度权重略高，强化"冷/热"分化
    flatRange: 15          // 7 维极差 < 此值判为"扁平画像"
  },

  /* ---------- 28 道题（7 维 × 4，每维含 1 道反向题 dir:'-'） ----------
     题面全部"隐晦化"：情境式描述，不出现"刚猛/迅捷"等维度字面，
     看不出哪个答案更好。正向 = 同意推高该维；反向 = 同意压低该维。
  */
  questions: [
    // ===== 刚猛 =====
    { id: 'p1', dim: 'power',     text: '面前是一扇锁死的铁门，时间不等人——我第一反应是直接撞开或砸开，而不是先找钥匙。' },
    { id: 'p2', dim: 'power',     text: '团队遇上硬仗时，我通常是第一个撸袖子顶上、把"重活"揽下来的那个。' },
    { id: 'p3', dim: 'power',     text: '说服不了别人的时候，我宁可跟对方正面掰手腕，也不想低声下气。' },
    { id: 'p4', dim: 'power', dir: '-', text: '我擅长借力打力、四两拨千斤，几乎不需要用蛮力硬碰。' },
    // ===== 迅捷 =====
    { id: 's1', dim: 'speed',     text: '我做事讲究"快"——宁可先干起来，也不愿在原地反复琢磨。' },
    { id: 's2', dim: 'speed',     text: '加载条多转两圈我就开始烦躁——等待对我来说是一种酷刑。' },
    { id: 's3', dim: 'speed',     text: '遇到突发状况，我往往是第一个反应过来、第一个行动的人。' },
    { id: 's4', dim: 'speed', dir: '-', text: '我习惯慢工出细活——宁可慢一点，也不能粗糙地交差。' },
    // ===== 精准 =====
    { id: 'c1', dim: 'precision', text: '比起广撒网，我更享受把一件事做到极致精细。' },
    { id: 'c2', dim: 'precision', text: '投掷、射击、落笔这类讲究"准头"的事，我向来不怵。' },
    { id: 'c3', dim: 'precision', text: '我宁可多花一倍时间，也要让每一个细节待在它该在的位置。' },
    { id: 'c4', dim: 'precision', dir: '-', text: '别人常说我粗枝大叶——大方向对就行，细节差不多得了。' },
    // ===== 射程 =====
    { id: 'r1', dim: 'range',     text: '面对冲突，我本能地先拉开距离，站到安全的观察位再看情况。' },
    { id: 'r2', dim: 'range',     text: '我更信任"隔着一段距离解决问题"——能不近身就不近身。' },
    { id: 'r3', dim: 'range',     text: '挑位置时，我总想挑个视野开阔、进可攻退可守的"高位"。' },
    { id: 'r4', dim: 'range', dir: '-', text: '短兵相接、贴身缠斗的紧张感，反而让我觉得痛快。' },
    // ===== 灵动 =====
    { id: 'm1', dim: 'mobility',  text: '出门我喜欢轻装简行，身上东西越少越自在。' },
    { id: 'm2', dim: 'mobility',  text: '在人堆里我能穿梭自如，很少被挤到、堵到。' },
    { id: 'm3', dim: 'mobility',  text: '遇到麻烦，我第一反应是"跑"——灵活走位远比硬扛划算。' },
    { id: 'm4', dim: 'mobility', dir: '-', text: '我走到哪都习惯带齐装备，宁可多备一点，也不能缺一样。' },
    // ===== 坚韧 =====
    { id: 't1', dim: 'toughness', text: '受挫或受伤时，我习惯咬牙硬扛，很少让人看出不对劲。' },
    { id: 't2', dim: 'toughness', text: '别人说我能扛事——压力越大，我反而越沉得住。' },
    { id: 't3', dim: 'toughness', text: '持久战比闪电战更合我脾气：我更怕的是"熬不到点"，不是"熬得久"。' },
    { id: 't4', dim: 'toughness', dir: '-', text: '一有不对劲，我先躲起来观察，从不让自己当靶子。' },
    // ===== 时代 =====
    { id: 'e1', dim: 'era',       text: '比起刀光剑影的古老战场，我更喜欢齿轮、火药与硝烟的味道。' },
    { id: 'e2', dim: 'era',       text: '挑装备我信"最新款"——精度、稳定性、可维护性都比情怀重要。' },
    { id: 'e3', dim: 'era', dir: '-', text: '我反而对老物件、手工技艺、传统兵器，有说不清的亲近感。' },
    { id: 'e4', dim: 'era',       text: '如果让我选搭档，我更信任一台精密现代的设备，而不是一把传世老剑。' }
  ],

  /* ---------- 子类定义（~65 个） ----------
     cat : 大类（cold/gun/exp/mythic）
     group : 组名（图鉴分组）
     label : 子类名
     icon : 默认图标（武器条目可覆盖）
     stats : 基础七维（0-100）；武器条目可稀疏覆盖个别维度
     lore / phrase : 可选兜底文案
  */
  subs: {

    /* ===== 冷兵器 · 剑类 ===== */
    sword_single:  { cat: 'cold', group: '剑类', label: '单手剑',   icon: '🗡️', stats: { power: 55, speed: 70, range: 10, precision: 65, mobility: 70, toughness: 45, era: 8 } },
    sword_two:     { cat: 'cold', group: '剑类', label: '双手剑 · 重剑', icon: '⚔️', stats: { power: 80, speed: 45, range: 15, precision: 55, mobility: 40, toughness: 70, era: 8 } },
    sword_soft:    { cat: 'cold', group: '剑类', label: '软剑',     icon: '🪶', stats: { power: 45, speed: 80, range: 15, precision: 70, mobility: 80, toughness: 30, era: 6 } },
    sword_double:  { cat: 'cold', group: '剑类', label: '双剑',     icon: '🥢', stats: { power: 60, speed: 78, range: 12, precision: 62, mobility: 75, toughness: 40, era: 8 } },
    sword_short:   { cat: 'cold', group: '剑类', label: '短剑',     icon: '🔪', stats: { power: 45, speed: 78, range: 5,  precision: 70, mobility: 80, toughness: 30, era: 8 } },
    sword_thrust:  { cat: 'cold', group: '剑类', label: '细剑 · 刺剑', icon: '📌', stats: { power: 40, speed: 72, range: 12, precision: 82, mobility: 75, toughness: 25, era: 8 } },
    sword_great:   { cat: 'cold', group: '剑类', label: '大剑 · 巨剑', icon: '⚔️', stats: { power: 90, speed: 35, range: 18, precision: 50, mobility: 30, toughness: 78, era: 7 } },

    /* ===== 冷兵器 · 刀类 ===== */
    dao_heng:      { cat: 'cold', group: '刀类', label: '唐横刀',   icon: '⚔️', stats: { power: 65, speed: 68, range: 12, precision: 60, mobility: 68, toughness: 50, era: 8 } },
    dao_miao:      { cat: 'cold', group: '刀类', label: '苗刀',     icon: '🗡️', stats: { power: 68, speed: 72, range: 18, precision: 58, mobility: 60, toughness: 55, era: 7 } },
    dao_wand:      { cat: 'cold', group: '刀类', label: '弯刀',     icon: '🔪', stats: { power: 60, speed: 75, range: 10, precision: 58, mobility: 72, toughness: 40, era: 8 } },
    dao_samurai:   { cat: 'cold', group: '刀类', label: '武士刀 · 太刀', icon: '🗡️', stats: { power: 70, speed: 72, range: 14, precision: 72, mobility: 65, toughness: 42, era: 8 } },
    dao_yanling:   { cat: 'cold', group: '刀类', label: '雁翎刀',   icon: '🔪', stats: { power: 62, speed: 70, range: 12, precision: 60, mobility: 66, toughness: 48, era: 7 } },
    dao_pu:        { cat: 'cold', group: '刀类', label: '朴刀',     icon: '🗡️', stats: { power: 78, speed: 55, range: 20, precision: 52, mobility: 55, toughness: 60, era: 7 } },
    dao_dadao:     { cat: 'cold', group: '刀类', label: '大刀 · 斩马刀', icon: '🪓', stats: { power: 88, speed: 42, range: 24, precision: 48, mobility: 40, toughness: 72, era: 7 } },
    dao_can:       { cat: 'cold', group: '刀类', label: '砍刀',     icon: '🔪', stats: { power: 70, speed: 60, range: 10, precision: 50, mobility: 62, toughness: 55, era: 8 } },
    dao_butterfly: { cat: 'cold', group: '刀类', label: '蝴蝶刀',   icon: '🦋', stats: { power: 40, speed: 82, range: 3,  precision: 60, mobility: 85, toughness: 20, era: 9 } },
    dao_short:     { cat: 'cold', group: '刀类', label: '短刀',     icon: '🔪', stats: { power: 55, speed: 75, range: 6,  precision: 62, mobility: 78, toughness: 38, era: 8 } },

    /* ===== 冷兵器 · 枪矛类 ===== */
    spear_long:    { cat: 'cold', group: '枪矛类', label: '长枪',   icon: '🎋', stats: { power: 72, speed: 65, range: 38, precision: 55, mobility: 58, toughness: 52, era: 6 } },
    spear_red:     { cat: 'cold', group: '枪矛类', label: '红缨枪', icon: '🎋', stats: { power: 70, speed: 70, range: 35, precision: 58, mobility: 62, toughness: 48, era: 6 } },
    spear_hua:     { cat: 'cold', group: '枪矛类', label: '花枪',   icon: '🎋', stats: { power: 60, speed: 80, range: 32, precision: 65, mobility: 70, toughness: 38, era: 6 } },
    spear_da:      { cat: 'cold', group: '枪矛类', label: '大枪',   icon: '🎋', stats: { power: 85, speed: 52, range: 40, precision: 50, mobility: 48, toughness: 65, era: 6 } },
    spear_shuo:    { cat: 'cold', group: '枪矛类', label: '槊',     icon: '🗡️', stats: { power: 82, speed: 55, range: 42, precision: 55, mobility: 50, toughness: 68, era: 5 } },
    spear_mao:     { cat: 'cold', group: '枪矛类', label: '矛',     icon: '🗡️', stats: { power: 70, speed: 62, range: 36, precision: 52, mobility: 56, toughness: 55, era: 5 } },
    spear_ge:      { cat: 'cold', group: '枪矛类', label: '戈',     icon: '🏹', stats: { power: 68, speed: 60, range: 34, precision: 48, mobility: 55, toughness: 60, era: 4 } },
    spear_ji:      { cat: 'cold', group: '枪矛类', label: '戟',     icon: '⚜️', stats: { power: 78, speed: 60, range: 38, precision: 52, mobility: 55, toughness: 62, era: 5 } },
    spear_fangtian:{ cat: 'cold', group: '枪矛类', label: '方天画戟', icon: '⚜️', stats: { power: 88, speed: 60, range: 42, precision: 55, mobility: 52, toughness: 70, era: 5 } },
    spear_hook:    { cat: 'cold', group: '枪矛类', label: '钩镰枪', icon: '🪝', stats: { power: 72, speed: 58, range: 36, precision: 58, mobility: 54, toughness: 60, era: 5 } },

    /* ===== 冷兵器 · 锏鞭类 ===== */
    whip_jian:     { cat: 'cold', group: '锏鞭类', label: '锏',     icon: '🥢', stats: { power: 70, speed: 65, range: 15, precision: 55, mobility: 60, toughness: 68, era: 5 } },
    whip_double:   { cat: 'cold', group: '锏鞭类', label: '双锏',   icon: '🥢', stats: { power: 74, speed: 68, range: 14, precision: 56, mobility: 62, toughness: 66, era: 5 } },
    whip_iron:     { cat: 'cold', group: '锏鞭类', label: '铁鞭',   icon: '🥢', stats: { power: 72, speed: 64, range: 16, precision: 54, mobility: 58, toughness: 66, era: 5 } },
    whip_nine:     { cat: 'cold', group: '锏鞭类', label: '九节鞭', icon: '🪢', stats: { power: 50, speed: 72, range: 28, precision: 52, mobility: 72, toughness: 30, era: 5 } },
    whip_leather:  { cat: 'cold', group: '锏鞭类', label: '皮鞭',   icon: '🐍', stats: { power: 40, speed: 70, range: 30, precision: 55, mobility: 68, toughness: 22, era: 5 } },

    /* ===== 冷兵器 · 棍锤类 ===== */
    stick_iron:    { cat: 'cold', group: '棍锤类', label: '铁棍',   icon: '🥢', stats: { power: 68, speed: 62, range: 26, precision: 50, mobility: 62, toughness: 58, era: 5 } },
    stick_copper:  { cat: 'cold', group: '棍锤类', label: '熟铜棍', icon: '🥢', stats: { power: 72, speed: 60, range: 26, precision: 50, mobility: 58, toughness: 62, era: 5 } },
    stick_langya:  { cat: 'cold', group: '棍锤类', label: '狼牙棒', icon: '🪓', stats: { power: 85, speed: 48, range: 20, precision: 42, mobility: 48, toughness: 75, era: 4 } },
    hammer_war:    { cat: 'cold', group: '棍锤类', label: '战锤',   icon: '🔨', stats: { power: 88, speed: 42, range: 18, precision: 45, mobility: 42, toughness: 78, era: 4 } },
    hammer_double: { cat: 'cold', group: '棍锤类', label: '双锤',   icon: '🔨', stats: { power: 90, speed: 45, range: 15, precision: 45, mobility: 45, toughness: 80, era: 4 } },
    hammer_meteor: { cat: 'cold', group: '棍锤类', label: '流星锤', icon: '⛓️', stats: { power: 80, speed: 50, range: 30, precision: 50, mobility: 55, toughness: 65, era: 4 } },
    hammer_spike:  { cat: 'cold', group: '棍锤类', label: '钉头锤', icon: '🔨', stats: { power: 80, speed: 48, range: 16, precision: 48, mobility: 48, toughness: 72, era: 4 } },
    staff_chan:    { cat: 'cold', group: '棍锤类', label: '禅杖',   icon: '🥢', stats: { power: 78, speed: 55, range: 28, precision: 48, mobility: 50, toughness: 70, era: 4 } },

    /* ===== 冷兵器 · 斧钺类 ===== */
    axe_war:       { cat: 'cold', group: '斧钺类', label: '战斧',   icon: '🪓', stats: { power: 85, speed: 48, range: 18, precision: 45, mobility: 45, toughness: 72, era: 4 } },
    axe_double:    { cat: 'cold', group: '斧钺类', label: '双斧',   icon: '🪓', stats: { power: 86, speed: 52, range: 16, precision: 45, mobility: 48, toughness: 70, era: 4 } },
    axe_hand:      { cat: 'cold', group: '斧钺类', label: '手斧',   icon: '🪓', stats: { power: 72, speed: 62, range: 10, precision: 52, mobility: 70, toughness: 52, era: 5 } },
    axe_yue:       { cat: 'cold', group: '斧钺类', label: '钺',     icon: '🪓', stats: { power: 88, speed: 42, range: 20, precision: 46, mobility: 40, toughness: 76, era: 4 } },

    /* ===== 冷兵器 · 弓弩类 ===== */
    bow_long:      { cat: 'cold', group: '弓弩类', label: '长弓',   icon: '🏹', stats: { power: 72, speed: 48, range: 68, precision: 70, mobility: 45, toughness: 40, era: 5 } },
    bow_recurve:   { cat: 'cold', group: '弓弩类', label: '反曲弓', icon: '🏹', stats: { power: 68, speed: 55, range: 66, precision: 72, mobility: 55, toughness: 35, era: 6 } },
    bow_compound:  { cat: 'cold', group: '弓弩类', label: '复合弓', icon: '🏹', stats: { power: 78, speed: 58, range: 72, precision: 80, mobility: 52, toughness: 38, era: 7 } },
    crossbow_nu:   { cat: 'cold', group: '弓弩类', label: '弩',     icon: '🎯', stats: { power: 75, speed: 42, range: 70, precision: 82, mobility: 40, toughness: 35, era: 5 } },
    crossbow_zhuge:{ cat: 'cold', group: '弓弩类', label: '诸葛连弩', icon: '🎯', stats: { power: 60, speed: 65, range: 60, precision: 65, mobility: 42, toughness: 32, era: 4 } },
    crossbow_xi:   { cat: 'cold', group: '弓弩类', label: '十字弩', icon: '🎯', stats: { power: 72, speed: 44, range: 68, precision: 80, mobility: 42, toughness: 34, era: 5 } },

    /* ===== 冷兵器 · 暗器类 ===== */
    hidden_knife:  { cat: 'cold', group: '暗器类', label: '飞刀',   icon: '🗡️', stats: { power: 52, speed: 68, range: 30, precision: 75, mobility: 80, toughness: 20, era: 5 } },
    hidden_dart:   { cat: 'cold', group: '暗器类', label: '飞镖',   icon: '🎯', stats: { power: 45, speed: 70, range: 32, precision: 70, mobility: 82, toughness: 18, era: 5 } },
    hidden_needle: { cat: 'cold', group: '暗器类', label: '飞针',   icon: '📌', stats: { power: 35, speed: 75, range: 28, precision: 82, mobility: 85, toughness: 15, era: 5 } },
    hidden_sleeve: { cat: 'cold', group: '暗器类', label: '袖箭',   icon: '🎯', stats: { power: 42, speed: 72, range: 30, precision: 75, mobility: 80, toughness: 18, era: 5 } },
    hidden_eimei:  { cat: 'cold', group: '暗器类', label: '峨眉刺', icon: '📌', stats: { power: 45, speed: 78, range: 6,  precision: 70, mobility: 85, toughness: 22, era: 5 } },
    hidden_pen:    { cat: 'cold', group: '暗器类', label: '判官笔', icon: '🖊️', stats: { power: 40, speed: 72, range: 5,  precision: 78, mobility: 80, toughness: 22, era: 5 } },

    /* ===== 冷兵器 · 奇门软兵 ===== */
    odd_3sec:      { cat: 'cold', group: '奇门软兵', label: '三节棍', icon: '🥢', stats: { power: 62, speed: 65, range: 24, precision: 55, mobility: 65, toughness: 35, era: 4 } },
    odd_nunchaku:  { cat: 'cold', group: '奇门软兵', label: '双截棍', icon: '🥢', stats: { power: 55, speed: 78, range: 20, precision: 58, mobility: 78, toughness: 28, era: 5 } },
    odd_rope:      { cat: 'cold', group: '奇门软兵', label: '绳镖',  icon: '⛓️', stats: { power: 50, speed: 68, range: 34, precision: 65, mobility: 72, toughness: 25, era: 4 } },
    odd_fan:       { cat: 'cold', group: '奇门软兵', label: '铁扇',  icon: '🪭', stats: { power: 38, speed: 72, range: 4,  precision: 72, mobility: 82, toughness: 18, era: 5 } },
    odd_chain:     { cat: 'cold', group: '奇门软兵', label: '铁链',  icon: '⛓️', stats: { power: 55, speed: 62, range: 28, precision: 50, mobility: 62, toughness: 35, era: 4 } },

    /* ===== 冷兵器 · 拳爪类 ===== */
    fist_knuckle:  { cat: 'cold', group: '拳爪类', label: '拳套',   icon: '🥊', stats: { power: 68, speed: 72, range: 3,  precision: 58, mobility: 75, toughness: 48, era: 5 } },
    fist_brass:    { cat: 'cold', group: '拳爪类', label: '指虎',   icon: '🥊', stats: { power: 62, speed: 70, range: 2,  precision: 50, mobility: 78, toughness: 42, era: 5 } },
    fist_claw:     { cat: 'cold', group: '拳爪类', label: '铁爪',   icon: '🐾', stats: { power: 55, speed: 75, range: 5,  precision: 62, mobility: 80, toughness: 35, era: 5 } },

    /* ===== 热武器 · 手枪 ===== */
    pistol_semi:   { cat: 'gun', group: '手枪', label: '半自动手枪', icon: '🔫', stats: { power: 48, speed: 58, range: 28, precision: 72, mobility: 60, toughness: 35, era: 88 } },
    pistol_revolve:{ cat: 'gun', group: '手枪', label: '左轮手枪',   icon: '🔫', stats: { power: 55, speed: 50, range: 30, precision: 70, mobility: 58, toughness: 38, era: 85 } },

    /* ===== 热武器 · 冲锋枪 ===== */
    smg_smg:       { cat: 'gun', group: '冲锋枪', label: '冲锋枪',  icon: '🔫', stats: { power: 55, speed: 85, range: 42, precision: 55, mobility: 62, toughness: 35, era: 90 } },
    smg_pdw:       { cat: 'gun', group: '冲锋枪', label: '个人防卫武器', icon: '🔫', stats: { power: 50, speed: 88, range: 45, precision: 60, mobility: 70, toughness: 32, era: 94 } },

    /* ===== 热武器 · 步枪 ===== */
    ar_assault:    { cat: 'gun', group: '突击步枪', label: '突击步枪', icon: '🔫', stats: { power: 70, speed: 75, range: 75, precision: 65, mobility: 52, toughness: 45, era: 92 } },
    rifle_battle:  { cat: 'gun', group: '步枪', label: '战斗步枪',   icon: '🔫', stats: { power: 78, speed: 62, range: 78, precision: 65, mobility: 45, toughness: 52, era: 90 } },
    rifle_bolt:    { cat: 'gun', group: '步枪', label: '栓动步枪',   icon: '🔫', stats: { power: 75, speed: 40, range: 80, precision: 80, mobility: 48, toughness: 42, era: 88 } },
    rifle_semi:    { cat: 'gun', group: '步枪', label: '半自动步枪', icon: '🔫', stats: { power: 70, speed: 52, range: 78, precision: 72, mobility: 48, toughness: 45, era: 86 } },
    rifle_carbine: { cat: 'gun', group: '步枪', label: '卡宾枪',     icon: '🔫', stats: { power: 62, speed: 72, range: 62, precision: 62, mobility: 58, toughness: 40, era: 90 } },

    /* ===== 热武器 · 霰弹枪 ===== */
    shot_pump:     { cat: 'gun', group: '霰弹枪', label: '泵动霰弹枪', icon: '🔫', stats: { power: 85, speed: 48, range: 35, precision: 45, mobility: 48, toughness: 55, era: 86 } },
    shot_semi:     { cat: 'gun', group: '霰弹枪', label: '半自动霰弹枪', icon: '🔫', stats: { power: 85, speed: 58, range: 38, precision: 48, mobility: 48, toughness: 55, era: 90 } },
    shot_double:   { cat: 'gun', group: '霰弹枪', label: '双管霰弹枪', icon: '🔫', stats: { power: 82, speed: 44, range: 32, precision: 42, mobility: 52, toughness: 50, era: 84 } },

    /* ===== 热武器 · 狙击枪 ===== */
    sniper_bolt:   { cat: 'gun', group: '狙击枪', label: '栓动狙击枪', icon: '🎯', stats: { power: 85, speed: 35, range: 95, precision: 92, mobility: 38, toughness: 40, era: 88 } },
    sniper_semi:   { cat: 'gun', group: '狙击枪', label: '半自动狙击枪', icon: '🎯', stats: { power: 80, speed: 48, range: 90, precision: 85, mobility: 42, toughness: 42, era: 90 } },
    sniper_anti:   { cat: 'gun', group: '狙击枪', label: '反器材狙击枪', icon: '🎯', stats: { power: 98, speed: 28, range: 96, precision: 88, mobility: 28, toughness: 55, era: 92 } },

    /* ===== 热武器 · 机枪 ===== */
    mg_light:      { cat: 'gun', group: '机枪', label: '轻机枪',     icon: '🔫', stats: { power: 78, speed: 68, range: 72, precision: 58, mobility: 38, toughness: 55, era: 90 } },
    mg_heavy:      { cat: 'gun', group: '机枪', label: '通用 · 重机枪', icon: '🔫', stats: { power: 88, speed: 75, range: 80, precision: 55, mobility: 25, toughness: 65, era: 90 } },
    mg_gatling:    { cat: 'gun', group: '机枪', label: '加特林机枪', icon: '🔫', stats: { power: 95, speed: 95, range: 78, precision: 52, mobility: 20, toughness: 70, era: 92 } },

    /* ===== 热武器 · 特种火器 ===== */
    special_gl:    { cat: 'gun', group: '特种火器', label: '榴弹发射器', icon: '🧨', stats: { power: 92, speed: 40, range: 55, precision: 50, mobility: 42, toughness: 55, era: 92 } },
    special_rpg:   { cat: 'gun', group: '特种火器', label: '火箭筒', icon: '🚀', stats: { power: 96, speed: 35, range: 70, precision: 52, mobility: 35, toughness: 50, era: 94 } },
    special_flame: { cat: 'gun', group: '特种火器', label: '火焰喷射器', icon: '🔥', stats: { power: 90, speed: 45, range: 40, precision: 40, mobility: 38, toughness: 58, era: 90 } },
    special_recoil:{ cat: 'gun', group: '特种火器', label: '无后坐力炮', icon: '💥', stats: { power: 98, speed: 32, range: 78, precision: 55, mobility: 30, toughness: 55, era: 95 } },

    /* ===== 爆炸物 / 投掷物 ===== */
    exp_grenade:   { cat: 'exp', group: '投掷爆炸物', label: '手榴弹', icon: '💣', stats: { power: 85, speed: 50, range: 28, precision: 40, mobility: 55, toughness: 30, era: 85 } },
    exp_molotov:   { cat: 'exp', group: '投掷爆炸物', label: '燃烧瓶', icon: '🔥', stats: { power: 70, speed: 45, range: 24, precision: 35, mobility: 58, toughness: 25, era: 80 } },
    exp_smoke:     { cat: 'exp', group: '投掷爆炸物', label: '烟雾弹', icon: '🌫️', stats: { power: 15, speed: 40, range: 20, precision: 30, mobility: 55, toughness: 20, era: 85 } },
    exp_flash:     { cat: 'exp', group: '投掷爆炸物', label: '震爆弹', icon: '⚡', stats: { power: 45, speed: 55, range: 22, precision: 45, mobility: 55, toughness: 25, era: 86 } },
    exp_mine:      { cat: 'exp', group: '爆破装置', label: '地雷',    icon: '🕳️', stats: { power: 90, speed: 15, range: 8,  precision: 60, mobility: 20, toughness: 70, era: 88 } },
    exp_charge:    { cat: 'exp', group: '爆破装置', label: '炸药包',  icon: '🧨', stats: { power: 95, speed: 20, range: 6,  precision: 45, mobility: 30, toughness: 60, era: 80 } },
    exp_c4:        { cat: 'exp', group: '爆破装置', label: '塑胶炸药', icon: '🧱', stats: { power: 94, speed: 25, range: 6,  precision: 70, mobility: 35, toughness: 55, era: 92 } },
    exp_timed:     { cat: 'exp', group: '爆破装置', label: '定时炸弹', icon: '⏱️', stats: { power: 94, speed: 30, range: 6,  precision: 72, mobility: 40, toughness: 50, era: 92 } },
    exp_bang:      { cat: 'exp', group: '爆破装置', label: '爆破筒',  icon: '🧨', stats: { power: 88, speed: 35, range: 30, precision: 50, mobility: 45, toughness: 55, era: 85 } },
    exp_ied:       { cat: 'exp', group: '爆破装置', label: '简易爆炸装置', icon: '🧨', stats: { power: 82, speed: 30, range: 10, precision: 48, mobility: 35, toughness: 50, era: 82 } },

    /* ===== 传说名器 ===== */
    mythic_sword:  { cat: 'mythic', group: '神剑名器', label: '神剑', icon: '💎', stats: { power: 85, speed: 82, range: 22, precision: 86, mobility: 76, toughness: 62, era: 3 } },
    mythic_blade:  { cat: 'mythic', group: '神刀名器', label: '神刀', icon: '⚔️', stats: { power: 88, speed: 78, range: 24, precision: 80, mobility: 70, toughness: 64, era: 3 } },
    mythic_pole:   { cat: 'mythic', group: '神兵名器', label: '神戟', icon: '⚜️', stats: { power: 90, speed: 66, range: 46, precision: 76, mobility: 60, toughness: 74, era: 3 } },
    mythic_spear:  { cat: 'mythic', group: '神兵名器', label: '神枪', icon: '🎋', stats: { power: 85, speed: 72, range: 44, precision: 72, mobility: 66, toughness: 66, era: 3 } },
    mythic_bow:    { cat: 'mythic', group: '神兵名器', label: '神弓', icon: '🏹', stats: { power: 82, speed: 56, range: 92, precision: 95, mobility: 56, toughness: 46, era: 3 } },
    mythic_hammer: { cat: 'mythic', group: '神兵名器', label: '神锤', icon: '🔨', stats: { power: 96, speed: 42, range: 22, precision: 60, mobility: 44, toughness: 86, era: 2 } },
    mythic_axe:    { cat: 'mythic', group: '神兵名器', label: '神斧', icon: '🪓', stats: { power: 95, speed: 46, range: 26, precision: 60, mobility: 46, toughness: 80, era: 2 } },
    mythic_dagger: { cat: 'mythic', group: '神匕名器', label: '神匕', icon: '🗡️', stats: { power: 60, speed: 92, range: 8,  precision: 88, mobility: 92, toughness: 42, era: 3 } },
    mythic_whip:   { cat: 'mythic', group: '神兵名器', label: '神鞭', icon: '🐍', stats: { power: 62, speed: 82, range: 42, precision: 72, mobility: 82, toughness: 42, era: 2 } },
    mythic_staff:  { cat: 'mythic', group: '神兵名器', label: '神兵', icon: '🌟', stats: { power: 84, speed: 74, range: 36, precision: 74, mobility: 68, toughness: 70, era: 3 } }
  },

  /* ---------- 大类定义（图鉴筛选与配色） ---------- */
  cats: [
    { key: 'cold',   name: '冷兵器', icon: '⚔️' },
    { key: 'gun',    name: '热武器', icon: '🔫' },
    { key: 'exp',    name: '爆炸物', icon: '💣' },
    { key: 'mythic', name: '传说名器', icon: '💎' }
  ],

  /* ---------- "为什么是你"文案模板 ----------
     由 profile 与本命武器 stats 的逐维对比生成：
     共鸣维 = 你们同频；锋芒维 = 武器比你先一步；温差维 = 彼此成全；
     本色维 = 你的底色。模板下标由"答案和"确定性取模，同答案必同文案。
  */
  whyTemplates: {
    opening: [
      '翻遍整座兵器库，最衬你的就是「{name}」——',
      '这把「{name}」落在你手里，不是巧合——',
      '你的战斗气质，与「{name}」严丝合缝——'
    ],
    resonance: [
      '你们在「{dim}」上几乎是一条心：你向往的，正是它最拿手的。',
      '你和它在「{dim}」上同频共振——这是你们之间最深的默契。',
      '它最认你身上的「{dim}」：这一维上，你们无需言语。'
    ],
    edge: [
      '在「{dim}」上，它比你更狠——这恰好是它替你补上的那一截锋芒。',
      '它先你一步抵达「{dim}」的极致，这是它守护你的方式。',
      '你缺的「{dim}」，它天生就有——你们刚好补齐彼此。'
    ],
    gap: [
      '你和它在「{dim}」上隔着一段温差，但差异不是隔阂，是彼此成全的空间。',
      '它比你更「{dim}」，而你比它更耐得住——一冷一热，恰好压住阵脚。'
    ],
    native: [
      '「{dim}」是你的本色，武器只是你延伸出去的手——它知道自己没选错主人。',
      '你在「{dim}」上的底色，它未必全接得住，但它看得见，也欣赏。'
    ],
    closing: [
      '从今天起，它就是你的本命。它在你手里，才终于肯开口：「{phrase}」',
      '记住它这句话：「{phrase}」',
      '它等这个主人等了很久，开口第一句是：「{phrase}」'
    ],
    flat: [
      '此刻的你像一张白纸，任何武器都可能认领你——这把它抢到了先手。',
      '你的气质还没定形，全兵器库都争着收你。它抢在第一个站了出来。'
    ]
  },

  /* ---------- 结果如何阅读 ---------- */
  howToRead: [
    '本测验用 7 个维度勾勒你的"战斗气质"：刚猛、迅捷、精准、射程、灵动、坚韧、时代。每个维度 0–100，时代越低越古典、越高越现代。',
    '你的答案构成一个"理想武器画像"，与全武器库 330 余件逐把比对，距离最近者为本命武器，其次两位为候补。',
    '匹配度 = 100 − 归一化距离。兵器属性是对该武器历史与大众认知的综合印象，并非客观参数。',
    '结果页雷达同时画出"你的气质"与"本命武器的属性"，重合越多，说明它越是你气质的外化。',
    '所有结果均为趣味拟人，非军事建议、非心理诊断。武器无高低，只有适不适合你的脾气。'
  ],

  /* ---------- 依据与参考文献（GB/T 7714-2015 著录格式） ---------- */
  basisIntro: '本测验的武器谱系与属性参考了中外兵器史与武器图鉴文献：冷兵器部分以《中国兵器史稿》《武备志》等典籍为纲，热武器部分参照现代武器图鉴的通用认知分类。七维画像为拟人化趣味设定，无学术标准化依据。参考文献按 GB/T 7714-2015 著录。',

  references: [
    {
      type: 'M', authors: '周纬', year: '1957',
      title: '中国兵器史稿',
      publisher: '北京: 生活·读书·新知三联书店',
      note: '中国冷兵器史经典：剑、刀、枪矛、戈戟的源流与形制——本测验冷兵器谱系的纲领。'
    },
    {
      type: 'M', authors: '杨泓', year: '2005',
      title: '古代兵器通论',
      publisher: '北京: 紫禁城出版社',
      note: '系统论述中国古代兵器的演变——弓弩、锏鞭、斧钺等分类依据。'
    },
    {
      type: 'M', authors: '茅元仪', year: '1621',
      title: '武备志',
      publisher: '明天启元年刊本',
      note: '明代兵书巨著：集历代兵器形制与战阵之大成——"方天画戟""诸葛连弩"等名目考据来源。'
    },
    {
      type: 'M', authors: '佚名（先秦）', year: '约战国',
      title: '考工记',
      publisher: '收入《周礼》',
      note: '先秦工艺文献："戈戟之制"等对冶铸与兵器形制的最早记载。'
    },
    {
      type: 'M', authors: 'STEPHENSON C', year: '2011',
      title: 'Small Arms: An Illustrated History',
      publisher: 'New York: Metro Books',
      note: '小型武器图文史：手枪、冲锋枪、突击步枪的型号与演进——热武器条目考据参考。'
    },
    {
      type: 'M', authors: 'HOGG I', year: '2005',
      title: "Jane's Guns Recognition Guide",
      publisher: 'London: HarperCollins',
      note: '枪械识别图鉴：数百种枪械的口径、结构与国际通用译名对照。'
    },
    {
      type: 'M', authors: 'McNAB C', year: '2007',
      title: 'The Encyclopedia of Weapons of World War II',
      publisher: 'London: Amber Books',
      note: '二战武器百科：冲锋枪、步枪、机枪、爆炸物在实战中的定位与特征。'
    }
  ],

  /* ---------- 致谢 ---------- */
  acknowledgement: [
    '最后，照例把这页留作"致谢"。',
    '感谢那些真正握过这些武器的人——铸剑师、铁匠、弓匠、枪械工程师，还有无数在沙场上让一件兵器成为传说的无名者。它们的名字在史书里往往只有一行，但每一种兵器的性格，都来自真实的历史与真实的战场。',
    '感谢《中国兵器史稿》《武备志》《考工记》这些典籍，让冷兵器的谱系得以流传；也感谢现代武器图鉴，让几百种枪械能在这里各归其位。',
    '更要感谢每一位点开图鉴、做完测验的你。兵器本无命，是握它的人给了它命——你的本命武器，只是你某种气质的影子。',
    '所愿不过世安——愿你与你的本命武器，人器两安。',
    '—— 愿安'
  ],

  disclaimer: '免责声明：本测验为娱乐性质的自我探索测评。"本命武器""战斗气质"均为趣味化拟人表述，武器属性为历史与大众认知的综合印象，并非客观参数，也不构成任何军事或安全建议。若你正考虑接触真实武器，请务必在合法场所、由专业人士指导下进行。',

  /* ---------- 武器库（由各数据文件 push 填充） ---------- */
  weapons: []
};
