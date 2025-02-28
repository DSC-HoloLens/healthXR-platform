"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = (entry: string) => {
    setHistory((prev) => [...prev, entry]);
  };

  return (
    <div className="grid grid-cols-[200px_1fr] min-h-screen p-4 gap-4">
      {/* History Bar */}
      <div className="bg-gray-100 p-4 space-y-2">
        <h2 className="text-xl font-bold">History</h2>
        <ul>
          {history.length > 0 ? (
            history.map((entry, index) => (
              <li key={index} className="text-blue-500">{entry}</li>
            ))
          ) : (
            <li className="text-gray-500">No history</li>
          )}
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <h1 className="text-3xl font-bold">Welcome to the Chat Page</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => addToHistory("Chat Page visited")}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Visit Chat Page
          </button>
          <Link href="/addTestData" passHref>
            <button className="bg-green-500 text-white p-2 rounded">
              Add Test Data
            </button>
          </Link>
          <Link href="/dashboard" passHref>
            <button className="bg-red-500 text-white p-2 rounded">
              Dashboard
            </button>
          </Link>
        </div>
        {/* Integration with ChatGPT API can be expanded here */}
      </div>
    </div>
  );
}
