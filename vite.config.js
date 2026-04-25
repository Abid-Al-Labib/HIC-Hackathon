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
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// Server-only env vars (no VITE_ prefix) that the dev middleware needs to
// expose to api/* handlers via process.env. In production on Vercel these
// come from the project settings automatically.
var SERVER_ENV_KEYS = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"];
function elevenLabsDevApi() {
    return {
        name: "elevenlabs-dev-api",
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use("/api/elevenlabs/tts", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var mod, handler, err_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (req.method === "OPTIONS") {
                                res.setHeader("Access-Control-Allow-Origin", "*");
                                res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
                                res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                                res.statusCode = 204;
                                res.end();
                                return [2 /*return*/];
                            }
                            if (req.method !== "POST") {
                                next();
                                return [2 /*return*/];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, server.ssrLoadModule("/api/elevenlabs/tts.ts")];
                        case 2:
                            mod = _b.sent();
                            handler = mod
                                .default;
                            if (typeof handler !== "function") {
                                throw new Error("api/elevenlabs/tts.ts does not export a default handler");
                            }
                            return [4 /*yield*/, handler(req, res)];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            err_1 = _b.sent();
                            // eslint-disable-next-line no-console
                            console.error("[/api/elevenlabs/tts]", err_1);
                            if (!res.writableEnded) {
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json; charset=utf-8");
                                res.end(JSON.stringify({
                                    error: "API handler error",
                                    details: (_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) !== null && _a !== void 0 ? _a : String(err_1),
                                }));
                            }
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), "");
    for (var _i = 0, SERVER_ENV_KEYS_1 = SERVER_ENV_KEYS; _i < SERVER_ENV_KEYS_1.length; _i++) {
        var key = SERVER_ENV_KEYS_1[_i];
        if (env[key] && !process.env[key]) {
            process.env[key] = env[key];
        }
    }
    return {
        plugins: [react(), elevenLabsDevApi()],
    };
});
