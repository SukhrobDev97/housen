import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async askQuestion(question: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o (latest available model)
        messages: [
          {
            role: 'system',
            content: 'You are Housen AI assistant. Be concise, professional, and practical.',
          },
          {
            role: 'user',
            content: question,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content;
      
      if (!answer) {
        throw new InternalServerErrorException('AI error');
      }

      return answer;
    } catch (error) {
      // Log error without exposing sensitive information
      if (error instanceof Error) {
        // Only log error type, not the full error
        throw new InternalServerErrorException('AI error');
      }
      throw new InternalServerErrorException('AI error');
    }
  }
}
