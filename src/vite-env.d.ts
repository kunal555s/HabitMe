/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOGGER_API_KEY: string
  readonly VITE_BLOGGER_BLOG_ID: string
  readonly VITE_GROQ_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
