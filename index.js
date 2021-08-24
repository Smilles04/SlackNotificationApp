const axios = require('axios');

/**
 * Check if requirement parameter are received
 * @param message 
 * @return {boolean}
 */
function checkMessage(message) {
  const required = ['environment', 'username', 'message', 'emoji', 'attachments'];
  
  for (const property in required) {
    if (!message.hasOwnProperty(required[property])) {
      throw new Error('Required parameter not received: ' + required[property]);
    }
  }
}

/**
 * Format Slack Message
 * @param message 
 * @return {object} 
 */
function handleSlackMessage(message) {
  return {
    username: message.username,
    text: message.message,
    'icon_emoji': message.emoji,
    attachments: message.attachments
  }
}

/**
 * Send message to Slack
 * @param body 
 */
async function sendSlackMessage (body) {
  const webhookUrl = (process.env.enviroment == 'production')
    ? process.env.SLACK_WEBHOOK_PROD
    : process.env.SLACK_WEBHOOK_STG;

  const slackBody = handleSlackMessage(body);
  try {
    await axios.post(webhookUrl, slackBody, {
      'Content-Type': 'application/json'
    });
  } catch (error) {
    throw new Error(error);
  }
}

exports.handler = async (event) => {
  console.debug('Received event:', JSON.stringify(event, null, 4));
  
  const message = JSON.parse(event.Records[0].Sns.Message);
  
  console.debug('Message received from SNS:', message);
  
  checkMessage(message);

  await sendSlackMessage(message);
  
  console.debug('Success');
};