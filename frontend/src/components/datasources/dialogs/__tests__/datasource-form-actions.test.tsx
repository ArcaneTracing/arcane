import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { DatasourceFormActions } from "../datasource-form-actions"
import { render as customRender } from "@/__tests__/test-utils"

describe("DatasourceFormActions", () => {
  const onCancel = jest.fn()

  const defaultProps = {
    isEditMode: false,
    busy: false,
    onCancel,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders Cancel and Create Data Source when create mode and not busy", () => {
    customRender(<DatasourceFormActions {...defaultProps} />)
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Create Data Source$/i })).toBeInTheDocument()
  })

  it("renders Update Data Source when edit mode and not busy", () => {
    customRender(<DatasourceFormActions {...defaultProps} isEditMode />)
    expect(screen.getByRole("button", { name: /^Update Data Source$/i })).toBeInTheDocument()
  })

  it("calls onCancel when Cancel is clicked", () => {
    customRender(<DatasourceFormActions {...defaultProps} />)
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("Cancel is type=button", () => {
    customRender(<DatasourceFormActions {...defaultProps} />)
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toHaveAttribute("type", "button")
  })

  it("Submit is type=submit", () => {
    customRender(<DatasourceFormActions {...defaultProps} />)
    expect(screen.getByRole("button", { name: /^Create Data Source$/i })).toHaveAttribute(
      "type",
      "submit"
    )
  })

  it("shows Creating... and loader when busy in create mode", () => {
    customRender(<DatasourceFormActions {...defaultProps} busy />)
    expect(screen.getByText("Creating...")).toBeInTheDocument()
    expect(screen.getByTestId("icon-loader2")).toBeInTheDocument()
  })

  it("shows Updating... when busy in edit mode", () => {
    customRender(<DatasourceFormActions {...defaultProps} isEditMode busy />)
    expect(screen.getByText("Updating...")).toBeInTheDocument()
  })

  it("disables both buttons when busy", () => {
    customRender(<DatasourceFormActions {...defaultProps} busy />)
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /Creating\.\.\./i })).toBeDisabled()
  })
})
