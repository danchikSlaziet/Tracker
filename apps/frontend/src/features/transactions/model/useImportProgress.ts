import { create } from "zustand"

type TProgress = null | {
  percent: number
  stage: string
  importedCount?: number
  error?: string
}

interface IProgress {
  importProgress: TProgress,
  setImportProgress: (data: TProgress) => void
}

export const useImportProgress = create<IProgress>((set) => ({
  importProgress: null,
  setImportProgress: (data) => set({
    importProgress: data
  })
}))