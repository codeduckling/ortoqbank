import { Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';

const Button = ({
  onClick,
  isActive,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 ${isActive ? 'rounded-md bg-violet-500 text-white' : ''}`}
  >
    {children}
  </button>
);

export default function TextEditorMenuBar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) return;

  const buttons = [
    {
      icon: <Bold className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <Underline className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <Italic className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    {
      icon: <Strikethrough className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      disabled: !editor.can().chain().focus().toggleStrike().run(),
    },
    {
      icon: <Code className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      disabled: !editor.can().chain().focus().toggleCode().run(),
    },
    {
      icon: <List className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="h-5 w-5" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      disabled: !editor.can().chain().focus().toggleOrderedList().run(),
    },
    {
      icon: <Undo className="h-5 w-5" />,
      onClick: () => editor.chain().focus().undo().run(),
      isActive: editor.isActive('undo'),
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      icon: <Redo className="h-5 w-5" />,
      onClick: () => editor.chain().focus().redo().run(),
      isActive: editor.isActive('redo'),
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className="mb-2 flex space-x-2">
      {buttons.map(({ icon, onClick, isActive, disabled }, index) => (
        <Button
          key={index}
          onClick={onClick}
          isActive={isActive}
          disabled={disabled}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}
