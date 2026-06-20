const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION
});

const sendBookingNotification = async (payload) => {
  const queueUrl = process.env.BOOKING_NOTIFICATION_QUEUE_URL;

  if (!queueUrl) {
    console.log("BOOKING_NOTIFICATION_QUEUE_URL is not set; skipping booking notification.");
    return;
  }

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(payload)
  });

  await sqsClient.send(command);
  console.log("Published booking notification to SQS.");
};

module.exports = { sendBookingNotification };
