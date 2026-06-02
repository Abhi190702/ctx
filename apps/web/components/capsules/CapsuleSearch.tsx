import { Search } from "lucide-react";

export function CapsuleSearch({
  defaultValue = "",
  defaultPlatform = "",
  defaultTag = "",
  defaultStatus = "active"
}: {
  defaultValue?: string;
  defaultPlatform?: string;
  defaultTag?: string;
  defaultStatus?: string;
}) {
  return (
    <form action="/capsules" className="mb-6 grid gap-3 md:grid-cols-[1fr_160px_160px_160px]">
      <label className="sr-only" htmlFor="capsule-search">
        Search Capsules
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" />
        <input
          id="capsule-search"
          name="q"
          type="search"
          autoComplete="off"
          defaultValue={defaultValue}
          placeholder="Search title, summary, raw text..."
          className="h-10 w-full rounded-xl border border-line bg-panel pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
        />
      </div>
      <label className="sr-only" htmlFor="platform-filter">
        Platform
      </label>
      <select
        id="platform-filter"
        name="platform"
        defaultValue={defaultPlatform}
        className="h-10 rounded-xl border border-line bg-panel px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
      >
        <option value="">All Platforms</option>
        <option value="chatgpt">ChatGPT</option>
        <option value="claude">Claude</option>
        <option value="gemini">Gemini</option>
        <option value="github">GitHub</option>
        <option value="cursor">Cursor</option>
        <option value="manual">Manual</option>
      </select>
      <label className="sr-only" htmlFor="tag-filter">
        Tag
      </label>
      <input
        id="tag-filter"
        name="tag"
        type="search"
        autoComplete="off"
        defaultValue={defaultTag}
        placeholder="Tag..."
        className="h-10 rounded-xl border border-line bg-panel px-3 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
      />
      <label className="sr-only" htmlFor="status-filter">
        Status
      </label>
      <select
        id="status-filter"
        name="status"
        defaultValue={defaultStatus}
        className="h-10 rounded-xl border border-line bg-panel px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="all">All Statuses</option>
      </select>
    </form>
  );
}
