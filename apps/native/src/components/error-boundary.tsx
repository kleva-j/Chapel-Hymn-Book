import { Component, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * Reusable React error boundary.
 *
 * Renders a recovery UI in place of a subtree that threw during render or
 * from a lifecycle method. The user can tap "Try again" to re-mount the
 * subtree with the boundary's state reset. Errors from event handlers,
 * async callbacks, and setTimeout do not surface here — React only catches
 * render / effect throws — but that covers the largest class of accidental
 * crashes (bad hook order, undefined access in a render).
 *
 * Not a hook because there is no functional-component error-boundary
 * primitive in React yet; a class remains the canonical impl.
 */
export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  /**
   * Optional short label describing which subtree failed — surfaced above
   * the error message so a user knows what area is broken (`Home`, `Hymn
   * detail`, `Settings`, …). Defaults to a generic copy.
   */
  readonly label?: string;
  /**
   * Optional callback fired after `getDerivedStateFromError` — useful for
   * routing the error into a telemetry pipeline once one exists.
   */
  readonly onError?: (error: Error, info: { componentStack?: string }) => void;
  /**
   * When any value in this array changes, the boundary auto-resets. Handy
   * for boundaries wrapping route params — a nav change should give the
   * new screen a fresh try rather than showing yesterday's error.
   */
  readonly resetKeys?: ReadonlyArray<unknown>;
}

interface ErrorBoundaryState {
  readonly error: Error | undefined;
}

const INITIAL_STATE: ErrorBoundaryState = { error: undefined };

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = INITIAL_STATE;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }): void {
    this.props.onError?.(error, info);
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error(
        `[ErrorBoundary${this.props.label ? ` · ${this.props.label}` : ""}]`,
        error,
        info.componentStack,
      );
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset the boundary when any resetKey changes so a fresh navigation
    // isn't stuck showing the previous screen's error.
    const prevKeys = prevProps.resetKeys ?? [];
    const nextKeys = this.props.resetKeys ?? [];
    if (
      this.state.error !== undefined &&
      (prevKeys.length !== nextKeys.length ||
        prevKeys.some((k, i) => k !== nextKeys[i]))
    ) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState(INITIAL_STATE);
  };

  render(): ReactNode {
    if (this.state.error === undefined) return this.props.children;
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <View className="items-center">
          <Text className="text-foreground text-lg font-semibold mb-2 text-center">
            Something went wrong
            {this.props.label ? ` in ${this.props.label.toLowerCase()}` : ""}.
          </Text>
          <Text className="text-muted text-sm text-center mb-4">
            The app hit an unexpected error rendering this screen. Tap Try
            again to reload the section.
          </Text>
          {__DEV__ ? (
            <ScrollView className="max-h-40 w-full mb-4">
              <Text className="text-muted text-xs font-mono">
                {this.state.error.message}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
              </Text>
            </ScrollView>
          ) : null}
          <Pressable
            onPress={this.reset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            hitSlop={12}
            className="px-5 py-2.5 bg-accent rounded-lg active:opacity-70"
          >
            <Text className="text-accent-foreground text-sm font-semibold uppercase tracking-widest">
              Try again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
