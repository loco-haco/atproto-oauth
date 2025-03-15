// page.jsx
'use client'
import OAuthComponent from './OAuthComponent';

declare global {
  interface Window {
    login: () => Promise<void>;
  }
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>bsky oauth example</h1>
        <input type="text" id="username" placeholder="you.bsky.social" />
        <button id="login" onClick={async () => {
          if (window.login) {
            await window.login();
          }
        }}>
          login
        </button>
        <div id="following"></div>
        <OAuthComponent />
      </main>
    </div>
  );
}