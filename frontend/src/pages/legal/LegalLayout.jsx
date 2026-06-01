import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, Scale } from "lucide-react";

const LegalLayout = ({ title, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)]">
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-xl flex items-center justify-center shadow-lg">
            <Scale className="w-5 h-5 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-primary)]">
            {title}
          </h1>
        </div>
        <NavLink
          to="/"
          className="flex items-center gap-2 text-[var(--color-gray)] hover:text-[var(--color-primary)] hover:bg-white/50 px-4 py-2 rounded-xl transition-all duration-300 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </NavLink>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-xl prose prose-sm max-w-none text-[var(--color-primary)]
        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-[var(--color-primary)]
        [&_p]:text-[var(--color-gray)] [&_p]:mb-3 [&_p]:leading-relaxed
        [&_ul]:text-[var(--color-gray)] [&_ul]:mb-3 [&_ul]:pl-5 [&_ul]:space-y-1
        [&_li]:list-disc
        [&_a]:text-[var(--color-primary)] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[var(--color-gold)]
        [&_strong]:text-[var(--color-primary)]">
        {children}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs text-[var(--color-gray)]">
        <NavLink to="/mentions-legales" className="hover:text-[var(--color-primary)] transition-colors">Mentions légales</NavLink>
        <NavLink to="/confidentialite" className="hover:text-[var(--color-primary)] transition-colors">Confidentialité</NavLink>
        <NavLink to="/cgu" className="hover:text-[var(--color-primary)] transition-colors">CGU</NavLink>
      </div>
    </div>
  </div>
);

export default LegalLayout;
