"use client";

import { MathJaxContext } from "better-react-mathjax";

export default function MathJaxProvider({ children }) {
  return <MathJaxContext>{children}</MathJaxContext>;
}
