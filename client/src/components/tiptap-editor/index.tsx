import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Начните писать...",
  className 
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#FFC0CB', '#A52A2A', '#808080', '#FFD700'
  ];

  const toggleFormat = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      case 'orderedList':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link':
        if (selectedText && linkUrl) {
          formattedText = `[${selectedText}](${linkUrl})`;
          setIsLinkModalOpen(false);
          setLinkUrl('');
          setLinkText('');
        }
        return;
      case 'color':
        if (selectedText) {
          formattedText = `<span style="color: ${selectedColor}">${selectedText}</span>`;
        }
        return;
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    onChange(newContent);
    
    // Установить курсор после вставленного текста
    setTimeout(() => {
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      textarea.focus();
    }, 0);
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result as string;
          const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
          if (textarea) {
            const start = textarea.selectionStart;
            const imageMarkdown = `![${file.name}](${imageUrl})`;
            const newContent = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(start);
            onChange(newContent);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const insertVideo = () => {
    const videoUrl = prompt('Введите URL видео:');
    if (videoUrl) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const videoMarkdown = `![video](${videoUrl})`;
        const newContent = textarea.value.substring(0, start) + videoMarkdown + textarea.value.substring(start);
        onChange(newContent);
      }
    }
  };

  const insertLink = () => {
    if (linkText && linkUrl) {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const linkMarkdown = `[${linkText}](${linkUrl})`;
        const newContent = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(start);
        onChange(newContent);
        setIsLinkModalOpen(false);
        setLinkUrl('');
        setLinkText('');
      }
    }
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    onClick, 
    isActive = false, 
    title 
  }: { 
    icon: any; 
    onClick: () => void; 
    isActive?: boolean; 
    title: string; 
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-accent text-accent-foreground"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Панель инструментов */}
      <Card className="p-2">
        <div className="flex flex-wrap gap-1">
          <ToolbarButton
            icon={Bold}
            onClick={() => toggleFormat('bold')}
            title="Жирный"
          />
          <ToolbarButton
            icon={Italic}
            onClick={() => toggleFormat('italic')}
            title="Курсив"
          />
          <ToolbarButton
            icon={Underline}
            onClick={() => toggleFormat('underline')}
            title="Подчеркнутый"
          />
          <ToolbarButton
            icon={Strikethrough}
            onClick={() => toggleFormat('strikethrough')}
            title="Зачеркнутый"
          />
          <ToolbarButton
            icon={Code}
            onClick={() => toggleFormat('code')}
            title="Код"
          />
          <ToolbarButton
            icon={Quote}
            onClick={() => toggleFormat('quote')}
            title="Цитата"
          />
          <ToolbarButton
            icon={List}
            onClick={() => toggleFormat('list')}
            title="Маркированный список"
          />
          <ToolbarButton
            icon={ListOrdered}
            onClick={() => toggleFormat('orderedList')}
            title="Нумерованный список"
          />
          <ToolbarButton
            icon={AlignLeft}
            onClick={() => toggleFormat('alignLeft')}
            title="По левому краю"
          />
          <ToolbarButton
            icon={AlignCenter}
            onClick={() => toggleFormat('alignCenter')}
            title="По центру"
          />
          <ToolbarButton
            icon={AlignRight}
            onClick={() => toggleFormat('alignRight')}
            title="По правому краю"
          />
          <ToolbarButton
            icon={AlignJustify}
            onClick={() => toggleFormat('alignJustify')}
            title="По ширине"
          />
          <ToolbarButton
            icon={ImageIcon}
            onClick={insertImage}
            title="Вставить изображение"
          />
          <ToolbarButton
            icon={Video}
            onClick={insertVideo}
            title="Вставить видео"
          />
          <ToolbarButton
            icon={LinkIcon}
            onClick={() => setIsLinkModalOpen(true)}
            title="Вставить ссылку"
          />
          <ToolbarButton
            icon={Palette}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Цвет текста"
          />
        </div>

        {/* Выбор цвета */}
        {showColorPicker && (
          <div className="mt-2 p-2 border rounded bg-background">
            <Label className="text-sm font-medium mb-2 block">Выберите цвет:</Label>
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    toggleFormat('color');
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Редактор */}
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] resize-none font-mono text-sm"
      />

      {/* Модальное окно для ссылки */}
      {isLinkModalOpen && (
        <Card className="p-4 space-y-3">
          <div>
            <Label htmlFor="linkText">Текст ссылки:</Label>
            <Input
              id="linkText"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Текст ссылки"
            />
          </div>
          <div>
            <Label htmlFor="linkUrl">URL:</Label>
            <Input
              id="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={insertLink} disabled={!linkText || !linkUrl}>
              Вставить
            </Button>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              Отмена
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TipTapEditor;
