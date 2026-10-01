import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { createDb, users, videos, comments, danmakus } from '../src/index'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  const db = createDb(url)

  const demoAccount = process.env.SEED_DEMO_ACCOUNT || 'demo'
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'demo123'

  let [demo] = await db.select().from(users).where(eq(users.account, demoAccount)).limit(1)
  if (!demo) {
    const [created] = await db
      .insert(users)
      .values({
        account: demoAccount,
        passwordHash: await hash(demoPassword, 10),
        username: '演示UP主',
        avatar: '',
        sign: '这是演示账号，方便本地逛站',
        role: 'user',
      })
      .returning()
    demo = created!
    console.log(`created demo user ${demoAccount} / ${demoPassword}`)
  } else {
    console.log(`demo user exists: ${demoAccount}`)
  }

  const existing = await db.select().from(videos).where(eq(videos.uid, demo.id)).limit(1)
  if (existing.length) {
    console.log('demo videos already exist, skip')
    process.exit(0)
  }

  const samples = [
    {
      title: 'Big Buck Bunny（演示）',
      description: '开源演示短片，用于本地联调播放与评论。',
      cover: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      clicks: 128,
    },
    {
      title: 'Elephant Dream（演示）',
      description: '第二条演示视频，可测搜索与热门排序。',
      cover: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      clicks: 86,
    },
    {
      title: 'Sintel（演示）',
      description: '第三条演示视频，封面与播放均来自公开 sample。',
      cover: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      clicks: 64,
    },
  ]

  for (const s of samples) {
    const [v] = await db
      .insert(videos)
      .values({
        title: s.title,
        description: s.description,
        cover: s.cover,
        url: s.url,
        uid: demo.id,
        clicks: s.clicks,
        status: 'approved',
        partitionId: 0,
      })
      .returning()

    if (!v) continue

    await db.insert(comments).values({
      vid: v.id,
      uid: demo.id,
      content: '演示评论：播放与评论区联调通过。',
    })

    await db.insert(danmakus).values([
      { vid: v.id, uid: demo.id, text: '欢迎来到 VidHub', color: '#ffffff', time: 1, type: 0 },
      { vid: v.id, uid: demo.id, text: '演示弹幕', color: '#ffdd57', time: 3, type: 0 },
    ])
  }

  console.log(`seeded ${samples.length} approved videos with comments/danmaku`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
