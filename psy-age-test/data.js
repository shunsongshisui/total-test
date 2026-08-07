/* =====================================================================
   心理年龄测验 · 数据层
   模型依据：发展心理学多维年龄框架（Baltes / Birren）、
   主观年龄研究（Kotter-Grühn, Kornadt & Stephan）、
   时间观理论（Zimbardo & Boyd）、大五人格、流体/晶体智力等。
   参考文献采用 GB/T 7714-2015 著录格式。
   ===================================================================== */
window.PSYCH_DATA = {

  /* ---------- 7 个维度 ----------
     role: 'youth'   = 该特质倾向使心理年龄更年轻（高特质 -> 更小的心理年龄）
           'mature'  = 该特质倾向使心理年龄更成熟（高特质 -> 更大的心理年龄）
     minAge / maxAge: 该维度心理年龄的取值范围（岁）
     weight: 合成总心理年龄时的权重（合计 1.00）
  */
  dimensions: [
    { key: 'cog', name: '认知活力', short: '认知', role: 'youth',  minAge: 16, maxAge: 56, weight: 0.16, cluster: 'youth',    about: '好奇心、认知弹性与学习取向' },
    { key: 'emo', name: '情绪成熟', short: '情绪', role: 'mature', minAge: 16, maxAge: 42, weight: 0.15, cluster: 'maturity', about: '情绪调节能力与情绪洞察' },
    { key: 'prd', name: '审慎自律', short: '审慎', role: 'mature', minAge: 16, maxAge: 46, weight: 0.14, cluster: 'maturity', about: '冲动控制与延迟满足' },
    { key: 'fut', name: '未来导向', short: '时间观', role: 'mature', minAge: 16, maxAge: 44, weight: 0.12, cluster: 'maturity', about: '时间观：当下享乐 vs 长远规划' },
    { key: 'soc', name: '社会开放', short: '社会', role: 'youth',  minAge: 16, maxAge: 54, weight: 0.12, cluster: 'youth',    about: '对新关系、新文化的开放度' },
    { key: 'vit', name: '活力体能', short: '活力', role: 'youth',  minAge: 16, maxAge: 56, weight: 0.15, cluster: 'youth',    about: '精力水平与身体活动意愿' },
    { key: 'res', name: '责任担当', short: '责任', role: 'mature', minAge: 16, maxAge: 60, weight: 0.16, cluster: 'none',     about: '责任心、承诺感与稳定性（不计入年龄）' }
  ],

  /* ---------- 双轴模型 ----------
     心理年龄不是一条线，而是两条独立的轴：
       成熟度（认清世事）= 情绪成熟、审慎自律、未来导向
       少年感（永葆童心）= 认知活力、社会开放、活力体能
     两条轴可以同时很高——正如"看清世界"与"童心未泯"可以共存。
  */
  duoAxes: {
    maturity: { name: '成熟度', tag: '认清世事', dims: ['emo', 'prd', 'fut'] },
    youth:    { name: '少年感', tag: '永葆童心', dims: ['cog', 'soc', 'vit'] }
  },

  quadrants: [
    { x: 1, y: 1, label: '赤子之心', note: '认清世事 × 永葆童心' },
    { x: 0, y: 1, label: '世事洞明', note: '通透有余，童心欠费' },
    { x: 1, y: 0, label: '天真烂漫', note: '少年气十足' },
    { x: 0, y: 0, label: '迷航待航', note: '两轴待回升' }
  ],

  /* ---------- 责任担当（不计入年龄） ---------- */
  responsibility: {
    title: '担当力',
    note: '责任感是"担当"，不是"年龄"——它反映你靠不靠谱、扛不扛事，但不参与心理年龄计算。',
    levels: [
      { max: 2.49, label: '尚在成长', bandKey: 'young' },
      { max: 3.49, label: '担当适中', bandKey: 'balanced' },
      { max: 5.01, label: '担当稳健', bandKey: 'old' }
    ]
  },

  /* ---------- 28 道计分题 ----------
     dim    : 所属维度
     reverse: true 表示反向计分（同意得低分）
     light  : 轻量版（14 题）会取每维前两题，light 标记即入选
  */
  questions: [
    // 认知活力
    { id: 'q01', dim: 'cog', text: '面对一个全新的领域或技能，我的第一反应是兴奋地想试试，而不是担心自己学不会。', reverse: false, light: true },
    { id: 'q02', dim: 'cog', text: '我经常被一个有趣的问题或想法吸引，一钻进去就忘了时间。', reverse: false, light: true },
    { id: 'q03', dim: 'cog', text: '比起尝试新方法，我更习惯用自己熟悉的套路把事情做完。', reverse: true,  light: true },
    { id: 'q04', dim: 'cog', text: '我时常追问"为什么"，对身边事物的原理保持好奇。', reverse: false, light: false },
    // 情绪成熟
    { id: 'q05', dim: 'emo', text: '遇到挫折时，我通常能较快平复情绪，并冷静思考下一步。', reverse: false, light: true },
    { id: 'q06', dim: 'emo', text: '别人的一句评价，很难让我长时间情绪低落或沾沾自喜。', reverse: false, light: true },
    { id: 'q07', dim: 'emo', text: '气头上说出去的话，冷静下来后我常常会后悔。', reverse: false, light: true },
    { id: 'q08', dim: 'emo', text: '我会先弄清楚自己为什么难过，再决定要不要表达出来。', reverse: false, light: false },
    // 审慎自律
    { id: 'q09', dim: 'prd', text: '购物之前，我会认真比较和规划，很少一时冲动就下单。', reverse: false, light: true },
    { id: 'q10', dim: 'prd', text: '开口之前，我通常已经想清楚这话该不该说、该怎么说。', reverse: false, light: true },
    { id: 'q11', dim: 'prd', text: '面对诱人的机会，我会先想清楚风险，再决定要不要冲。', reverse: false, light: true },
    { id: 'q12', dim: 'prd', text: '我常常凭一时兴起就做出决定，过后又后悔。', reverse: true,  light: false },
    // 未来导向
    { id: 'q13', dim: 'fut', text: '我会认真为几年后的人生做规划，而不是只盯着眼前。', reverse: false, light: true },
    { id: 'q14', dim: 'fut', text: '比起及时享乐，我更愿意把资源留给未来的自己。', reverse: false, light: true },
    { id: 'q15', dim: 'fut', text: '"活在当下、开心就好"是我的人生信条。', reverse: true,  light: true },
    { id: 'q16', dim: 'fut', text: '想到未来的自己，我会因此调整现在的选择。', reverse: false, light: false },
    // 社会开放
    { id: 'q17', dim: 'soc', text: '在陌生的聚会里，我很快就能和别人熟络起来。', reverse: false, light: true },
    { id: 'q18', dim: 'soc', text: '我愿意去了解年轻人热衷的新事物（新梗、新文化、新音乐）。', reverse: false, light: true },
    { id: 'q19', dim: 'soc', text: '比起维系老朋友，我更愿意主动结识新的朋友。', reverse: false, light: true },
    { id: 'q20', dim: 'soc', text: '我觉得"年轻人玩的东西"跟我没什么关系。', reverse: true,  light: false },
    // 活力体能
    { id: 'q21', dim: 'vit', text: '大多数日子里，我都觉得自己精力充沛、干劲十足。', reverse: false, light: true },
    { id: 'q22', dim: 'vit', text: '我喜欢需要活动身体的运动或娱乐（跑步、爬山、跳舞等）。', reverse: false, light: true },
    { id: 'q23', dim: 'vit', text: '只要休息一小会儿，我就能快速恢复、重新投入。', reverse: false, light: true },
    { id: 'q24', dim: 'vit', text: '我常常觉得疲惫，做什么都提不起劲。', reverse: true,  light: false },
    // 责任担当
    { id: 'q25', dim: 'res', text: '答应了别人的事，我会想办法做到，即使需要额外付出。', reverse: false, light: true },
    { id: 'q26', dim: 'res', text: '我会提前整理好手头的事务，很少把事情拖到最后。', reverse: false, light: true },
    { id: 'q27', dim: 'res', text: '认定目标之后，我很少轻易改变主意。', reverse: false, light: true },
    { id: 'q28', dim: 'res', text: '在团队或集体里，我常常是主动承担起来的那个人。', reverse: false, light: false },
    // 认知活力（扩充）
    { id: 'q29', dim: 'cog', text: '当听到一个颠覆我原有想法的观点时，我会好奇地听完，而不是立刻反驳。', reverse: false, light: false },
    { id: 'q30', dim: 'cog', text: '我的兴趣面很广，愿意涉猎和自己专业或工作无关的领域。', reverse: false, light: false },
    // 情绪成熟（扩充）
    { id: 'q31', dim: 'emo', text: '难过的时候，我能分辨自己是在"处理情绪"，还是单纯"陷入情绪"。', reverse: false, light: false },
    { id: 'q32', dim: 'emo', text: '面对批评，我会先想想对方说得有没有道理，而不是立刻反驳。', reverse: false, light: false },
    // 审慎自律（扩充）
    { id: 'q33', dim: 'prd', text: '做重要决定之前，我会先列一列可能的风险和代价。', reverse: false, light: false },
    { id: 'q34', dim: 'prd', text: '我很少因为一时头脑发热就答应别人。', reverse: false, light: false },
    // 未来导向（扩充）
    { id: 'q35', dim: 'fut', text: '关于十年后的自己想过怎样的生活，我心里有一个大致的方向。', reverse: false, light: false },
    { id: 'q36', dim: 'fut', text: '看到喜欢的东西，我会先想想它在未来的生活里还用不用得上。', reverse: false, light: false },
    // 社会开放（扩充）
    { id: 'q37', dim: 'soc', text: '旅行或去新地方时，我更想自己去探索，而不是只跟着熟悉的安排走。', reverse: false, light: false },
    { id: 'q38', dim: 'soc', text: '身边朋友聊起我不了解的新话题时，我会想插一句"这是什么"，而不是假装没听到。', reverse: false, light: false },
    // 活力体能（扩充）
    { id: 'q39', dim: 'vit', text: '即使一天安排得很满，我也很少觉得"撑不下去"。', reverse: false, light: false },
    { id: 'q40', dim: 'vit', text: '我觉得自己的身体状态和几年前相比，没有明显变差。', reverse: false, light: false },
    // 责任担当（扩充）
    { id: 'q41', dim: 'res', text: '如果是我负责的事出了岔子，我会主动认领并补救，而不是推给环境。', reverse: false, light: false },
    { id: 'q42', dim: 'res', text: '答应下来的事，就算临时不想做了，我也会硬着头皮完成。', reverse: false, light: false }
  ],

  /* ---------- 主观年龄（不计分，作为"自感年龄"锚点） ---------- */
  feltQuestion: {
    id: 'felt',
    text: '最后一道：抛开身份证上的年龄，你内心感觉——或者照镜子时觉得自己看起来——像多大？',
    min: 10, max: 85
  },

  /* ---------- 计分参数 ---------- */
  scoring: {
    ageFloor: 16,   // 心理年龄显示下限
    likertMin: 1,
    likertMax: 5,
    neutral: 3,     // 跳过题按中立处理
    // 相对生理年龄判断"偏年轻/平衡/偏成熟"的阈值（岁）
    diffYoung: -10,
    diffOld: 10,
    // 未填写生理年龄时使用的固定分档
    fixedYoung: 28,
    fixedOld: 48,
    // 双轴"偏高"的判定阈值（成熟度/少年感 0-100 分）
    duoThreshold: 60
  },

  /* ---------- 逐维度解析（三档） ---------- */
  bands: {
    cog: {
      young: '你的认知风格更像充满探索欲的少年：对新事物天然开放、学习速度快。研究显示，这种快速学习与灵活切换的能力（接近 Cattell 所说的"流体智力"）通常是年轻心理状态的标志。建议：在保持输入新鲜感的同时，也让经验沉淀为判断力——把学到的变成用得上的。',
      balanced: '你的好奇心与经验储备取得了不错的平衡：既愿意尝试新事物，也能借助过往经验做判断。这接近"流体智力"与"晶体智力"相互配合的理想状态——既能快速上手，也有厚度。',
      old: '你的认知风格偏保守求稳，习惯用熟悉的路径解决问题。这不一定差——经验与直觉常常更高效（"晶体智力"随年龄积累），但建议偶尔主动接触完全陌生的领域，哪怕只是学一个无关的小技能，也能保持大脑可塑性的激活。'
    },
    emo: {
      young: '你的情绪反应偏向直接和即时：来得快、去得也快，比较容易被他人的评价带动。这在人生早期很常见，本身没有对错。可以练习"先给情绪命名、再决定行动"——给情绪一个缓冲，会大幅减少冲动后的内耗。',
      balanced: '你能在情绪与理性之间灵活切换：既允许自己感受，也能在关键时刻稳住。研究显示情绪稳定性普遍随年龄增长而提高（Roberts & Mroczek, 2008），你正处在健康的轨道上。',
      old: '你的情绪非常稳定，很少被外界扰动，甚至习惯独自消化情绪。这是成熟的重要标志，但请留意是否过度压抑——真正的成熟是"能放下"，而不是"不需要"。偶尔允许情绪出来透气，也是健康的一部分。'
    },
    prd: {
      young: '你倾向于凭直觉和冲动行动，喜欢即时满足。冲动控制与大脑前额叶的成熟度密切相关，通常随年龄发展。建议在做重要决定前给自己设置一个"冷静期"——哪怕只是睡一觉再说。',
      balanced: '你懂得在"想要"和"需要"之间权衡：既能享受当下的快乐，也能控制住冲动。这是冲动性与审慎性协调良好的表现，也是许多成人仍在学习的功课。',
      old: '你高度审慎、凡事三思，延迟满足能力强，这让你非常可靠。但若审慎过头，可能错过本应尝试的体验。偶尔允许自己"冲动一次"——一次说走就走的旅行，或一个计划之外的爱好——也是心理弹性的体现。'
    },
    fut: {
      young: '你活在当下，优先即时体验，很少为长远做打算。按 Zimbardo 与 Boyd 的时间观理论（1999），这是典型的"当下享乐"取向：它让你擅长享受生活、不内耗，但适当把目光放远一点——哪怕只是存一笔小钱、规划一次学习——会显著减少未来的焦虑。',
      balanced: '你既能享受此刻，也会为未来打算——这正是 Zimbardo 和 Boyd 提出的"平衡时间观"（Balanced Time Perspective），是与幸福感相关的最理想时间观组合之一：不被过去拖累，不为未来焦虑，也不错过当下。',
      old: '你高度未来导向，凡事为长远打算，延迟满足能力强，这让你的生活有掌控感。但过度规划未来可能牺牲当下的快乐——请记住：未来由无数个当下组成，偶尔"奖励当下"不是失策，而是可持续策略。'
    },
    soc: {
      young: '你乐于认识新朋友、拥抱新文化，社交弹性很高。对新经验保持开放（大五人格中的"开放性"）通常与更年轻的主观年龄相关（Kotter-Grühn 等, 2016）。这是一份珍贵的心理资源，能让你的世界持续变大。',
      balanced: '你既保有与老朋友的深厚联结，也愿意结识新的人和事。社会关系在"深度"与"广度"之间保持均衡——这是成熟而开放的状态，既有归属感，也有新鲜感。',
      old: '你更偏好熟悉的人际圈子和熟悉的事物，对新社交场景兴致不高。这与"社会情绪选择理论"（Carstensen, 2006）中偏晚期的特征一致——人们会更聚焦少数有意义的关系。只要内心满足，就无可厚非；但偶尔伸出一只脚到新圈子，可能有意想不到的收获。'
    },
    vit: {
      young: '你的精力水平和身体活动意愿都很高，这是生理与心理活力俱佳的信号。大量纵向研究发现，"感觉自己年轻"与更好的身体功能、更长的健康寿命相关（Stephan 等；Kotter-Grühn 等, 2016）。请继续保持规律运动。',
      balanced: '你的精力处于健康水平：既能投入高强度的活动，也懂得适时休息。这种"知道何时充电"的节律感，本身是一种成熟。',
      old: '你常感到疲惫、对体力活动兴致不高。这可能是生活节奏或状态使然，值得认真关注：规律运动——哪怕只是每天散步二十分钟——都能显著改善主观精力与情绪，效果常在几周内可见。'
    },
    res: {
      young: '你的责任心还在"生长中"：习惯自由、抗拒束缚，对承诺和截止日期比较随性。责任感会随年龄稳步上升（Roberts & Mroczek, 2008），不必苛责自己；但可以从小处开始练习——先守住一个小承诺，把它变成习惯。',
      balanced: '你在自由与责任之间找到了舒服的平衡：对自己负责，也乐于对他人负责，同时不失去松弛感。这种"靠谱而不紧绷"的状态，是最让人感到安心的品质之一。',
      old: '你是那个"靠谱担当"的存在，常常是团队与家庭的压舱石。这是最被社会珍视的特质之一。但请留意，别把责任全揽在自己身上——学会放手与求助，同样是成熟的一部分，甚至更重要。'
    }
  },

  /* ---------- 人格画像（基于双轴四象限） ---------- */
  archetypes: [
    {
      id: 'chizi', m: 1, y: 1, title: '赤子之心型',
      short: '成熟与童心兼备',
      text: '这是最难得的状态：既看清了世事（成熟度），又没弄丢好奇活泼的童心（少年感）。孟子说"大人者，不失其赤子之心者也"——真正的成熟不是变得世故，而是看懂了世界之后，仍然愿意像孩子一样去好奇、去热爱。请珍惜这种平衡，它是很多人一生都在寻找的。'
    },
    {
      id: 'shishi', m: 1, y: 0, title: '世事洞明型',
      short: '通透有余，童心欠费',
      text: '你看世界的眼光已经相当通透：情绪稳定、懂得取舍、计划长远。这份成熟是真实的、可贵的。但如果少年感偏低，也许是生活把你"稳"住了——提醒自己：成熟不等于疲惫，偶尔安排一点"没意义但开心"的事，给童心放个假。'
    },
    {
      id: 'tianzhen', m: 0, y: 1, title: '天真烂漫型',
      short: '少年气十足',
      text: '你身上有满满的少年气：好奇、爱玩、精力旺盛、乐意结交新朋友。这是极珍贵的生命力。如果成熟度暂时偏低，通常只是"经历还在积累"——世界还欠你一些磨砺，而你恰好有的是时间去接住它。'
    },
    {
      id: 'mihang', m: 0, y: 0, title: '迷航待航型',
      short: '两轴都在蓄力',
      text: '你现在可能正处于"两头都不太够"的阶段：既感觉不到通透，也没多少冲劲。这通常不是人格问题，而是阶段性的——累了、忙了、迷茫了。别急着给自己贴标签，先恢复状态，两条轴都会慢慢回来。'
    }
  ],

  /* ---------- 平衡度文案 ---------- */
  balanceText: [
    { max: 6,  label: '非常均衡', text: '你的七个维度心理年龄彼此接近，说明你的心理状态在"青春"与"成熟"之间分布得很均匀，没有明显的跷跷板。' },
    { max: 11, label: '有一定分化', text: '你的维度之间有差异：有的层面偏年轻、有的偏成熟。这不是问题——大多数人都是如此，分化本身恰恰说明你有弹性。' },
    { max: 99, label: '两极分化明显', text: '你在不同维度上的心理年龄差异较大：有些层面充满少年气，有些层面却相当老练。这种"冰与火"的组合会让你在不同场合表现出截然不同的面貌——关键在于何时调用哪一面。' }
  ],

  /* ---------- 逐维度犹豫释义 ---------- */
  rhythmNotes: {
    cog: '在认知类题目上犹豫，可能意味着你正在两种思维方式之间摇摆，或对自己的学习方式尚不确定。',
    emo: '在情绪类题目上犹豫，往往说明情绪对你来说是"正在进行时"——感受还在变化，判断尚不清晰。',
    prd: '在审慎类题目上犹豫，可能暗示你在"该不该管住自己"这件事上反复权衡。',
    fut: '在未来类题目上犹豫，常表示"享受当下"与"为长远打算"两股力量正在你心里拉扯。',
    soc: '在社交类题目上犹豫，可能反映你对自己在人群中的位置并不十分确定。',
    vit: '在活力类题目上犹豫，也许和当下的身体状态有关——状态好与状态差时，答案会不一样。',
    res: '在责任类题目上犹豫，可能意味着你在"扛起责任"与"自我保护"之间权衡。'
  },

  /* ---------- 结果如何阅读 ---------- */
  howToRead: [
    '心理年龄不是一条线，而是两条独立的轴：成熟度（认清世事）与少年感（永葆童心）。它们可以同时很高——正如"看清世界"与"童心未泯"可以共存，这也是最理想的状态。',
    '心理年龄是"画像"，不是"标签"。它由多个维度加权合成，任何单一数字（包括顶部那个概括值）都只是参考，请以双轴画像和逐维度解析为准。',
    '责任担当不计入年龄——它是"担当"而非"年龄"，单独立卡展示。',
    '如果你年纪较轻，绝对的心理年龄数字往往会显得偏大——它是按"典型成年人"校准的。请以"与生理年龄的差值"和双轴画像为准，而不是只盯着那个数字。',
    '心理年龄反映的是"当前状态"，不是固定宿命。主观年龄会随生活事件、压力、关系与作息而波动，也可以被主动调整——运动、学习新事物、建立新关系、练习情绪觉察，都是被研究支持的调整方式。'
  ],

  /* ---------- 心理学依据与参考文献（GB/T 7714-2015 著录格式） ---------- */
  basisIntro: '本测验的维度与计分方式并非凭空设计，而是从多个经同行评议的发展心理学与人格心理学框架中提炼而来。参考文献按 GB/T 7714-2015 著录，供你进一步查阅；每条下方附"引用说明"解释其与本测验的关系。',

  references: [
    {
      type: 'M', authors: 'BIRREN J E, CUNNINGHAM W R', year: '1985',
      title: 'Research on the psychology of aging: principles, concepts and theory',
      container: 'In J. E. Birren & K. W. Schaie (Eds.), Handbook of the psychology of aging (2nd ed.)',
      publisher: 'New York: Van Nostrand Reinhold',
      note: '首次系统提出"生物年龄 / 心理年龄 / 社会年龄"三维度划分，将心理年龄定义为个体适应环境变化的"适应能力"——本测验七个维度的总框架来源。'
    },
    {
      type: 'M', authors: 'BALTES P B, REESE H W', year: '1984',
      title: 'The life-span perspective in developmental psychology',
      container: 'In M. H. Bornstein & M. E. Lamb (Eds.), Developmental psychology: an advanced textbook',
      publisher: 'Hillsdale, NJ: Lawrence Erlbaum Associates',
      note: '毕生发展观：发展贯穿一生、多方向且具有可塑性——"心理年龄是动态画像而非固定标签"的理论基础。'
    },
    {
      type: 'J', authors: 'KOTTER-GRÜHN D, KORNATD A E, STEPHAN Y', year: '2016',
      title: 'Looking beyond chronological age: current knowledge and future directions in the study of subjective age',
      journal: 'Gerontology', volume: '62', issue: '1', pages: '86-93', doi: '10.1159/000438671',
      note: '主观年龄研究综述："感觉多年轻"能预测身心健康与长寿。这是本测验最后一题（自感年龄）及"社会开放 / 活力体能"维度的直接依据。'
    },
    {
      type: 'J', authors: 'ZIMBARDO P G, BOYD J N', year: '1999',
      title: 'Putting time in perspective: a valid, reliable individual-differences metric',
      journal: 'Journal of Personality and Social Psychology', volume: '77', issue: '6', pages: '1271-1288', doi: '10.1037/0022-3514.77.6.1271',
      note: 'ZTPI 时间观量表：提出"当下享乐—未来导向—过去取向"等因子与"平衡时间观"。"未来导向"维度据此构建。'
    },
    {
      type: 'J', authors: 'CATTELL R B', year: '1963',
      title: 'Theory of fluid and crystallized intelligence: a critical experiment',
      journal: 'Journal of Educational Psychology', volume: '54', issue: '1', pages: '1-22', doi: '10.1037/h0046743',
      note: '流体智力（快速学习、灵活推理，随年龄先升后降）与晶体智力（经验积累）的经典区分——"认知活力"维度的理论依据。'
    },
    {
      type: 'J', authors: 'ROBERTS B W, MROCZEK D', year: '2008',
      title: 'Personality trait change in adulthood',
      journal: 'Current Directions in Psychological Science', volume: '17', issue: '1', pages: '31-35', doi: '10.1111/j.1467-8721.2008.00543.x',
      note: '人格成熟化研究：尽责性、情绪稳定性通常随年龄稳步上升——"审慎自律"与"责任担当"维度的依据。'
    },
    {
      type: 'J', authors: 'CARSTENSEN L L', year: '2006',
      title: 'The influence of a sense of time on human development',
      journal: 'Science', volume: '312', issue: '5782', pages: '1913-1915', doi: '10.1126/science.1127488',
      note: '社会情绪选择理论：当人感知时间有限时会更聚焦少数有意义的情绪目标——解释"社会开放"维度中偏年长者更专注的关系偏好。'
    },
    {
      type: 'J', authors: 'MCCRAE R R, COSTA P T', year: '1997',
      title: 'Personality trait structure as a human universal',
      journal: 'American Psychologist', volume: '52', issue: '5', pages: '509-516', doi: '10.1037/0003-066X.52.5.509',
      note: '大五人格跨文化普遍性：开放性、尽责性等维度为人格结构提供参照。'
    },
    {
      type: 'M', authors: 'ERIKSON E H', year: '1963',
      title: 'Childhood and society',
      edition: '2nd ed.',
      publisher: 'New York: W. W. Norton',
      note: '心理社会发展八阶段："繁殖感 vs 停滞"等阶段任务为"成熟"与"责任"提供发展心理学背景。'
    },
    {
      type: 'J', authors: 'STEPHAN Y, SUTIN A R, TERRACCIANO A', year: '2017',
      title: 'Feeling older and risk of hospitalization: evidence from three longitudinal cohorts',
      journal: 'Health Psychology', volume: '36', issue: '6', pages: '634-637', doi: '10.1037/hea0000488',
      note: '纵向研究：自感年龄偏大者的住院与健康风险更高——主观年龄不是"感觉而已"，它有可测量的健康后果。'
    }
  ],

  /* ---------- 致谢 ---------- */
  acknowledgement: [
    '最后，照例把这页留作"致谢"。',
    '感谢把这份测验带到你面前的制作者，以及我这个不太传统的"共同作者"愿安——如果没有好奇心，就不会有这组题目，也不会有这篇临时的小论文。',
    '更要感谢每一位愿意花几分钟填写它的你。一次作答，其实就是一次短暂的自省；是这些自省，让一份问卷真正有了意义。如果这份报告让你对自己多了一点点认识，哪怕只有一点，它就完成了使命。',
    '也想谢谢那些比我们早很多年开始追问"年龄到底是什么"的研究者——Birren、Baltes、Zimbardo、Carstensen……我们只是站在他们的肩膀上，替他们把问题又往下传了一棒。',
    '—— 你的心理年龄，从来不只是这些题目的答案。',
    '—— 愿安'
  ],

  disclaimer: '免责声明：本测验为自我探索用途的趣味测评。题目改编自公开发表的心理学框架，但并非标准化临床量表，结果不构成诊断、评估或替代专业心理咨询。如果你正经历持续的情绪困扰，请寻求专业心理从业者的帮助。'
};
