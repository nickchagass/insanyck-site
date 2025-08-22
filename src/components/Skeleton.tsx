// INSANYCK STEP 9 — Skeletons reutilizáveis (sem clsx)
"use client";
import React from "react";

type BaseProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Compound = React.FC<BaseProps> & {
  Text: React.FC<BaseProps>;
  TextLg: React.FC<BaseProps>;
  Thumb: React.FC<BaseProps>;
};

const Skeleton = (({ className, ...rest }: BaseProps) => {
  return <div className={cx("skl", className)} aria-hidden {...rest} />;
}) as Compound;

Skeleton.Text = function Text({ className, ...rest }: BaseProps) {
  return <div className={cx("skl skl--text", className)} aria-hidden {...rest} />;
};
Skeleton.TextLg = function TextLg({ className, ...rest }: BaseProps) {
  return <div className={cx("skl skl--text-lg", className)} aria-hidden {...rest} />;
};
Skeleton.Thumb = function Thumb({ className, ...rest }: BaseProps) {
  return <div className={cx("skl skl--thumb", className)} aria-hidden {...rest} />;
};

export default Skeleton;
