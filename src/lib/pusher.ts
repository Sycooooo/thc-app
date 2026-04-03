import Pusher from 'pusher'

const hasConfig = process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.PUSHER_SECRET && process.env.NEXT_PUBLIC_PUSHER_CLUSTER

const realPusher = hasConfig
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null

export const pusher = {
  trigger: (...args: Parameters<Pusher['trigger']>) =>
    realPusher ? realPusher.trigger(...args) : Promise.resolve({}),
}
