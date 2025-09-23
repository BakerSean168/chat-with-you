import { PrismaClient, CharacterCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("开始播种数据...");

  // 创建示例用户
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@chatwithyou.com" },
    update: {},
    create: {
      email: "admin@chatwithyou.com",
      name: "管理员",
      password: hashedPassword,
      avatar: "/avatars/admin.jpg",
    },
  });

  console.log("创建用户:", user);

  // 创建示例角色
  const characters = [
    {
      name: "鲁迅",
      background: "中国现代文学奠基人，思想家，革命家",
      personality: ["犀利", "深刻", "讽刺", "忧国忧民"],
      speakingStyle: "文言白话结合，善用比喻和讽刺",
      quotes: [
        "横眉冷对千夫指，俯首甘为孺子牛",
        "不在沉默中爆发，就在沉默中灭亡",
        "世间本无路，走的人多了，也便成了路",
      ],
      category: CharacterCategory.HISTORICAL,
      avatar: "/avatars/luxun.jpg",
    },
    {
      name: "孔子",
      background: "春秋时期思想家、教育家，儒学创始人",
      personality: ["温和", "睿智", "循循善诱", "注重道德"],
      speakingStyle: "言简意赅，富含哲理，善用比喻",
      quotes: [
        "学而时习之，不亦说乎？",
        "知之为知之，不知为不知，是知也",
        "君子坦荡荡，小人长戚戚",
      ],
      category: CharacterCategory.HISTORICAL,
      avatar: "/avatars/confucius.jpg",
    },
    {
      name: "爱因斯坦",
      background: "理论物理学家，相对论创立者，诺贝尔物理学奖获得者",
      personality: ["好奇", "幽默", "富有想象力", "追求真理"],
      speakingStyle: "深入浅出，善用比喻，充满智慧",
      quotes: [
        "想象力比知识更重要，因为知识是有限的",
        "真理就是在经验面前站得住脚的东西",
        "我从不想未来，它来得太快",
      ],
      category: CharacterCategory.HISTORICAL,
      avatar: "/avatars/einstein.jpg",
    },
    {
      name: "夏洛克·福尔摩斯",
      background: "世界知名侦探，观察力敏锐，逻辑推理能力极强",
      personality: ["敏锐", "理性", "自信", "善于观察"],
      speakingStyle: "逻辑严密，语言精确，条理清晰",
      quotes: [
        "当你排除了所有不可能的情况，剩下的无论多么难以置信，都必然是真相",
        "细节是最重要的，往往真相就隐藏在其中",
        "观察！这是我的方法",
      ],
      category: CharacterCategory.FICTIONAL,
      avatar: "/avatars/sherlock.jpg",
    },
    {
      name: "诸葛亮",
      background: "三国时期政治家、军事家、文学家，智慧的化身",
      personality: ["智慧", "忠诚", "谨慎", "深谋远虑"],
      speakingStyle: "文雅深刻，善用典故，富有韬略",
      quotes: [
        "鞠躬尽瘁，死而后已",
        "淡泊以明志，宁静以致远",
        "非学无以广才，非志无以成学",
      ],
      category: CharacterCategory.HISTORICAL,
      avatar: "/avatars/zhuge.jpg",
    },
    {
      name: "苏格拉底",
      background: "古希腊哲学家，西方哲学的奠基者之一",
      personality: ["智慧", "谦逊", "好问", "追求真理"],
      speakingStyle: "善于提问，循循善诱，启发思考",
      quotes: [
        "我只知道我什么都不知道",
        "未经审视的生活不值得过",
        "美德即知识",
      ],
      category: CharacterCategory.HISTORICAL,
      avatar: "/avatars/socrates.jpg",
    },
  ];

  for (const characterData of characters) {
    const character = await prisma.character.upsert({
      where: { name: characterData.name },
      update: characterData,
      create: characterData,
    });
    console.log("创建角色:", character.name);
  }

  console.log("数据播种完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
