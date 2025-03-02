import { PropsWithChildren } from "react";

export default function SourceLayout({children}: PropsWithChildren) {
  return (
    <div className="px-4">{children}</div>
  )
}