/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import DOMPurify from "isomorphic-dompurify";
import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface Block {
  id: string;
  type: "paragraph" | "image" | "video";
  value: string;
}

function getYouTubeId(url: string) {
  return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
}

export default function BlogContentRenderer({ blocks }: { blocks: Block[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!Array.isArray(blocks)) return null;

  const handleVideoClick = (url: string) => {
    if (url) {
      setVideoUrl(url);
      setIsOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          const clean = DOMPurify.sanitize(block.value || "");
          return (
            <div
              key={block.id}
              className="prose-content leading-relaxed text-ink [&_a]:text-accent [&_a]:underline [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
              dangerouslySetInnerHTML={{ __html: clean }}
            />
          );
        }
        if (block.type === "image" && block.value) {
          return (
            <Image
              width={704}
              height={704}
              key={block.id}
              src={block.value}
              alt=""
              className="w-full rounded-lg"
            />
          );
        }
        if (block.type === "video") {
          const ytId = getYouTubeId(block.value || "");
          const thumbnailUrl = ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : "/images/placeholder.webp";

          return (
            <div key={block.id} className="my-4">
              <div
                onClick={() => handleVideoClick(block.value)}
                className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-md transition-all hover:border-accent/50 hover:shadow-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="YouTube video thumbnail"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                    <svg
                      className="ml-1 h-6 w-6 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Render Modal via Portal directly into document.body to escape parent clipping/overflow/transform */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ReactPlayer
                src={videoUrl}
                playing
                controls
                width="100%"
                height="100%"
              />
              <button
                className="absolute cursor-pointer inset-0 text-red-500 hover:text-red-700 transition-colors bg-white/75 md:w-10 md:h-10 h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-md z-50"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
