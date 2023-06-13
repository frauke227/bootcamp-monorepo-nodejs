// var amqp = require('amqplib/callback_api')
import amqp, {Channel} from 'amqplib'

// will create connection inside main.ts
const rabbitMqConnection  = async () => {

    const connection = await amqp.connect('amqp://localhost')
    const channel: Channel = await connection.createChannel()
    return {connection, channel}
}

export default rabbitMqConnection
