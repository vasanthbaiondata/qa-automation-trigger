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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestOtpFromEmail = getLatestOtpFromEmail;
var Imap = require("imap");
var mailparser_1 = require("mailparser");
var dotenv = require("dotenv");
dotenv.config();
/**
 * Formats date to 'DD-MMM-YYYY' for IMAP search
 */
function formatDate(date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var day = date.getDate();
    var month = monthNames[date.getMonth()];
    var year = date.getFullYear();
    return "".concat(day, "-").concat(month, "-").concat(year);
}
/**
 * Fetch the latest OTP from email inbox
 */
function getLatestOtpFromEmail() {
    return __awaiter(this, void 0, void 0, function () {
        var user, password, host, port, tls;
        var _this = this;
        return __generator(this, function (_a) {
            user = process.env.EMAIL_USER;
            password = process.env.EMAIL_PASS;
            host = process.env.IMAP_HOST;
            port = parseInt(process.env.IMAP_PORT || '993', 10);
            tls = process.env.IMAP_TLS === 'true';
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var imap = new Imap({
                        user: user,
                        password: password,
                        host: host,
                        port: port,
                        tls: tls,
                        tlsOptions: { rejectUnauthorized: false },
                    });
                    imap.once('error', function (err) {
                        console.error('IMAP error:', err);
                        reject(err);
                    });
                    imap.once('end', function () {
                        console.log('IMAP connection ended');
                    });
                    imap.once('ready', function () {
                        imap.openBox('INBOX', false, function (err, box) {
                            if (err)
                                return reject(err);
                            var sinceDate = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour
                            imap.search(['UNSEEN', ['SINCE', formatDate(sinceDate)]], function (err, results) {
                                if (err)
                                    return reject(err);
                                if (!results || results.length === 0)
                                    return reject(new Error('No new OTP emails found'));
                                // Get the latest email only
                                var latestEmailId = results[results.length - 1];
                                var f = imap.fetch(latestEmailId, { bodies: '', markSeen: true });
                                f.on('message', function (msg) {
                                    var emailBuffer = '';
                                    msg.on('body', function (stream) {
                                        stream.on('data', function (chunk) { emailBuffer += chunk.toString('utf8'); });
                                    });
                                    msg.once('end', function () { return __awaiter(_this, void 0, void 0, function () {
                                        var parsed, otpMatch, parseErr_1;
                                        var _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    _b.trys.push([0, 2, , 3]);
                                                    return [4 /*yield*/, (0, mailparser_1.simpleParser)(emailBuffer)];
                                                case 1:
                                                    parsed = _b.sent();
                                                    console.log('Email subject:', parsed.subject);
                                                    otpMatch = (_a = parsed.text) === null || _a === void 0 ? void 0 : _a.match(/OTP\D*(\d{6})/i);
                                                    if (otpMatch) {
                                                        console.log('OTP found:', otpMatch[1]);
                                                        imap.end();
                                                        resolve(otpMatch[1]);
                                                    }
                                                    else {
                                                        imap.end();
                                                        reject(new Error('OTP not found in email'));
                                                    }
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    parseErr_1 = _b.sent();
                                                    imap.end();
                                                    reject(parseErr_1);
                                                    return [3 /*break*/, 3];
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                                f.once('error', function (fetchErr) {
                                    imap.end();
                                    reject(fetchErr);
                                });
                            });
                        });
                    });
                    console.log('Connecting to IMAP server...');
                    imap.connect();
                })];
        });
    });
}
