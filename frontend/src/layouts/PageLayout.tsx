export const PageLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <main className="relative z-10">{children}</main>
    </div>
  );
};
