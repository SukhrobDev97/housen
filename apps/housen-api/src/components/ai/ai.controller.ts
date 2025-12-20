import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

interface AskAiDto {
  question: string;
}

interface AskAiResponse {
  answer: string;
}

@Controller('api')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask-ai')
  async askAi(@Body() body: AskAiDto): Promise<AskAiResponse> {
    const { question } = body;

    // Validate input
    if (!question || typeof question !== 'string') {
      throw new BadRequestException('Question is required and must be a string');
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 2) {
      throw new BadRequestException('Question must be at least 2 characters long');
    }

    const answer = await this.aiService.askQuestion(trimmedQuestion);

    return { answer };
  }
}
