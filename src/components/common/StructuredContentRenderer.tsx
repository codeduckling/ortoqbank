import React from 'react';

// Define a basic type for the content nodes.
// You might want to refine this based on all possible node types and attributes from your editor.
export interface ContentNode {
  type: string;
  text?: string;
  marks?: Array<{ type: string; [key: string]: any }>; // Allow additional mark attributes
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
    case 'listItem': {
      // List items render their children (which are often paragraphs)
      element = <li key={key}>{children}</li>;
      break;
    }
    case 'text': {
      // Apply marks to text nodes
      element = <>{node.text}</>;
      if (node.marks) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold': {
              element = <strong>{element}</strong>;
              break;
            }
            case 'italic': {
              element = <em>{element}</em>;
              break;
            }
            // Add cases for other marks like 'underline', 'strike', 'code', etc.
            default: {
              break;
            }
          }
        });
      }
      // Wrap in a span or fragment. Using Fragment as it doesn't add extra DOM nodes.
      // Key needs to be applied to the outermost element returned by the switch case
      // or handled by the caller mapping over renderNode. Let's apply key where element is assigned.
      return <React.Fragment key={key}>{element}</React.Fragment>;
    }
    case 'hardBreak': {
      element = <br key={key} />;
      break;
    }
    // Add cases for other node types you might have (e.g., headings, images, blockquotes)
    default: {
      console.warn(`Unsupported node type: ${node.type}`);
      // Render nothing or a placeholder for unsupported types
      element = undefined;
    }
  }

  // Return the element. If it's a simple type like text or br, the key was handled above.
  // For wrapper elements like p, ul, li, the key is applied directly.
  return element;
}

export default function StructuredContentRenderer({
  node,
}: StructuredContentRendererProps) {
  if (!node) {
    return;
  }

  // Render the root node (usually 'doc')
  return <>{renderNode(node, 'root')}</>;
}
