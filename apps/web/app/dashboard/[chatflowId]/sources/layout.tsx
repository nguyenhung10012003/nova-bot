import { PropsWithChildren } from "react";

export default function SourceLayout({children}: PropsWithChildren) {
  return <div className="md:px-8 px-6 pt-2 pb-8">{children}</div>;
}