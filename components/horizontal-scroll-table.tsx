type HorizontalScrollTableProps = {
  children: React.ReactNode;
  testId?: string;
};

export function HorizontalScrollTable({ children, testId }: HorizontalScrollTableProps) {
  return (
    <div className="overflow-x-auto overscroll-x-contain pb-2" data-testid={testId}>
      <ol className="w-max min-w-full space-y-4 sm:w-full sm:min-w-0 sm:space-y-3">
        {children}
      </ol>
    </div>
  );
}
