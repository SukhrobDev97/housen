import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask-ai')
  async askAi(@Body('question') question: string) {
    if (!question || typeof question !== 'string') {
      throw new BadRequestException('Question is required and must be a string');
    }

    const trimmed = question.trim();
    if (!trimmed) {
      throw new BadRequestException('Question must not be empty');
    }

    const answer = await this.aiService.askQuestion(trimmed);
    return { answer };
  }
}
