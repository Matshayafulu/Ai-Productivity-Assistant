import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders AI markdown with readable, app-consistent typography. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mt-5 mb-2 text-base font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mt-5 mb-2 text-base font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 text-sm font-semibold text-foreground first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mt-2 leading-relaxed text-foreground first:mt-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 marker:text-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-secondary px-1.5 py-0.5 text-[13px] text-foreground">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="mt-3 w-full overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-secondary">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-border px-3 py-2 text-xs font-semibold tracking-wide text-foreground uppercase">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-3 py-2 align-top text-foreground">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
