"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDto = exports.CreateConversationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateConversationDto {
    merchantId;
    message;
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "merchantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "message", void 0);
class MessageDto {
    messageType = client_1.MessageType.TEXT;
    content;
    mediaUrl;
}
exports.MessageDto = MessageDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MessageType),
    __metadata("design:type", String)
], MessageDto.prototype, "messageType", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((value) => !value.mediaUrl),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], MessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((value) => !value.content),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], MessageDto.prototype, "mediaUrl", void 0);
//# sourceMappingURL=conversation.dto.js.map