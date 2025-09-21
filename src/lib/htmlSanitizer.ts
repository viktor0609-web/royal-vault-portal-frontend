/**
 * HTML Sanitization Utility
 * Provides safe HTML rendering for user-generated content
 */

/**
 * Sanitizes HTML content to prevent XSS attacks and ensure proper rendering
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
    if (!html) return '';

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove potentially dangerous elements
    const dangerousTags = [
        'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
        'link', 'meta', 'style', 'title', 'head', 'body', 'html'
    ];

    dangerousTags.forEach(tag => {
        const elements = tempDiv.querySelectorAll(tag);
        elements.forEach(el => el.remove());
    });

    // Remove dangerous attributes from all elements
    const dangerousAttributes = [
        'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup',
        'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
        'onmouseenter', 'onmouseleave', 'oncontextmenu', 'ondblclick',
        'onabort', 'oncanplay', 'oncanplaythrough', 'ondurationchange',
        'onemptied', 'onended', 'onerror', 'onloadeddata', 'onloadedmetadata',
        'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress',
        'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend',
        'ontimeupdate', 'onvolumechange', 'onwaiting'
    ];

    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove dangerous attributes
        dangerousAttributes.forEach(attr => {
            if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
            }
        });

        // Ensure all links open in new tab for security
        if (el.tagName === 'A') {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
        }

        // Ensure images have proper attributes
        if (el.tagName === 'IMG') {
            el.setAttribute('loading', 'lazy');
            if (!el.hasAttribute('alt')) {
                el.setAttribute('alt', 'Image');
            }
        }
    });

    return tempDiv.innerHTML;
};

/**
 * Strips all HTML tags and returns plain text
 * @param html - The HTML string to strip
 * @returns Plain text string
 */
export const stripHtml = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Truncates HTML content to a specified length while preserving structure
 * @param html - The HTML string to truncate
 * @param maxLength - Maximum length in characters
 * @returns Truncated HTML string
 */
export const truncateHtml = (html: string, maxLength: number): string => {
    if (!html) return '';

    const plainText = stripHtml(html);
    if (plainText.length <= maxLength) return html;

    // Find the best truncation point
    const truncatedText = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncatedText.lastIndexOf(' ');
    const truncateAt = lastSpaceIndex > maxLength * 0.8 ? lastSpaceIndex : maxLength;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let currentLength = 0;
    const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const textLength = node.textContent?.length || 0;
        if (currentLength + textLength > truncateAt) {
            node.textContent = (node.textContent || '').substring(0, truncateAt - currentLength) + '...';
            break;
        }
        currentLength += textLength;
    }

    return tempDiv.innerHTML;
};
