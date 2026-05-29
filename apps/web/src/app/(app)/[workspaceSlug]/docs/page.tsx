export default function DocsIndexPage() {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div className="max-w-sm space-y-3">
        <p className="text-5xl">📄</p>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Your workspace docs
        </h2>
        <p className="text-sm text-neutral-500">
          Select a page from the sidebar, or create a new one to start writing.
        </p>
      </div>
    </div>
  );
}
