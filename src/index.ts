/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		switch (url.pathname) {
			case '/check-domain':
				const domain = url.searchParams.get('domain');
				if (!domain) {
					return new Response(JSON.stringify({ error: 'Domain is required' }), {
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}

				try {
					const [aasaResponse, aasaCDNResponse, assetlinksResponse, assetlinksCachedResponse] = await Promise.all([
						fetch(`https://${domain}/.well-known/apple-app-site-association`),
						fetch(`https://app-site-association.cdn-apple.com/a/v1/${domain}`),
						fetch(`https://${domain}/.well-known/assetlinks.json`),
						fetch(`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://${domain}&relation=delegate_permission/common.handle_all_urls`)
					]);

					const iosResults = {
						aasa: {
							found: aasaResponse.ok,
							contentType: aasaResponse.headers.get('content-type') || 'Not set',
							content: aasaResponse.ok ? await aasaResponse.json() : null,
							cdnContent: aasaCDNResponse.ok ? await aasaCDNResponse.json() : null
						}
					};

					const androidResults = {
						assetlinks: {
							found: assetlinksResponse.ok,
							contentType: assetlinksResponse.headers.get('content-type') || 'Not set',
							content: assetlinksResponse.ok ? await assetlinksResponse.json() : null,
							cachedContent: assetlinksCachedResponse.ok ? await assetlinksCachedResponse.json() : null
						}
					};

					return new Response(JSON.stringify({ ios: iosResults, android: androidResults }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (error) {
					return new Response(JSON.stringify({ error: 'Failed to check domain' }), {
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}

			default:
				return new Response('Not Found', { 
					status: 404,
					headers: corsHeaders
				});
		}
	},
} satisfies ExportedHandler<Env>;
