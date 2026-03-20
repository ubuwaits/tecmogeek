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
        "mx-auto mt-4 max-w-[700px] text-[#3a3a3a] [text-shadow:0_1px_0_#fff] sm:mt-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ArticleTitle({ children, className }: ArticleChildrenProps) {
  return (
    <h1
      className={withOptionalClassName(
        "font-(family-name:--font-tecmo) text-[23px] leading-[0.95] uppercase text-balance text-[#3a3a3a] sm:text-[36px] sm:leading-[40px]",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function ArticleParagraph({ children, className }: ArticleChildrenProps) {
  return (
    <p
      className={withOptionalClassName(
        "mb-4 text-[17px] leading-[1.6] text-pretty text-[#3a3a3a] sm:text-[18px] sm:leading-[1.5]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function ArticleCaption({ children, className }: ArticleChildrenProps) {
  return (
    <p className={withOptionalClassName("text-[13px] text-[#626262] sm:text-[14px]", className)}>
      {children}
    </p>
  );
}
