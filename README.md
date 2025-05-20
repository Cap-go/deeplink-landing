# Deep Link Testing Hub

The Deep Link Testing Hub is a comprehensive landing page designed to help developers understand, test, and troubleshoot deep links, Universal Links (iOS), and App Links (Android). It provides tools to validate `apple-app-site-association` (AASA) files and `assetlinks.json` files, along with guides for configuring deep linking in mobile applications.

**Live Demo:** [https://aasa-tester.capgo.app/](https://aasa-tester.capgo.app/)

## Key Features

*   **Deep Link Information:** Explains the basics of URL Schemes, Universal Links, and App Links, including their pros and cons.
*   **URL Scheme Testing:** Provides a collection of common URL schemes for popular apps to test on your device.
*   **Universal/App Link Examples:** Shows examples of how Universal Links and App Links look.
*   **System Deep Link Testing:** Includes examples of system-level deep links (e.g., `tel:`, `mailto:`, `geo:`).
*   **AASA & `assetlinks.json` Validator (Domain Checker):**
    *   Fetches and validates `apple-app-site-association` files for iOS Universal Links.
    *   Fetches and validates `assetlinks.json` files for Android App Links.
    *   Checks `Content-Type` headers.
    *   Validates JSON structure and required fields (App ID, paths, package name, SHA-256 fingerprints).
    *   Checks against Apple CDN and Google cache status.
    *   Displays the fetched file content.
*   **Configuration Generators:** Interactive forms to help generate the correct JSON content for AASA and `assetlinks.json` files.
*   **Setup Guides:** Step-by-step instructions for:
    *   Opening deep links from your app (iOS & Android).
    *   Receiving deep links in your app (iOS & Android).
    *   Configuring iOS Universal Links (AASA file).
    *   Configuring Android App Links (`assetlinks.json` file).
    *   Finding your iOS Team ID and Android SHA-256 Certificate Fingerprint.

## Main Sections of the Page

*   **Header & Navigation:** Quick links to "Test Deep Links" and "Check Domain" sections.
*   **About Our AASA & Universal Links Validator:** Explains the purpose and functionality of the domain validation tool.
*   **Quick Navigation:** A table of contents for easy access to different topics.
*   **What are Deep Links?:** An introduction to deep linking concepts.
*   **URL Scheme Deep Links:** A grid of buttons to test various app URL schemes.
*   **Universal Links (AASA):** Examples of Universal Links.
*   **System Deep Links:** A grid of buttons to test system-level URL schemes.
*   **Testing Tips:** General advice for testing deep links.
*   **Deep Linking Setup Guide:** Detailed instructions and code snippets for implementing deep links.
    *   Opening Deep Links from Your App
    *   Receiving Deep Links in Your App
    *   Universal Links/App Links (Modern) - including AASA and `assetlinks.json` configuration helpers.
*   **Universal Link Domain Checker:** The interactive tool to validate domain configurations for Universal Links and App Links.

## Technology Stack

*   **Frontend:** HTML, CSS, JavaScript (vanilla)
*   **Analytics:** Plausible (via `pls.digitalshift-ee.workers.dev`)
*   **Backend (for Domain Checker):** Cloudflare Worker (implied by `wrangler.jsonc` and the `/check-domain` endpoint)
*   **Code Highlighting:** Prism.js

## Getting Started (Local Development)

This project is primarily a static HTML page with client-side JavaScript, but it relies on a Cloudflare Worker for the domain checking functionality.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Cap-go/deeplink-landing.git
    cd deeplink-landing
    ```

2.  **Serve the `public` directory:**
    You can use any simple HTTP server to serve the `public` directory. For example, using Python:
    ```bash
    python -m http.server --directory public
    # or for Python 3
    python3 -m http.server --directory public
    ```
    Or using `npx`:
    ```bash
    npx serve public
    ```
    The page will be accessible at `http://localhost:8000` (or another port depending on the server).

3.  **Cloudflare Worker (`check-domain` endpoint):**
    The domain checking functionality (`/check-domain`) is handled by a Cloudflare Worker.
    *   Ensure you have [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) installed and configured.
    *   The worker code is likely in the `src/` directory (e.g., `src/index.ts` or `src/worker.ts`).
    *   To run the worker locally for development, you might use a command like:
        ```bash
        npx wrangler dev
        ```
    *   You will need to ensure your frontend fetch requests to `/check-domain` are correctly routed to the local Wrangler dev server, or deploy the worker to a dev environment on Cloudflare.

    *(Refer to `wrangler.jsonc` and `package.json` for specific scripts and worker configuration.)*

## Deployment

*   The static frontend (HTML, CSS, JS in `public/`) can be deployed to any static hosting provider (e.g., Cloudflare Pages, GitHub Pages, Netlify, Vercel).
*   The backend worker for domain checking needs to be deployed to Cloudflare Workers. The `wrangler.jsonc` file configures this deployment. A command like `npx wrangler deploy` would typically be used.

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgements

*   Created and maintained by [Capgo.app](https://capgo.app/) - The Universal App Update Solution.
*   Utilizes Prism.js for code syntax highlighting.
