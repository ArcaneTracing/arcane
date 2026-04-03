import React from "react"
import { render, screen } from "@testing-library/react"
import { render as customRender } from "@/__tests__/test-utils"
import ExperimentDetailPage from "../page"

const mockUseParams = global.mockUseParams as jest.Mock
const mockNavigate = global.mockNavigate as jest.Mock

jest.mock("@/api/experiments", () => ({
  experimentsApi: {
    get: jest.fn(),
  },
}))

jest.mock("@/api/prompts", () => ({
  promptsApi: {
    getVersionById: jest.fn(),
  },
}))

jest.mock("@/api/datasets", () => ({
  datasetsApi: {
    getById: jest.fn(),
  },
}))

jest.mock("@/hooks/experiments/use-experiments-query", () => ({
  useDeleteExperiment: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useRerunExperiment: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}))

jest.mock("@/components/experiments/results/experiment-results-list", () => ({
  ExperimentResultsList: () => <div data-testid="experiment-results-list">Results</div>,
}))

describe("ExperimentDetailPage", () => {
  const { experimentsApi } = require("@/api/experiments")

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({
      projectId: "p1",
      organisationId: "o1",
      experimentId: "exp1",
    })
    mockNavigate.mockClear()
  })

  it("shows loading state when fetching experiment", async () => {
    experimentsApi.get.mockImplementation(() => new Promise(() => {}))
    customRender(<ExperimentDetailPage />)
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument()
  })

  it("shows error when experiment fetch fails", async () => {
    experimentsApi.get.mockRejectedValue(new Error("Failed to load"))
    customRender(<ExperimentDetailPage />)
    const errorMessage = await screen.findByText(/error:/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it("shows Experiment not found when experiment is null", async () => {
    experimentsApi.get.mockResolvedValue(null)
    customRender(<ExperimentDetailPage />)
    const notFound = await screen.findByText(/experiment not found/i)
    expect(notFound).toBeInTheDocument()
  })

  it("shows experiment details when loaded successfully", async () => {
    experimentsApi.get.mockResolvedValue({
      id: "exp1",
      name: "Test Experiment",
      description: "A test",
      promptVersionId: "pv1",
      datasetId: "ds1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      results: [],
    })
    const { promptsApi } = require("@/api/prompts")
    const { datasetsApi } = require("@/api/datasets")
    promptsApi.getVersionById.mockResolvedValue({ promptName: "Prompt 1", promptId: "prompt1" })
    datasetsApi.getById.mockResolvedValue({ id: "ds1", name: "Dataset 1" })

    customRender(<ExperimentDetailPage />)
    const name = await screen.findByText("Test Experiment")
    expect(name).toBeInTheDocument()
  })
})
