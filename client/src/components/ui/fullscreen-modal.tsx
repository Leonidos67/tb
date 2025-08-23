import React, { useEffect } from 'react';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  onClose,
  children
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл на body
      document.body.style.overflow = 'hidden';
      
      // Принудительно скрываем сайдбар и хедер
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      const header = document.querySelector('header');
      const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
      const sidebarContainer = document.querySelector('[data-sidebar="sidebar"]')?.parentElement;
      const sidebarWrapper = document.querySelector('[data-sidebar="sidebar"]')?.closest('.flex');
      
      if (sidebar) {
        (sidebar as HTMLElement).style.display = 'none';
        (sidebar as HTMLElement).style.position = 'absolute';
        (sidebar as HTMLElement).style.left = '-9999px';
        (sidebar as HTMLElement).style.width = '0';
        (sidebar as HTMLElement).style.pointerEvents = 'none';
      }
      if (sidebarContainer) {
        (sidebarContainer as HTMLElement).style.display = 'none';
        (sidebarContainer as HTMLElement).style.width = '0';
        (sidebarContainer as HTMLElement).style.pointerEvents = 'none';
      }
      if (sidebarWrapper) {
        (sidebarWrapper as HTMLElement).style.width = '0';
        (sidebarWrapper as HTMLElement).style.pointerEvents = 'none';
      }
      if (header) {
        (header as HTMLElement).style.display = 'none';
      }
      if (sidebarTrigger) {
        (sidebarTrigger as HTMLElement).style.display = 'none';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      
      // Восстанавливаем видимость сайдбара и хедера
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      const header = document.querySelector('header');
      const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]');
      const sidebarContainer = document.querySelector('[data-sidebar="sidebar"]')?.parentElement;
      const sidebarWrapper = document.querySelector('[data-sidebar="sidebar"]')?.closest('.flex');
      
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
        (sidebar as HTMLElement).style.position = '';
        (sidebar as HTMLElement).style.left = '';
        (sidebar as HTMLElement).style.width = '';
        (sidebar as HTMLElement).style.pointerEvents = '';
      }
      if (sidebarContainer) {
        (sidebarContainer as HTMLElement).style.display = '';
        (sidebarContainer as HTMLElement).style.width = '';
        (sidebarContainer as HTMLElement).style.pointerEvents = '';
      }
      if (sidebarWrapper) {
        (sidebarWrapper as HTMLElement).style.width = '';
        (sidebarWrapper as HTMLElement).style.pointerEvents = '';
      }
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      if (sidebarTrigger) {
        (sidebarTrigger as HTMLElement).style.display = '';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-0"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        pointerEvents: 'auto'
      }}
      onClick={(e) => {
        // Закрываем при клике на фон
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 
        Скругление углов модального окна контролируется классом "rounded-lg" 
        на div с классом "relative w-full h-full bg-white rounded-lg overflow-hidden"
        rounded-lg = border-radius: 0.5rem (8px)
      */}
      <div 
        className="relative w-full h-full bg-background rounded-lg overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Контент с отступами */}
        <div className="w-full h-full overflow-auto p-6" style={{ pointerEvents: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;
