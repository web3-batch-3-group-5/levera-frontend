import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 p-6 border-t border-b border-gray-100 bg-white text-center">
      <p className="text-gray-800">
        Made with ❤️ by the{' '}
        <Link
          href="/"
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Levera
        </Link>{' '}
        team ©{new Date().getFullYear()} All rights reserved.
      </p>
    </footer>
  );
}