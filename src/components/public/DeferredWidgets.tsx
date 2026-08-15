"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("./ChatWidget").then((m) => m.ChatWidget), { ssr: false });
const PromoPopup = dynamic(() => import("./PromoPopup").then((m) => m.PromoPopup), { ssr: false });

export function DeferredWidgets() {
  return (
    <>
      <ChatWidget />
      <PromoPopup />
    </>
  );
}
