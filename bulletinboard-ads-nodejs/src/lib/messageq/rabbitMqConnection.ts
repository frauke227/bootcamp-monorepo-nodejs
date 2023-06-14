// var amqp = require('amqplib/callback_api')
import amqp, {Channel} from 'amqplib'

// will create connection inside main.ts
const queue = 'averageRatingQueue'

const rabbitMqConnection  = async () => {

    const connection = await amqp.connect('amqp://localhost')
    const channel: Channel = await connection.createChannel()
    await channel.assertQueue(queue, {
      durable: false
    });
    return {connection, channel}
}

export default rabbitMqConnection
