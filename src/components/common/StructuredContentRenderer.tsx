import Image from 'next/image';
import React from 'react';

// Define a basic type for the content nodes.
// You might want to refine this based on all possible node types and attributes from your editor.
export interface ContentNode {
  type: string;
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: { [key: string]: any };
    [key: string]: any;
  }>; // Allow additional mark attributes like color
  content?: ContentNode[];
  attrs?: { [key: string]: any }; // Handle attributes like for images or links
}

// Props for the main renderer component
interface StructuredContentRendererProps {
  node: ContentNode | null | undefined;
}

// Helper function to render a single node
function renderNode(node: ContentNode, key: string | number): React.ReactNode {
  let children: React.ReactNode = undefined;
  if (node.content) {
    // Recursively render child nodes
    children = node.content.map((childNode, index) =>
      renderNode(childNode, `${key}-${index}`),
    );
  }

  let element: React.ReactNode;

  switch (node.type) {
    case 'doc': {
      // The root 'doc' node just renders its children
      element = <>{children}</>;
      break;
    }
    case 'paragraph': {
      // Render paragraph, handling empty paragraphs potentially
      element = (
        <p key={key} className="whitespace-pre-wrap">
          {children || <br />}
        </p>
      );
      break;
    }
    case 'bulletList': {
      element = (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {children}
        </ul>
      );
      break;
    }
    case 'orderedList': {
      element = (
        <ol key={key} className="list-decimal space-y-1 pl-5">
          {children}
        </ol>
      );
      break;
    }
    case 'listItem': {
      // List items render their children (which are often paragraphs)
      element = <li key={key}>{children}</li>;
      break;
    }
    case 'text': {
      // Apply marks to text nodes
      let textElement: React.ReactNode = <>{node.text}</>;
      let currentStyle: React.CSSProperties = {};

      if (node.marks) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold': {
              textElement = <strong>{textElement}</strong>;
              break;
            }
            case 'italic': {
              textElement = <em>{textElement}</em>;
              break;
            }
            case 'underline': {
              textElement = <u>{textElement}</u>;
              break;
            }
            case 'strike': {
              textElement = <s>{textElement}</s>;
              break;
            }
            case 'textStyle': {
              if (mark.attrs?.color) {
                currentStyle.color = mark.attrs.color;
              }
              break;
            }
            default: {
              break;
            }
          }
        });
      }
      // Apply inline styles if any exist
      if (Object.keys(currentStyle).length > 0) {
        textElement = <span style={currentStyle}>{textElement}</span>;
      }
      // Assign the final fragment to the element variable
      element = <React.Fragment key={key}>{textElement}</React.Fragment>;
      break;
    }
    case 'hardBreak': {
      element = <br key={key} />;
      break;
    }
    case 'image': {
      const { src, alt, width, height, style } = node.attrs || {};
      // Basic image rendering, consider adding error handling or placeholders

      // Parse the style string into an object
      const parsedStyles: Record<string, string> = {};
      if (typeof style === 'string') {
        style.split(';').forEach(declaration => {
          const [property, value] = declaration.split(':');
          if (property && value) {
            // Convert kebab-case to camelCase for React style properties
            const camelCaseProperty = property
              .trim()
              .replaceAll(/-([a-z])/g, g => g[1].toUpperCase());
            parsedStyles[camelCaseProperty] = value.trim();
          }
        });
      }

      element = (
        <img
          key={key}
          src={src}
          alt={alt || ''}
          width={width} // Keep width/height attributes if they exist for semantics/SSR
          height={height}
          style={parsedStyles as React.CSSProperties} // Apply the parsed style object, cast to CSSProperties
        />
      );
      break;
    }
    default: {
      console.warn(`Unsupported node type: ${node.type}`);
      element = undefined;
      break;
    }
  }

  return element;
}

export default function StructuredContentRenderer({
  node,
}: StructuredContentRendererProps) {
  if (!node) {
    return;
  }

  return <>{renderNode(node, 'root')}</>;
}
