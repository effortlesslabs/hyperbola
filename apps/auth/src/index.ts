import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getAuthUrl, exchangeCodeForToken, getProviderConfig } from './oauth';

const app = new Hono<{ Bindings: Env }>();

// Generic auth redirect handler
app.get(
	'/auth/:provider',
	zValidator(
		'param',
		z.object({
			provider: z.enum(['google', 'github']),
		})
	),
	(c) => {
		const { provider } = c.req.valid('param');
		const state = crypto.randomUUID();
		const config = getProviderConfig(provider, c.env);

		return c.redirect(getAuthUrl(config, state));
	}
);

// Generic callback handler
app.get(
	'/auth/:provider/callback',
	zValidator(
		'param',
		z.object({
			provider: z.enum(['google', 'github']),
		})
	),
	zValidator(
		'query',
		z.object({
			code: z.string().min(1),
		})
	),
	async (c) => {
		const { provider } = c.req.valid('param');
		const { code } = c.req.valid('query');

		const config = getProviderConfig(provider, c.env);

		const tokenData = await exchangeCodeForToken(config, code);
		return c.json(tokenData);
	}
);

app.get('/', (c) => {
	return c.text('Hello from Auth Service!');
});

app.get('/health', (c) => {
	return c.json({ status: 'ok' });
});

app.get('/version', (c) => {
	return c.json({ version: '1.0.0' });
});

export default app;
