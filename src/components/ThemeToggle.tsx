type Theme = "light" | "dark";

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-md border border-posthog-border bg-posthog-light-sage px-3 py-2 text-sm font-semibold text-posthog-ink transition hover:text-posthog-orange dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}

export default ThemeToggle;
