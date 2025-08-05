"use client";

import { useContext } from "react";
import {
  LayoutDashboard,
  Library,
  Briefcase,
  BookOpen,
  LogOut,
  LinkIcon,
} from "lucide-react";
import { AppContext } from "../../context/app-context";

export const Header = () => {
  const { navigateTo, view, logout }: any = useContext(AppContext);

  const NavLink = ({ targetView, icon: Icon, children }) => (
    <button
      onClick={() => navigateTo(targetView)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        view === targetView
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-200"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </button>
  );

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img
              src="https://hr.vaidikedu.com/logo.png"
              alt="Edu Platform Logo"
              className="h-[8rem] "
            />
          </div>

          <nav className="flex items-center gap-2">
            <NavLink targetView="dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink targetView="library" icon={Library}>
              Resource Library
            </NavLink>
            <NavLink targetView="courses" icon={Briefcase}>
              Course Builder
            </NavLink>
            <NavLink targetView="linkResources" icon={LinkIcon}>
              Link Resources
            </NavLink>
            <NavLink targetView="assignments" icon={BookOpen}>
              Assignments
            </NavLink>
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};
