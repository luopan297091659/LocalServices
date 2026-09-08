"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let RequestLoggingMiddleware = class RequestLoggingMiddleware {
    logger = new common_1.Logger('HTTP');
    use(request, response, next) {
        const incomingId = request.header('x-request-id');
        const requestId = incomingId && /^[A-Za-z0-9._-]{1,128}$/.test(incomingId) ? incomingId : (0, node_crypto_1.randomUUID)();
        const startedAt = performance.now();
        response.setHeader('x-request-id', requestId);
        response.once('finish', () => {
            this.logger.log(JSON.stringify({
                requestId,
                userId: request.user?.sub,
                method: request.method,
                path: request.path,
                status: response.statusCode,
                durationMs: Number((performance.now() - startedAt).toFixed(1)),
            }));
        });
        next();
    }
};
exports.RequestLoggingMiddleware = RequestLoggingMiddleware;
exports.RequestLoggingMiddleware = RequestLoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggingMiddleware);
//# sourceMappingURL=request-logging.middleware.js.map