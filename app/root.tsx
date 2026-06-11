import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import { DEFAULT_LOCALE, getLocaleFromRequest } from "~/i18n/config";
import { LocaleProvider } from "~/i18n/context";
import "./app.css";

export const loader = ({ request }: Route.LoaderArgs) => ({
  locale: getLocaleFromRequest(request),
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap",
  },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const data = useRouteLoaderData<typeof loader>("root");
  const locale = data?.locale ?? DEFAULT_LOCALE;

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F172A" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-900 text-slate-100">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App = () => {
  return <Outlet />;
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 max-w-[960px] mx-auto text-slate-100">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-surface rounded-lg">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
};

export default App;
