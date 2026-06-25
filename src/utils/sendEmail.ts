import {ses} from "../../config/ses"

const sendEmail = async (toEmail: string|string[], subject: string, body: string) => {
  const params = {
    Source: 'lohithsairam10@gmail.com',
    Destination: {
      ToAddresses:Array.isArray(toEmail)?toEmail:[toEmail]
    },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: body
        }
      }
    }
  };

  await ses.sendEmail(params).promise();
};
export {sendEmail}