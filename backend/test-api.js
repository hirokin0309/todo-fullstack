const Anthropic = require('@anthropic-ai/sdk').default;

// 環境変数から読み込むか、直接テスト用に入力
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.log('ANTHROPIC_API_KEY is not set');
  console.log('Run: ANTHROPIC_API_KEY=your-key node test-api.js');
  process.exit(1);
}

console.log('API Key length:', apiKey.length);
console.log('API Key prefix:', apiKey.substring(0, 15) + '...');

const anthropic = new Anthropic({ apiKey });

async function test() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success! Response:', response.content[0].text);
  } catch (error) {
    console.log('Error:', error.message);
    console.log('Status:', error.status);
  }
}

test();
