type ArticleChildrenProps = {
  children: React.ReactNode;
  className?: string;
};

function withOptionalClassName(baseClassName: string, className?: string) {
  return className ? `${baseClassName} ${className}` : baseClassName;
}

export function ArticlePage({ children, className }: ArticleChildrenProps) {
  return (
    <section
      data-page-theme="text"
      className={withOptionalClassName(
        "mx-auto mt-4 max-w-[700px] text-[#3a3a3a] sm:mt-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
