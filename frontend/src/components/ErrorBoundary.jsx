import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">{this.state.error.message}</p>
          <button
            className="text-sm mt-2 underline"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
