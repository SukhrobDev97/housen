import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'mistral:latest';

  async askQuestion(question: string): Promise<string> {
    try {
      const res = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: question,
          stream: false,
        },
        {
          timeout: 120000, // 2 minut
        },
      );

      if (!res.data?.response) {
        console.error('❌ INVALID OLLAMA RESPONSE', res.data);
        return 'AI invalid response';
      }

      return res.data.response;
    } catch (err: any) {
      console.error('❌ AI ERROR', err?.message || err);
      return 'AI internal error';
    }
  }
}
