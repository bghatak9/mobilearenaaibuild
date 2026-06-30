import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

type GoogleTranslateResponse = {
  data?: {
    translations?: {
      translatedText?: string;
      detectedSourceLanguage?: string;
    }[];
  };
};

@Injectable()
export class TranslateService {
  private readonly apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async translateVoice(input: {
    text: string;
    source?: string;
    target?: string;
  }) {
    const text = input.text.trim();
    const target = input.target?.trim() || 'en';
    const source = input.source?.trim();

    if (!text) {
      return {
        configured: this.isConfigured(),
        originalText: '',
        translatedText: '',
        target,
        sourceLanguage: source && source !== 'auto' ? source : null,
      };
    }

    if (!this.apiKey) {
      return {
        configured: false,
        originalText: text,
        translatedText: text,
        target,
        sourceLanguage: source && source !== 'auto' ? source : null,
      };
    }

    const body: Record<string, string> = {
      q: text,
      target,
      format: 'text',
    };
    if (source && source !== 'auto') {
      body.source = source;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(this.apiKey)}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new BadGatewayException('Google Translate is unreachable');
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      if (res.status === 403 || res.status === 401) {
        throw new ServiceUnavailableException(
          'Google Translate API key is invalid or Translation API is not enabled',
        );
      }
      throw new BadGatewayException(
        detail ? `Google Translate failed: ${detail.slice(0, 200)}` : 'Google Translate failed',
      );
    }

    const payload = (await res.json()) as GoogleTranslateResponse;
    const translation = payload.data?.translations?.[0];

    return {
      configured: true,
      originalText: text,
      translatedText: translation?.translatedText?.trim() || text,
      target,
      sourceLanguage:
        translation?.detectedSourceLanguage ||
        (source && source !== 'auto' ? source : null),
    };
  }
}
