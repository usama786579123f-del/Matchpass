import { useEffect } from 'react';

/**
 * Lightweight SEO hook - sets document title, meta description, and
 * optional Open Graph tags + JSON-LD structured data without pulling
 * in react-helmet. Since this is a client-rendered app, search engines
 * that execute JavaScript (Googlebot does) will still see these tags;
 * this covers most of the SEO benefit of full SSR without the
 * architectural rewrite.
 */
export const useSEO = ({ title, description, ogImage, jsonLd }) => {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) {
      document.title = `${title} | MatchPass`;
    }

    const setMetaTag = (name, content, attr = 'name') => {
      if (!content) return null;
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      const created = !tag;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
      return created ? tag : null;
    };

    const createdDescription = setMetaTag('description', description);
    const createdOgTitle = setMetaTag('og:title', title, 'property');
    const createdOgDescription = setMetaTag('og:description', description, 'property');
    const createdOgImage = setMetaTag('og:image', ogImage, 'property');

    let scriptTag = null;
    if (jsonLd) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      document.title = previousTitle;
      [createdDescription, createdOgTitle, createdOgDescription, createdOgImage].forEach(
        (tag) => tag && tag.remove()
      );
      if (scriptTag) scriptTag.remove();
    };
  }, [title, description, ogImage, jsonLd]);
};