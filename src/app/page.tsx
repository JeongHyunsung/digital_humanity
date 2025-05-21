'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/index.json")
      .then((res) => res.json())
      .then(setFiles)
      .catch((err) => {
        console.error("❌ index.json 로드 실패:", err);
      });
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 감정 전파 그래프 시각화</h1>
      <ul className="list-disc pl-6 space-y-2">
        {files.map((file) => (
          <li key={file}>
            <Link href={`/emotion/${file}`} className="text-blue-600 underline">
              {file}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
