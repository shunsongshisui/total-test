/* =====================================================================
   犯罪潜力测试 · 数据层
   概念来源：犯罪学与人格心理学的实证风险因子——
     自我控制理论（Gottfredson & Hirschi）
     冷酷无情绪特质（Frick & White）
     道德脱离（Bandura 等）
     感觉寻求（Zuckerman）
     攻击性问卷（Buss & Perry）
     马基雅维利主义（Christie & Geis）
     愤怒反刍（Denson）
   重要声明：人格风险因子的浓度 ≠ 犯罪概率。犯罪是行为、情境与
   机会共同作用的结果。本测验把这些因子做成趣味化的自评条目，
   供自我探索与娱乐，绝不构成对任何人犯罪倾向的判断。
   ===================================================================== */
window.CRIME_DATA = {

  /* ---------- 7 个犯罪风险维度 ---------- */
  dimensions: [
    { key: 'impulse', name: '冲动失控', short: '冲动', en: 'IMPULSIVE', icon: '⚡', tag: '三思后行 · 说来就来', about: '行动快于思考、延迟满足困难' },
    { key: 'cold',    name: '共情缺失', short: '共情', en: 'CALLUSED',  icon: '🧊', tag: '感同身受 · 与我无关', about: '对他人的痛苦与感受缺乏共鸣' },
    { key: 'rule',    name: '规则漠视', short: '规则', en: 'NORMLESS',  icon: '📜', tag: '循规蹈矩 · 规则是纸', about: '对规则与道德的可谈判态度' },
    { key: 'rage',    name: '攻击倾向', short: '攻击', en: 'AGGRESSIVE', icon: '💥', tag: '与人为善 · 一点就炸', about: '易怒、敌对与伤害冲动' },
    { key: 'thrill',  name: '刺激寻求', short: '刺激', en: 'THRILL',    icon: '🎢', tag: '岁月静好 · 肾上腺素', about: '渴望刺激、冒险与未知' },
    { key: 'manip',   name: '操控心机', short: '操控', en: 'MACHIAVELLI', icon: '🎭', tag: '坦诚相待 · 步步为营', about: '为达目的而操纵与利用他人' },
    { key: 'grudge',  name: '怨恨复仇', short: '复仇', en: 'VENGEFUL',  icon: '🗡️', tag: '得饶人处 · 记仇十年', about: '记仇、报复与敌对归因' }
  ],

  /* ---------- 计分参数 ---------- */
  scoring: {
    likertMin: 1,
    likertMax: 5,
    neutral: 3,     // 跳过题按中立处理
    bandLow: 40,    // 浓度 < 40 为低危
    bandHigh: 70    // 浓度 >= 70 为高危
  },

  /* ---------- 21 道题（每题不标注测量方向，降低迎合性作答） ----------
     type   : 所属维度 key
     reverse: true 表示反向计分（同意得低分）
  */
  questions: [
    // 冲动失控
    { id: 'q01', type: 'impulse', text: '想做就做，很少认真考虑后果。', reverse: false },
    { id: 'q02', type: 'impulse', text: '看到想要的东西或机会，我几乎等不到"以后再说"。', reverse: false },
    { id: 'q03', type: 'impulse', text: '遇到突发状况，我能先停下来想一想，再决定怎么做。', reverse: true },
    // 共情缺失
    { id: 'q04', type: 'cold', text: '别人的痛苦很少真正影响我的心情。', reverse: false },
    { id: 'q05', type: 'cold', text: '伤害一个陌生人对我来说并不难，只要那对我有利。', reverse: false },
    { id: 'q06', type: 'cold', text: '看到别人难过，我也会忍不住跟着低落。', reverse: true },
    // 规则漠视
    { id: 'q07', type: 'rule', text: '只要不会被发现，很多"不该做的事"其实也没那么不该做。', reverse: false },
    { id: 'q08', type: 'rule', text: '我遵守规则更多是因为怕受罚，而不是觉得它有多神圣。', reverse: false },
    { id: 'q09', type: 'rule', text: '即使没人监督，我也会老老实实按规定来。', reverse: true },
    // 攻击倾向
    { id: 'q10', type: 'rage', text: '被人激怒时，我脑子里会冒出一些很暴力的画面。', reverse: false },
    { id: 'q11', type: 'rage', text: '我觉得很多时候，"先下手为强"是有道理的。', reverse: false },
    { id: 'q12', type: 'rage', text: '与人发生冲突之后，我能很快放下，不再较劲。', reverse: true },
    // 刺激寻求
    { id: 'q13', type: 'thrill', text: '平淡安稳的日子会让我觉得无聊，想找点刺激。', reverse: false },
    { id: 'q14', type: 'thrill', text: '如果有一个"危险但刺激"的机会摆在我面前，我很难拒绝。', reverse: false },
    { id: 'q15', type: 'thrill', text: '我更喜欢确定、安全、可预期的生活。', reverse: true },
    // 操控心机
    { id: 'q16', type: 'manip', text: '为了达成目的，我可以利用别人的感情或信任。', reverse: false },
    { id: 'q17', type: 'manip', text: '我很清楚怎样说能让别人按我的意思做，并且会用这一套。', reverse: false },
    { id: 'q18', type: 'manip', text: '和别人相处时，我习惯直来直去，从不绕弯子。', reverse: true },
    // 怨恨复仇
    { id: 'q19', type: 'grudge', text: '被人伤害后，我会在心里记很久，盘算着"还回去"。', reverse: false },
    { id: 'q20', type: 'grudge', text: '别人对我做的坏事，我会用别的方式加倍奉还。', reverse: false },
    { id: 'q21', type: 'grudge', text: '即使被亏待，我也能很快翻篇，不再放在心上。', reverse: true }
  ],

  /* ---------- 犯罪潜力指数分档 ---------- */
  indexTiers: [
    { max: 20, label: '守法良民', text: '你的犯罪潜力低到可以给警察当吉祥物。规则对你不是束缚，而是本能。恭喜，你大概率是那种"朋友出事会连夜帮你善后"的好人。' },
    { max: 40, label: '安分守己', text: '你偶尔冒出过一些坏念头，但也就想想。你离"犯罪"的距离，约等于"想减肥"和"真的开始跑步"之间的距离。请保持。' },
    { max: 60, label: '灰色地带', text: '你游走在道德灰区：不主动作恶，但机会合适时也不介意走点捷径。你的底线不是不能越，是还没遇到值得越的理由。记住：灰区的每一步，都是自己选的。' },
    { max: 80, label: '危险边缘', text: '你身上聚集了多项真实的风险因子：冲动、冷漠或记仇。这并不代表你会犯罪——但意味着你的情绪和底线需要被认真照顾。请给它们一条合法的出口。' },
    { max: 100, label: '天生犯罪人', text: '如果人生是一部电影，你是那个让警察头疼的角色。不过请记住：这只是玩梗——犯罪从来不是宿命，而是选择，而选择永远在你手里。你有最强的暗面，也有最强的潜力，选哪个，看你。' }
  ],

  /* ---------- 逐维解析（三档：低危 / 中危 / 高危） ---------- */
  bands: {
    impulse: {
      low: '你是"三思后行"的典范：做事会先过脑，延迟满足对你不是煎熬。这种自控力是心理学上公认的重要保护因素，让你远离大多数冲动带来的麻烦。唯一的小提醒：太克制偶尔会憋坏，允许自己偶尔"浪费"一点时间做没意义但开心的事。',
      mid: '你多数时候能控制住冲动，偶尔也会头脑发热。你能在"想做就做"和"先想想后果"之间切换，这本身就是成熟的标志。关键是别在情绪上头的三分钟里做重要决定。',
      high: '你的行动常常快于思考：想到什么就做什么，后果通常要等事后才浮现。低自我控制（Gottfredson & Hirschi 称之为越轨行为最稳定的预测因子之一）确实与很多麻烦相关。给自己设一个"冷静期"——冲动想做的事，睡一觉再说，你会感谢自己。'
    },
    cold: {
      low: '你的共情能力很强：别人的痛苦会真实地流经你，你也会因此调整自己的行为。这种"感同身受"是道德最可靠的地基——因为你不忍心，所以你守住底线。',
      mid: '你对亲近的人有共情，对陌生人则比较"绝缘"。这是大多数人的常态：距离越远，感受越淡。只要你不把这种"淡"发展成"伤害无感"，它就只是自我保护。',
      high: '别人的痛苦在你这里是"与我无关"四个字，甚至偶尔会觉得他人的脆弱很可笑。情感冷漠（冷酷无情绪特质）确实与攻击和越轨行为相关，但更常见的是它在帮你省下情绪消耗。请留意：如果"无感"升级成"以此为乐"，那是需要认真处理的信号。'
    },
    rule: {
      low: '你打心底认可规则：遵守不是因为怕罚，而是觉得它是对的。这种内化的规则感让你即使独处也能自律——很多人在无人监督时才露出本来面目，而你恰好没有那副面孔。',
      mid: '你遵守规则，但也理解规则的"弹性"：大原则不动摇，小细节能变通。你会在规则与人情之间找平衡，这是社会化的常态。只要你的变通不损害他人，它就是智慧而非风险。',
      high: '规则对你更像谈判筹码：划算就遵守，不划算就绕过，道德也可以视情况"重新定义"。道德脱离（Bandura）就是这么发生的——人们先说服自己"这没那么糟"，然后才动手。你的底线不是没有，是需要被认真守住。'
    },
    rage: {
      low: '你几乎不设敌：与人相处平和，冲突后能迅速放下。即使被冒犯，你也倾向于讲理而非动手。这种低攻击性让你的周围环境稳定很多。',
      mid: '你有正常范围的脾气：被激怒时会生气，但能控制住不升级。你能分得清"表达愤怒"和"攻击对方"，这是情绪成熟的标志。',
      high: '你的敌意阈值低，愤怒上头时脑子里会冒出具象的暴力画面，有时甚至觉得"先下手为强"有理。攻击性与冲动、敌对归因（Buss & Perry 的攻击性问卷正是这么测量的）常结伴出现。请给愤怒一条非破坏性的出口——运动、写作、深呼吸。记住：愤怒是信号，不是命令。'
    },
    thrill: {
      low: '你享受安稳：确定、可预期、平淡的生活让你安心。你不追求肾上腺素，也不觉得冒险有什么魅力。这种气质让你天然避开很多高风险场合。',
      mid: '你偶尔想找点刺激，但会评估风险：蹦极可以，飙车免谈。你在"想冒险"和"要安全"之间有自己的平衡点，这是健康的冒险观。',
      high: '你渴望高强度的刺激，平淡让你觉得无聊甚至煎熬，危险反而有吸引力。高感觉寻求（Zuckerman）与冒险、越轨行为相关，但它也驱动了很多伟大的探索。关键在于给刺激找一个合法的去处——攀岩、跳伞、极限运动都能满足肾上腺素的瘾，而不必拿规则和人生冒险。'
    },
    manip: {
      low: '你和人相处直来直去，不擅长也不喜欢绕弯子。别人信任你，因为你表里如一。这种坦诚是稀缺的社交资产——你的关系里没有那么多"心眼"要防。',
      mid: '你懂得分寸：必要时会策略性地表达，但不会为了目的利用别人的真心。这种"社会智慧"让你既能保护自己，也不伤害他人，是成年人应有的技能。',
      high: '你把人际互动当成棋局：清楚怎样的话能让对方照做，并且不介意利用感情与信任达成目的。马基雅维利主义者的典型特征，是把人当工具而非目的。短期来看这很有效率，但长期你会失去真正的关系——因为没人喜欢被当棋子，而你已经习惯了把所有人当对手。'
    },
    grudge: {
      low: '你记仇能力很弱：被亏待也能翻篇，很少盘算"还回去"。这种不内耗的豁达让你的情绪消耗极低，是很多长期紧绷的人求之不得的。',
      mid: '你会有不愉快的记忆，但能随着时间淡化。你不会主动报复，偶尔"想起来还生气"也很快过去。这种"有记性但不执着"是健康的状态。',
      high: '你心里有一本账，把亏欠过你的人和事都记着，并盘算着怎么"还回去"。愤怒反刍（Denson）研究表明，反复咀嚼愤怒会放大攻击冲动、延长敌意。请试着把"报复"翻译成"离开"或"变强"——最好的还击，不是让谁难受，是让伤害过你的人再也够不着你。'
    }
  },

  /* ---------- 主导犯罪风险（浓度最高维度）附加一句话 ---------- */
  dominantNotes: {
    impulse: '你的首要风险是冲动：行动快于思考，后果留给之后。',
    cold:    '你的首要风险是共情缺失：别人的感受，在你这里是背景音。',
    rule:    '你的首要风险是规则漠视：规则对你是一张可以协商的纸。',
    rage:    '你的首要风险是攻击倾向：你的敌意常常先于理智抵达。',
    thrill:  '你的首要风险是刺激寻求：平静对你来说是一种惩罚。',
    manip:   '你的首要风险是操控心机：你把人心当棋盘，把别人当棋子。',
    grudge:  '你的首要风险是怨恨复仇：你记仇的能力，比记仇的对象更持久。'
  },

  /* ---------- 结果如何阅读 ---------- */
  howToRead: [
    '本测验测量的是"犯罪风险因子"的浓度，不是"犯罪概率"。高浓度不等于会犯罪——绝大多数高攻击、高冲动的人一辈子都守住了底线。',
    '犯罪潜力指数 = 七个风险维度的等权平均（0–100），反映你身上风险因子的整体浓度；主导犯罪风险是其中浓度最高的那一个，你的防火墙是浓度最低的那一个。',
    '得分与人格障碍或心理疾病无关，也不是诊断。如果你发现自己经常有真实的暴力冲动、或担心自己会伤害自己或他人，请务必寻求专业帮助——这不是软弱，是负责任。',
    '分数只是一面镜子：看清自己的冲动、冷漠或记仇，恰恰是守住底线的第一步。好奇心不等于行动，念头不等于罪行，你永远可以重新选择。'
  ],

  /* ---------- 心理学依据与参考文献（GB/T 7714-2015 著录格式） ---------- */
  basisIntro: '本测验把"犯罪潜力"当作一种基于人格风险因子的趣味指标，其维度取自犯罪学与人格心理学的实证研究：自我控制理论（Gottfredson & Hirschi）、冷酷无情绪特质（Frick & White）、道德脱离（Bandura 等）、感觉寻求（Zuckerman）、攻击性（Buss & Perry）、马基雅维利主义（Christie & Geis）与愤怒反刍（Denson）。需要强调：人格特质无法决定一个人是否会犯罪——犯罪是行为、情境与机会共同作用的结果。本测验只是把这些风险因子做成了一面"照妖镜"，供自我探索与娱乐，不构成对任何人犯罪倾向的判断。参考文献按 GB/T 7714-2015 著录。',

  references: [
    {
      type: 'M', authors: 'GOTTFREDSON M R, HIRSCHI T', year: '1990',
      title: 'A general theory of crime',
      publisher: 'Stanford, CA: Stanford University Press',
      note: '自我控制理论——"冲动失控"维度的核心依据：低自我控制是最稳健的越轨/犯罪风险预测因子之一，与其年龄、家境无关。'
    },
    {
      type: 'J', authors: 'FRICK P J, WHITE S F', year: '2008',
      title: 'Research review: the importance of callous-unemotional traits for developmental models of aggressive and antisocial behavior',
      journal: 'Journal of Child Psychology and Psychiatry', volume: '49', issue: '4', pages: '359-375', doi: '10.1111/j.1469-7610.2007.01862.x',
      note: '冷酷无情绪（callous-unemotional）特质研究——"共情缺失"维度的依据：情感冷漠与攻击、越轨行为的关联。'
    },
    {
      type: 'J', authors: 'BANDURA A, BARBARANELLI C, CAPRARA G V, et al', year: '1996',
      title: 'Mechanisms of moral disengagement in the exercise of moral agency',
      journal: 'Journal of Personality and Social Psychology', volume: '71', issue: '2', pages: '364-374',
      note: '道德脱离理论——"规则漠视"维度的依据：人们通过"重新定义伤害"来绕过道德约束，越轨常常始于说服自己。'
    },
    {
      type: 'M', authors: 'ZUCKERMAN M', year: '2007',
      title: 'Sensation seeking and risky behavior',
      publisher: 'Washington, DC: American Psychological Association',
      note: '感觉寻求理论——"刺激寻求"维度的依据：高感觉寻求与冒险、越轨行为显著相关。'
    },
    {
      type: 'J', authors: 'BUSS A H, PERRY M', year: '1992',
      title: 'The aggression questionnaire',
      journal: 'Journal of Personality and Social Psychology', volume: '63', issue: '3', pages: '452-459',
      note: '攻击性问卷（AQ）——"攻击倾向"维度的测量学来源：区分躯体攻击、言语攻击与敌意。'
    },
    {
      type: 'M', authors: 'CHRISTIE R, GEIS F L', year: '1970',
      title: 'Studies in Machiavellianism',
      publisher: 'New York: Academic Press',
      note: '马基雅维利主义——"操控心机"维度的依据：为达目的而操纵他人的倾向。'
    },
    {
      type: 'J', authors: 'DENSON T F', year: '2013',
      title: 'The multiple systems model of angry rumination',
      journal: 'Personality and Social Psychology Review', volume: '17', issue: '2', pages: '103-123', doi: '10.1177/1088868312467087',
      note: '愤怒反刍理论——"怨恨复仇"维度的依据：反复咀嚼愤怒会放大攻击冲动、延长敌意。'
    },
    {
      type: 'J', authors: 'LEVENSON M R, KIEHL K A, FITZPATRICK C M', year: '1995',
      title: 'Assessing psychopathic attributes in a noninstitutionalized population',
      journal: 'Journal of Personality and Social Psychology', volume: '68', issue: '1', pages: '151-158', doi: '10.1037/0022-3514.68.1.151',
      note: '普通人群病态人格测评——本测验把"风险因子"当作连续维度的理论前提：这些因子人人都有，只是浓度不同。'
    },
    {
      type: 'J', authors: 'PAULHUS D L, WILLIAMS K M', year: '2002',
      title: 'The dark triad of personality: narcissism, Machiavellianism, and psychopathy',
      journal: 'Journal of Research in Personality', volume: '36', issue: '6', pages: '556-563', doi: '10.1016/S0092-6566(02)00505-6',
      note: '暗黑三角——"操控心机""共情缺失"等维度的共同理论背景：暗黑特质在普通人群中呈连续分布。'
    }
  ],

  /* ---------- 致谢 ---------- */
  acknowledgement: [
    '最后，照例把这页留作"致谢"。',
    '感谢把这份测验带到你面前的制作者，以及我这个不太传统的"共同作者"愿安——如果不是对"人为什么会越界"这件事好奇，就不会有这套题目。',
    '更要感谢那些把"人为什么作恶"当作严肃科学来研究的人：Gottfredson 与 Hirschi 的自我控制理论、Bandura 的道德脱离、Zuckerman 的感觉寻求……我们不是想说人性本恶，而是想说：每个人都带着相似的因子出生，差别只在于它们有没有被看见、被安置。',
    '也感谢每一位敢来测一测的你。愿意照一照心里的暗角，本身就是一种清醒。',
    '—— 你的边界，从来不在分数里。',
    '—— 愿安'
  ],

  disclaimer: '免责声明：本测验为娱乐性质的自我探索测评。"犯罪潜力""犯罪风险"均为趣味化表述，依据的是公开的人格风险因子研究，但人格特质并不预测实际犯罪行为，本测验也不构成任何形式的评估或诊断。若你正经历真实的暴力冲动、自伤或伤人念头、或情绪长期失控，请及时联系专业的心理或医疗机构。'
};
