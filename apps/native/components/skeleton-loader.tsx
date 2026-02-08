import { SkeletonGroup } from "heroui-native";
import { Fragment } from "react";

type SkeletonLoaderProps = {
  isLoading: boolean;
  children?: React.ReactNode;
  className?: string;
  repeat?: number;
};

export const SkeletonLoader = ({
  isLoading,
  children,
  repeat = 1,
  className,
}: SkeletonLoaderProps) => {
  return (
    <SkeletonGroup isLoading={isLoading} className={className}>
      {Array.from({ length: repeat }).map((_, index) => (
        <Fragment key={index}>{children}</Fragment>
      ))}
    </SkeletonGroup>
  );
};
