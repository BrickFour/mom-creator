import { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { MobileBottomNav } from './MobileBottomNav.jsx';
import { BackendStatusBanner } from '../common/BackendStatusBanner.jsx';
import { ChangePasswordModal } from '../auth/ChangePasswordModal.jsx';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal.jsx';
import { WorkspaceSettingsModal } from '../workspace/WorkspaceSettingsModal.jsx';

export function AppLayout({
  currentPath,
  onNavigate,
  breadcrumbs = [],
  onOpenCreateMeeting,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex-col">
      {/* Top Backend Warmup & Health Banner */}
      <BackendStatusBanner />

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0">
          <Sidebar
            currentPath={currentPath}
            onNavigate={onNavigate}
            onOpenCreateWorkspace={() => setCreateWorkspaceOpen(true)}
            onOpenWorkspaceSettings={() => setWorkspaceSettingsOpen(true)}
            onOpenChangePassword={() => setChangePasswordOpen(true)}
          />
        </div>

        {/* Mobile Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                currentPath={currentPath}
                onNavigate={onNavigate}
                onOpenCreateWorkspace={() => {
                  setMobileMenuOpen(false);
                  setCreateWorkspaceOpen(true);
                }}
                onOpenWorkspaceSettings={() => {
                  setMobileMenuOpen(false);
                  setWorkspaceSettingsOpen(true);
                }}
                onOpenChangePassword={() => {
                  setMobileMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                isMobile
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            breadcrumbs={breadcrumbs}
            onOpenCreateMeeting={onOpenCreateMeeting}
          />
          {/* Main Content with bottom padding on mobile for MobileBottomNav */}
          <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        onOpenCreateMeeting={onOpenCreateMeeting}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
      />

      {/* Modals */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />
      <WorkspaceSettingsModal
        isOpen={workspaceSettingsOpen}
        onClose={() => setWorkspaceSettingsOpen(false)}
      />
    </div>
  );
}

