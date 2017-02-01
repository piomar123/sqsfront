module.exports = {
  AWS_CONFIG_FILE: "./config.json",
  AWS_REGION: "us-west-2",
  SERVER_PORT: 8080,
  DB_DOMAIN: "piotr.marcinczyk.logs",
  LOG_PREFIX: "project-log-",
  S3_BUCKET: "lab4-weeia",
  S3_KEY_PREFIX_UPLOAD: "piotr.marcinczyk/project/upload/",
  S3_KEY_PREFIX_THUMBS: "piotr.marcinczyk/project/thumbs/",
  SQS_URL: "https://sqs.us-west-2.amazonaws.com/983680736795/MarcinczykSQS",
  SQS_MSG_ID: "S3projSQS",
  ACTION_THUMBNAIL: "thumbnail",
  ACTIONS: [
    { val: "levels", name: "Auto levels" },
    { val: "edge", name: "Edge detection" },
    { val: "blur", name: "Gaussian blur" },
    { val: "noise", name: "Noise reduction" },
    { val: "emboss", name: "Emboss" }
  ]
};
