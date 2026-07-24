/** Centered content column shared by every page. */
export default function Page({ className = '', children }) {
  return (
    <main className={`mx-auto w-full max-w-[880px] flex-1 px-6 pb-24 sm:px-8 ${className}`}>
      {children}
    </main>
  );
}
