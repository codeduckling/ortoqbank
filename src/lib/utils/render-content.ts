import { type JSONContent } from '@tiptap/react';

export function renderContent(content: JSONContent) {
  if (!content) return '';

  const renderNode = (node: JSONContent): string => {
    if (node.type === 'text' && typeof node.text === 'string') {
      return node.text;
    }

    if (node.type === 'paragraph') {
      const children =
        node.content?.map(child => renderNode(child)).join('') || '';
      return `<p>${children}</p>`;
    }

    if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      const children =
        node.content?.map(child => renderNode(child)).join('') || '';
      return `<h${level}>${children}</h${level}>`;
    }

    if (node.type === 'bulletList') {
      const items =
        node.content?.map(child => renderNode(child)).join('') || '';
      return `<ul>${items}</ul>`;
    }

    if (node.type === 'orderedList') {
      const items =
        node.content?.map(child => renderNode(child)).join('') || '';
      return `<ol>${items}</ol>`;
    }

    if (node.type === 'listItem') {
      const children =
        node.content?.map(child => renderNode(child)).join('') || '';
      return `<li>${children}</li>`;
    }

    if (node.type === 'image' && node.attrs) {
      const { src, alt, style } = node.attrs;
      return `<img src="${src}" alt="${alt || ''}" style="${style || ''}" />`;
    }

    return '';
  };

  return content.content?.map(node => renderNode(node)).join('') || '';
}
