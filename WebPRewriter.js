// ==UserScript==
// @name         eBay s-l1600 WebP → JPG Rewriter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Rewrite ebayimg.com s-l1600.webp image URLs to s-l1600.jpg
// @author       PulpCovers.com
// @updateURL    
// @downloadURL  
// @match        *://*.ebayimg.com/*
// @match        *://*.ebay.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_NAME = 's-l1600.webp';
    const REPLACEMENT_NAME = 's-l1600.jpg';

    function rewriteUrl(url) {
        if (!url) return url;
        try {
            // Only touch ebayimg.com URLs
            const u = new URL(url, location.href);
            if (!/\.ebayimg\.com$/i.test(u.hostname)) return url;

            if (u.pathname.endsWith('/' + TARGET_NAME)) {
                u.pathname = u.pathname.replace('/' + TARGET_NAME, '/' + REPLACEMENT_NAME);
                return u.toString();
            }
        } catch (e) {
            // Fallback for relative or malformed URLs
            if (url.endsWith('/' + TARGET_NAME) && url.includes('ebayimg.com')) {
                return url.replace('/' + TARGET_NAME, '/' + REPLACEMENT_NAME);
            }
        }
        return url;
    }

    function rewriteElement(el) {
        if (!el) return;

        // Only touch attributes likely to hold the full image URL
        const attrs = ['src', 'href', 'data-src', 'data-img', 'data-fullsrc'];

        for (const attr of attrs) {
            if (!el.hasAttribute(attr)) continue;

            const val = el.getAttribute(attr);
            const rewritten = rewriteUrl(val);

            if (rewritten !== val) {
                el.setAttribute(attr, rewritten);
            }
        }
    }

    function rewriteAll() {
        // Limit to img and a tags to avoid overreach
        document.querySelectorAll('img, a').forEach(rewriteElement);
    }

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                rewriteElement(m.target);
            } else if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches('img, a')) {
                            rewriteElement(node);
                        }
                        node.querySelectorAll && node.querySelectorAll('img, a').forEach(rewriteElement);
                    }
                });
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'href', 'data-src', 'data-img', 'data-fullsrc']
    });

    rewriteAll();
})();
