module.exports = {
  AWS_CONFIG_FILE: "./config.json",
  SERVER_PORT: 8080,
  DB_DOMAIN: "piotr.marcinczyk.logs",
  LOG_PREFIX: "project-log-",
  S3_BUCKET: "lab4-weeia",
  S3_KEY_PREFIX_UPLOAD: "piotr.marcinczyk/project/upload/",
  S3_KEY_PREFIX_THUMBS: "piotr.marcinczyk/project/thumbs/",
  SQS_URL: "https://sqs.us-west-2.amazonaws.com/983680736795/MarcinczykSQS",
  SQS_MSG_ID: "S3projSQS",
  ACTION_THUMBNAIL: "thumbnail"
};
