import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { Cell } from "../../app/types";

describe("DeleteConfirmDialog", () => {
  const mockCell: Cell = {
    id: "1",
    label: "Test Branch",
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    parentId: null,
    childrenIds: [],
  };

  const mockProps = {
    cell: mockCell,
    descendantCount: 0,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dialog with correct branch name", () => {
    render(<DeleteConfirmDialog {...mockProps} />);
    expect(screen.getByText(/Test Branch/)).toBeInTheDocument();
  });

  it("shows descendant warning when there are descendants", () => {
    render(<DeleteConfirmDialog {...mockProps} descendantCount={2} />);
    expect(
      screen.getByText(/This will also delete 2 descendant branches/)
    ).toBeInTheDocument();
  });

  it("does not show descendant warning when there are no descendants", () => {
    render(<DeleteConfirmDialog {...mockProps} />);
    expect(screen.queryByText(/This will also delete/)).not.toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", () => {
    render(<DeleteConfirmDialog {...mockProps} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button is clicked", () => {
    render(<DeleteConfirmDialog {...mockProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
