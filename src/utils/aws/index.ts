import aws from "aws-sdk";

const accessKeyId = process.env.SPACES_ACCESS_KEY;
const secretAccessKey = process.env.SPACES_SECRET_KEY;

const s3 = new aws.S3({ accessKeyId, secretAccessKey });

export default s3;
