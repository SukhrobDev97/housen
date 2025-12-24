import { Injectable } from "@nestjs/common";

@Injectable()
export class AiService {
  private readonly ollamaUrl = 'http://172.17.0.1:11434';
  private readonly model = 'mistral:latest';

  async askQuestion(question: string): Promise<string> {
    let res: Response;

    try {
      res = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: question,
          stream: false,
        }),
      });
    } catch (networkErr) {
      console.error('❌ NETWORK ERROR TO OLLAMA', networkErr);
      return 'AI network error';
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ OLLAMA BAD RESPONSE', res.status, text);
      return 'AI response error';
    }

    let data: any;
    try {
      data = await res.json();
    } catch (jsonErr) {
      console.error('❌ JSON PARSE ERROR', jsonErr);
      return 'AI parse error';
    }

    if (!data?.response) {
      console.error('❌ INVALID OLLAMA PAYLOAD', data);
      return 'AI invalid response';
    }

    return data.response;
  }
}
