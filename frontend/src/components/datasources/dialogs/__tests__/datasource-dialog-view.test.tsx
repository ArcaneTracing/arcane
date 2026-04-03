import React from "react"
import { render, screen } from "@testing-library/react"
import { DatasourceDialogView } from "../datasource-dialog-view"
import { DatasourceSource } from "@/types/enums"
import { render as customRender } from "@/__tests__/test-utils"

function createFormMock(overrides: Partial<Parameters<typeof DatasourceDialogView>[0]["form"]> = {}) {
  return {
    name: "",
    setName: () => {},
    description: "",
    setDescription: () => {},
    url: "",
    setUrl: () => {},
    source: "" as DatasourceSource | "",
    setSource: () => {},
    clickhouseConfig: {},
    setClickhouseConfig: () => {},
    validationErrors: {},
    clearValidation: () => {},
    validateForm: () => true,
    handleSubmit: (e: React.FormEvent) => e.preventDefault(),
    isSubmitting: false,
    isEditMode: false,
    ...overrides,
  }
}

function createMutationMock() {
  return {
    error: null,
    isPending: false,
    isSuccess: false,
    isError: false,
    mutate: () => {},
    mutateAsync: () => Promise.resolve(),
    reset: () => {},
    data: undefined,
    status: "idle" as const,
    isIdle: true,
  }
}

describe("DatasourceDialogView", () => {
  const defaultProps = {
    open: true,
    onOpenChange: () => {},
    form: createFormMock(),
    busy: false,
    mutation: createMutationMock(),
  }

  it("renders create mode title when datasource is undefined", () => {
    customRender(<DatasourceDialogView {...defaultProps} />)
    expect(screen.getByText("Add a New Data Source")).toBeInTheDocument()
  })

  it("renders edit mode title when datasource is provided", () => {
    customRender(
      <DatasourceDialogView
        {...defaultProps}
        datasource={{
          id: "1",
          name: "DS",
          description: "",
          url: "",
          type: "TRACES" as any,
          source: DatasourceSource.TEMPO,
        }}
      />
    )
    expect(screen.getByText("Refine Your Data Stream")).toBeInTheDocument()
  })

  it("renders form fields", () => {
    customRender(<DatasourceDialogView {...defaultProps} />)
    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description$/i)).toBeInTheDocument()
    expect(screen.getByText("Source")).toBeInTheDocument()
  })

  it("renders Cancel and Create Data Source when not edit mode", () => {
    customRender(<DatasourceDialogView {...defaultProps} />)
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Create Data Source$/i })).toBeInTheDocument()
  })
})
