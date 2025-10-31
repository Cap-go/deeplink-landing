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
				const domainParam = url.searchParams.get('domain');
				console.log('[check-domain] Received request for domain:', domainParam);

				if (!domainParam) {
					console.log('[check-domain] Error: No domain provided');
					return new Response(JSON.stringify({ error: 'Domain is required' }), {
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}

				// Parse domain from URL if full URL was provided
				let domain: string;
				try {
					// If it looks like a URL (has protocol), parse it
					if (domainParam.includes('://')) {
						const parsedUrl = new URL(domainParam);
						domain = parsedUrl.hostname;
					} else if (domainParam.includes('/')) {
						// If it has a path but no protocol, extract just the domain part
						domain = domainParam.split('/')[0];
					} else {
						// Already just a domain
						domain = domainParam;
					}
					console.log('[check-domain] Parsed domain:', domain);
				} catch (e) {
					console.error('[check-domain] Failed to parse domain:', e);
					return new Response(JSON.stringify({ error: 'Invalid domain format' }), {
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				}

				try {
					const fetchHeaders = {
						'User-Agent': 'Mozilla/5.0 (compatible; DeepLinkTester/1.0; +https://aasa-tester.capgo.app)',
						'Accept': 'application/json, */*',
					};

					console.log('[check-domain] Starting parallel fetches for:', domain);

					const [aasaResponse, aasaCDNResponse, assetlinksResponse, assetlinksCachedResponse] = await Promise.all([
						fetch(`https://${domain}/.well-known/apple-app-site-association`, { headers: fetchHeaders }),
						fetch(`https://app-site-association.cdn-apple.com/a/v1/${domain}`, { headers: fetchHeaders }),
						fetch(`https://${domain}/.well-known/assetlinks.json`, { headers: fetchHeaders }),
						fetch(`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://${domain}&relation=delegate_permission/common.handle_all_urls`, { headers: fetchHeaders })
					]);

					console.log('[check-domain] Fetch responses:', {
						aasa: { status: aasaResponse.status, ok: aasaResponse.ok, contentType: aasaResponse.headers.get('content-type') },
						aasaCDN: { status: aasaCDNResponse.status, ok: aasaCDNResponse.ok, contentType: aasaCDNResponse.headers.get('content-type') },
						assetlinks: { status: assetlinksResponse.status, ok: assetlinksResponse.ok, contentType: assetlinksResponse.headers.get('content-type') },
						assetlinksCached: { status: assetlinksCachedResponse.status, ok: assetlinksCachedResponse.ok, contentType: assetlinksCachedResponse.headers.get('content-type') }
					});

					let aasaContent = null;
					let aasaCDNContent = null;
					let assetlinksContent = null;
					let assetlinksCachedContent = null;

					try {
						if (aasaResponse.ok) {
							aasaContent = await aasaResponse.json();
							console.log('[check-domain] AASA content parsed successfully');
						}
					} catch (e) {
						console.error('[check-domain] Failed to parse AASA JSON:', e);
					}

					try {
						if (aasaCDNResponse.ok) {
							aasaCDNContent = await aasaCDNResponse.json();
							console.log('[check-domain] AASA CDN content parsed successfully');
						}
					} catch (e) {
						console.error('[check-domain] Failed to parse AASA CDN JSON:', e);
					}

					try {
						if (assetlinksResponse.ok) {
							assetlinksContent = await assetlinksResponse.json();
							console.log('[check-domain] Assetlinks content parsed successfully');
						}
					} catch (e) {
						console.error('[check-domain] Failed to parse Assetlinks JSON:', e);
					}

					try {
						if (assetlinksCachedResponse.ok) {
							assetlinksCachedContent = await assetlinksCachedResponse.json();
							console.log('[check-domain] Cached Assetlinks content parsed successfully');
						}
					} catch (e) {
						console.error('[check-domain] Failed to parse cached Assetlinks JSON:', e);
					}

					const iosResults = {
						aasa: {
							found: aasaResponse.ok,
							contentType: aasaResponse.headers.get('content-type') || 'Not set',
							content: aasaContent,
							cdnContent: aasaCDNContent
						}
					};

					const androidResults = {
						assetlinks: {
							found: assetlinksResponse.ok,
							contentType: assetlinksResponse.headers.get('content-type') || 'Not set',
							content: assetlinksContent,
							cachedContent: assetlinksCachedContent
						}
					};

					console.log('[check-domain] Successfully completed check for:', domain);
					return new Response(JSON.stringify({ ios: iosResults, android: androidResults }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' }
					});
				} catch (error) {
					console.error('[check-domain] Unexpected error:', error);
					return new Response(JSON.stringify({
						error: 'Failed to check domain',
						details: error instanceof Error ? error.message : String(error)
					}), {
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
