"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const ses_1 = require("../../config/ses");
const sendEmail = (toEmail, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: 'lohithsairam10@gmail.com',
        Destination: {
            ToAddresses: Array.isArray(toEmail) ? toEmail : [toEmail]
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
    yield ses_1.ses.sendEmail(params).promise();
});
exports.sendEmail = sendEmail;
