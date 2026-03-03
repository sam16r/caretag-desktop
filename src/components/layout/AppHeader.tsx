import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Search, ScanLine, Command, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/hooks/useI18n';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '@/components/shortcuts/KeyboardShortcutsModal';
import { useActiveSessions } from '@/hooks/useAccessSession';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export function AppHeader() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const shortcuts = useKeyboardShortcuts(() => setShortcutsOpen(true));
  const { data: activeSessions } = useActiveSessions();

  const hasActiveSession = activeSessions && activeSessions.length > 0;
  const currentSession = hasActiveSession ? activeSessions[0] : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Removed static notifications — now using NotificationDropdown

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-4 lg:px-6" role="banner">
      <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label={t('a11y.toggle_sidebar')} />

      <div className="h-5 w-px bg-border hidden md:block" />

      {/* Active Session Indicator */}
      {hasActiveSession && currentSession && (
        <div 
          onClick={() => navigate(`/patients/${currentSession.patient_id}`)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
        >
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-destructive" />
            <span className="text-sm font-medium text-destructive truncate max-w-[120px] lg:max-w-[180px]">
              {currentSession.patients?.full_name || 'Patient'}
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-destructive/30 text-destructive">
            Active
          </Badge>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t('a11y.search_patients') + '...'}
            aria-label={t('a11y.search_patients')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 h-9 bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">K</kbd>
          </div>
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Scan Button - disabled when session active */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => !hasActiveSession && navigate('/scan')}
          className={`gap-2 hidden lg:flex ${hasActiveSession ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={hasActiveSession}
        >
          {hasActiveSession ? (
            <>
              <Lock className="h-4 w-4" />
              Scan
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" />
              Scan
            </>
          )}
        </Button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Keyboard Shortcuts */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShortcutsOpen(true)}
          className="hidden md:flex h-8 w-8"
        >
          <Command className="h-4 w-4" />
        </Button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8"
          aria-label={t('a11y.toggle_theme')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        shortcuts={shortcuts}
      />
    </header>
  );
}